import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { X, Send, Video, VideoOff, Phone, MessageCircle, Clock, Wallet, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useAuth } from '../../context/Auth';
import { API_BASE, SOCKET_URL } from '../../config/api';
import FreeTrialModal from './FreeTrialModal';
import ReviewModal from './ReviewModal';

interface Message {
  sender_id?: string;
  sender_role?: string;
  sender?: string;
  text: string;
  timestamp: string;
}

interface Consultation {
  _id: string;
  type: 'chat' | 'call' | 'video';
  status: string;
  user_id?: any;
  astrologer_id?: any;
  messages?: Message[];
  per_minute_rate?: number;
}

interface ConsultationRoomProps {
  consultation: Consultation;
  onClose: () => void;
  onComplete?: () => void;
}

export default function ConsultationRoom({ consultation, onClose, onComplete }: ConsultationRoomProps) {
  const { user, token, refreshUser } = useAuth();
  const consType = consultation.type;

  const [messages, setMessages] = useState<Message[]>(consultation.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState(consultation.status);
  const [loading, setLoading] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [freeMinutesLeft, setFreeMinutesLeft] = useState(user?.free_minutes_remaining ?? 5);
  const [walletBalance, setWalletBalance] = useState(user?.wallet_balance ?? 0);
  const [billedAmount, setBilledAmount] = useState(0);
  const [showFreeTrialEnd, setShowFreeTrialEnd] = useState(status === 'payment_required');
  const [typingUser, setTypingUser] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [wasRejected, setWasRejected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const isAstro = user?.role === 'astrologer';
  const isCaller = !isAstro;
  const roomId = consultation._id;
  const rate = consultation.per_minute_rate || 10;
  const astroId = typeof consultation.astrologer_id === 'object'
    ? consultation.astrologer_id?._id
    : consultation.astrologer_id;
  const astroName = typeof consultation.astrologer_id === 'object'
    ? consultation.astrologer_id?.full_name || 'Astrologer'
    : 'Astrologer';

  const headerColor = consType === 'chat'
    ? 'from-blue-600 to-sky-600'
    : consType === 'call'
    ? 'from-emerald-600 to-green-700'
    : 'from-purple-600 to-violet-700';

  const TypeIcon = consType === 'chat' ? MessageCircle : consType === 'call' ? Phone : Video;
  const typeLabel = consType === 'chat' ? 'Chat' : consType === 'call' ? 'Audio Call' : 'Video Call';

  useEffect(() => {
    const socket = io(SOCKET_URL || window.location.origin, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
    });
    socketRef.current = socket;
    socket.emit('join_room', roomId);

    socket.on('receive_message', (data: any) => {
      if (data.consultationId === roomId) setMessages(prev => [...prev, data.message]);
    });

    socket.on('consultation_status_update', (data: any) => {
      if (data.consultationId === roomId) {
        setStatus(data.status);
        if (data.status === 'payment_required') setShowFreeTrialEnd(true);
        if (data.status === 'active') setShowFreeTrialEnd(false);
        if (data.status === 'cancelled') {
          setWasRejected(true);
          endMedia();
        }
      }
    });

    socket.on('call_rejected', (data: any) => {
      if (data.consultationId === roomId) {
        setWasRejected(true);
        setStatus('cancelled');
        endMedia();
      }
    });

    socket.on('billing_tick', (data: any) => {
      if (data.consultationId === roomId) {
        setDurationSeconds(data.duration_seconds);
        setFreeMinutesLeft(data.free_minutes_remaining);
        setWalletBalance(data.wallet_balance);
        setBilledAmount(data.billed_amount);
        refreshUser();
      }
    });

    socket.on('free_trial_ended', () => setShowFreeTrialEnd(true));

    socket.on('typing_indicator', (data: any) => {
      if (data.consultationId === roomId) {
        setTypingUser(data.user);
        setTimeout(() => setTypingUser(''), 2000);
      }
    });

    if (consType === 'video' || consType === 'call') {
      socket.on('offer', async ({ offer }: any) => {
        if (!isAstro) return;
        try {
          await prepareCalleeMedia(consType === 'video');
          const pc = pcRef.current || createPeerConnection();
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { consultationId: roomId, answer });
        } catch (e) {
          console.error('Failed to answer call', e);
        }
      });

      socket.on('answer', async ({ answer }: any) => {
        if (!isCaller || !pcRef.current) return;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('ice_candidate', ({ candidate }: any) => {
        if (candidate && pcRef.current) pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      });
    }

    timerRef.current = setInterval(() => setDurationSeconds(s => s + 1), 1000);

    if (!isAstro && (consType === 'call' || consType === 'video')) {
      socket.emit('call_request', { consultationId: roomId, type: consType });
    }

    return () => {
      socket.emit('stop_billing', { consultationId: roomId });
      socket.emit('leave_room', roomId);
      socket.disconnect();
      endMedia();
      if (timerRef.current) clearInterval(timerRef.current);
      if (ringRef.current) clearInterval(ringRef.current);
    };
  }, [roomId, consType, isAstro]);

  // Ringing tone for caller while waiting
  useEffect(() => {
    if (isAstro || status !== 'pending' || consType === 'chat') {
      if (ringRef.current) clearInterval(ringRef.current);
      return;
    }
    const playRing = () => {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 480;
        gain.gain.value = 0.08;
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch { /* blocked */ }
    };
    playRing();
    ringRef.current = setInterval(playRing, 2500);
    return () => { if (ringRef.current) clearInterval(ringRef.current); };
  }, [status, consType, isAstro]);

  useEffect(() => {
    if (status === 'active' && socketRef.current) {
      socketRef.current.emit('start_billing', { consultationId: roomId });
      if (isCaller) {
        if (consType === 'video') startVideoCall();
        if (consType === 'call') startAudioCall();
      }
    }
  }, [status, roomId, consType, isCaller]);

  function createPeerConnection() {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice_candidate', { consultationId: roomId, candidate: event.candidate });
      }
    };
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      if (consType === 'call' && event.streams[0]) {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play().catch(() => {});
      }
    };
    pcRef.current = pc;
    return pc;
  }

  async function prepareCalleeMedia(withVideo: boolean) {
    if (localStreamRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: withVideo, audio: true });
    localStreamRef.current = stream;
    if (withVideo && localVideoRef.current) localVideoRef.current.srcObject = stream;
    const pc = pcRef.current || createPeerConnection();
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    setIsAudioOn(true);
    if (withVideo) setIsVideoOn(true);
  }

  async function startVideoCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const pc = pcRef.current || createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('offer', { consultationId: roomId, offer });
      setIsVideoOn(true);
      setIsAudioOn(true);
    } catch {
      alert('Camera/microphone access needed for video call.');
    }
  }

  async function startAudioCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      localStreamRef.current = stream;
      const pc = pcRef.current || createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('offer', { consultationId: roomId, offer });
      setIsAudioOn(true);
    } catch {
      alert('Microphone access needed for audio call.');
    }
  }

  function endMedia() {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    pcRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setIsVideoOn(false);
    setIsAudioOn(false);
  }

  function toggleMute() {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });
      setIsMuted(!isMuted);
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || consType !== 'chat') return;
    const msg = {
      text: newMessage.trim(),
      sender_id: user?.id,
      sender_role: user?.role,
      sender: user?.full_name,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    try {
      await fetch(`${API_BASE}/consultations/${roomId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: msg.text }),
      });
      socketRef.current?.emit('send_message', { consultationId: roomId, message: msg, sender: user?.full_name });
    } catch (e) {
      console.error('Failed to send message', e);
    }
  };

  const handleComplete = async () => {
    if (!confirm('End this session?')) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/consultations/${roomId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ duration_minutes: Math.ceil(durationSeconds / 60) }),
      });
      setStatus('completed');
      endMedia();
      if (!isAstro && astroId && token) {
        setShowReview(true);
      } else {
        onComplete?.();
      }
    } catch {
      alert('Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/consultations/${roomId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus('active');
      socketRef.current?.emit('start_billing', { consultationId: roomId });
      socketRef.current?.emit('consultation_status', { consultationId: roomId, status: 'active' });
      if (consType === 'video') await prepareCalleeMedia(true);
      if (consType === 'call') await prepareCalleeMedia(false);
    } catch {
      alert('Could not accept session');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentContinue = async () => {
    setShowFreeTrialEnd(false);
    setStatus('active');
    refreshUser();
    socketRef.current?.emit('start_billing', { consultationId: roomId });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const canInteract = status === 'active';

  return (
    <>
      {showReview && token && astroId && (
        <ReviewModal
          astrologerId={astroId}
          astrologerName={astroName}
          consultationId={roomId}
          consultationType={consType}
          token={token}
          onClose={() => { setShowReview(false); onComplete?.(); onClose(); }}
        />
      )}

      {showFreeTrialEnd && !isAstro && (
        <FreeTrialModal
          consultationId={roomId}
          type={consType}
          rate={rate}
          advanceAmount={rate * 5}
          onContinue={handlePaymentContinue}
          onClose={onClose}
        />
      )}

      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
        <div className={`w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col ${
          consType === 'chat' ? 'max-w-2xl h-[85vh]' : 'max-w-3xl h-[88vh]'
        }`}>
          {/* Header */}
          <div className={`bg-gradient-to-r ${headerColor} text-white px-5 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl"><TypeIcon className="w-5 h-5" /></div>
              <div>
                <div className="font-semibold">{typeLabel} Session</div>
                <div className="text-xs opacity-80 flex items-center gap-3 flex-wrap">
                  <span className="uppercase font-mono">{status}</span>
                  {status === 'active' && (
                    <>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(durationSeconds)}</span>
                      {freeMinutesLeft > 0 && <span className="text-yellow-200">FREE: {freeMinutesLeft}m</span>}
                      <span className="flex items-center gap-1"><Wallet className="w-3 h-3" />₹{walletBalance}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAstro && status === 'pending' && (
                <button onClick={handleAccept} disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-xl text-sm font-medium">
                  Accept
                </button>
              )}
              {status !== 'completed' && (
                <button onClick={handleComplete} disabled={loading} className="bg-red-500/90 hover:bg-red-600 px-4 py-1.5 rounded-xl text-sm font-medium">
                  End
                </button>
              )}
              <button onClick={() => { endMedia(); onClose(); }} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
          </div>

          {/* CHAT ONLY */}
          {consType === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-sky-50/50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-16 text-sm">
                    <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    {status === 'pending' ? 'Waiting for astrologer to accept...' : 'Start chatting with your astrologer'}
                  </div>
                )}
                {messages.map((m, i) => {
                  const mine = m.sender_id === user?.id || m.sender === user?.full_name;
                  return (
                    <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'}`}>
                        {!mine && <div className="text-[10px] opacity-50 mb-0.5">{m.sender || 'Astrologer'}</div>}
                        {m.text}
                        <div className="text-[9px] opacity-40 text-right mt-1">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {typingUser && <div className="px-4 py-1 text-xs text-gray-400">{typingUser} is typing...</div>}
              {canInteract && (
                <div className="p-3 border-t flex gap-2 bg-white">
                  <input
                    value={newMessage}
                    onChange={e => {
                      setNewMessage(e.target.value);
                      socketRef.current?.emit('typing', { consultationId: roomId, user: user?.full_name, role: user?.role });
                    }}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button onClick={sendMessage} className="bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
              {status === 'payment_required' && (
                <div className="p-4 bg-amber-50 text-amber-700 text-sm text-center border-t">
                  Free time ended. Pay to continue chatting.
                </div>
              )}
            </div>
          )}

          {/* AUDIO CALL ONLY */}
          {consType === 'call' && (
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-900 to-green-950 text-white p-8">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 ${
                isAudioOn ? 'bg-emerald-500/30 ring-4 ring-emerald-400/50 animate-pulse' : 'bg-white/10'
              }`}>
                <Phone className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-semibold mb-1">
                {isAstro ? consultation.user_id?.full_name || 'Client' : consultation.astrologer_id?.full_name || 'Astrologer'}
              </h2>
              <p className="text-emerald-200/70 text-sm mb-2">Audio Call Only</p>
              {status === 'active' && (
                <div className="font-mono text-4xl font-bold mb-6">{formatTime(durationSeconds)}</div>
              )}
              {wasRejected && (
                <div className="text-center">
                  <p className="text-red-300 text-lg font-semibold mb-2">Call Declined</p>
                  <p className="text-emerald-200/60 text-sm mb-4">The astrologer is not available right now.</p>
                  <button onClick={onClose} className="px-6 py-2 bg-white/15 rounded-xl hover:bg-white/25 text-sm">Close</button>
                </div>
              )}
              {status === 'pending' && !isAstro && !wasRejected && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="text-emerald-200/80 text-sm font-medium">Ringing...</p>
                  <p className="text-emerald-200/50 text-xs mt-1">Waiting for astrologer to accept</p>
                </div>
              )}
              {status === 'active' && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-white/15 hover:bg-white/25'}`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button onClick={handleComplete} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600">
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>
              )}
              {status === 'payment_required' && (
                <p className="text-amber-300 text-sm mt-4">Free time ended. Pay ₹{rate * 5} to continue call.</p>
              )}
            </div>
          )}

          {/* VIDEO CALL ONLY */}
          {consType === 'video' && (
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              <div className="flex-1 relative p-4">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 relative">
                  <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {!isVideoOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 text-sm gap-3">
                      {wasRejected ? (
                        <>
                          <p className="text-red-300 text-lg font-semibold">Call Declined</p>
                          <button onClick={onClose} className="px-5 py-2 bg-white/15 rounded-xl hover:bg-white/25 text-sm">Close</button>
                        </>
                      ) : status === 'pending' ? (
                        <>
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" />
                            <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <p className="font-medium">Ringing...</p>
                        </>
                      ) : (
                        <p>Connecting video...</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-8 right-8 w-36 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">You</div>
                </div>
              </div>
              {status === 'active' && (
                <div className="p-4 flex items-center justify-center gap-4 bg-black/50">
                  <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isMuted ? 'bg-red-500' : 'bg-white/20'}`}>
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => { if (isVideoOn) { endMedia(); } else { startVideoCall(); } }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isVideoOn ? 'bg-white/20' : 'bg-emerald-600'}`}
                  >
                    {isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                  <button onClick={handleComplete} className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              )}
              {status === 'payment_required' && (
                <div className="p-3 bg-amber-900/50 text-amber-200 text-sm text-center">Free time ended. Pay to continue video call.</div>
              )}
            </div>
          )}

          <div className="px-4 py-2 text-xs bg-gray-50 text-gray-500 flex justify-between border-t">
            <span>₹{rate}/min • Billed: ₹{billedAmount}</span>
            <span className="capitalize">{consType} mode — no mixing</span>
          </div>
        </div>
      </div>
    </>
  );
}