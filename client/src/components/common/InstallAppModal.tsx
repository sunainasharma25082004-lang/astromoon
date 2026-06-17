import { MessageCircle, Phone, Video } from 'lucide-react';
import { Modal } from './Modal';
import { AppDownloadCTA } from './AppDownloadCTA';
import { APP_NAME } from '../../constants';

export type ConsultType = 'chat' | 'call' | 'video';

const TYPE_LABELS: Record<ConsultType, string> = {
  chat: 'Chat',
  call: 'Audio Call',
  video: 'Video Call',
};

const TYPE_ICONS: Record<ConsultType, typeof MessageCircle> = {
  chat: MessageCircle,
  call: Phone,
  video: Video,
};

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultType?: ConsultType;
}

export function InstallAppModal({ isOpen, onClose, consultType }: InstallAppModalProps) {
  const label = consultType ? TYPE_LABELS[consultType] : 'Live Consultation';
  const Icon = consultType ? TYPE_ICONS[consultType] : MessageCircle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="App Install Required"
      showClose
    >
      <div className="text-center mb-5">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="text-gray-900 font-semibold text-base mb-2">
          {consultType ? `${label} with Astrologer` : 'Consult with Astrologer'}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Please install the <strong>{APP_NAME}</strong> app. Chat, call &amp; video consultations
          are available only in the app — you cannot access them on the website right now.
        </p>
      </div>
      <AppDownloadCTA
        variant="inline"
        showConsultTypes
        subtitle="Download the app to start your consultation."
      />
    </Modal>
  );
}