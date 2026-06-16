import { Download, Smartphone, MessageCircle, Phone, Video } from 'lucide-react';
import { APP_NAME, APP_PLAY_STORE_URL, APP_APK_DOWNLOAD_URL } from '../../constants';

interface AppDownloadCTAProps {
  variant?: 'card' | 'inline';
  subtitle?: string;
  showConsultTypes?: boolean;
}

export function AppDownloadCTA({
  variant = 'card',
  subtitle = 'Chat, call & video consultations are available in our mobile app.',
  showConsultTypes = false,
}: AppDownloadCTAProps) {
  const apkReady = Boolean(APP_APK_DOWNLOAD_URL);

  const buttons = (
    <div className={`flex flex-col gap-3 ${variant === 'inline' ? 'sm:flex-row' : ''}`}>
      <a
        href={APP_PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow-md hover:from-emerald-700 hover:to-green-700 transition"
      >
        <Smartphone className="w-5 h-5 shrink-0" />
        Go to Play Store
      </a>
      <a
        href={apkReady ? APP_APK_DOWNLOAD_URL : APP_PLAY_STORE_URL}
        download={apkReady ? true : undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl border-2 border-primary-500 text-primary-700 font-semibold bg-primary-50 hover:bg-primary-100 transition"
      >
        <Download className="w-5 h-5 shrink-0" />
        {apkReady ? 'Download APK' : 'Get Android App'}
      </a>
    </div>
  );

  const consultTypes = showConsultTypes && (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {[
        { Icon: MessageCircle, label: 'Chat', color: 'bg-blue-50 text-blue-700 border-blue-100' },
        { Icon: Phone, label: 'Audio Call', color: 'bg-green-50 text-green-700 border-green-100' },
        { Icon: Video, label: 'Video Call', color: 'bg-purple-50 text-purple-700 border-purple-100' },
      ].map(({ Icon, label, color }) => (
        <div key={label} className={`flex flex-col items-center py-3 rounded-xl border text-xs font-medium ${color}`}>
          <Icon className="w-4 h-4 mb-1" />
          {label}
        </div>
      ))}
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-violet-50 p-5 sm:p-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">Continue on {APP_NAME} App</p>
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
        {consultTypes}
        {buttons}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Get the App</h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      {consultTypes}
      {buttons}
      <p className="text-xs text-gray-400 text-center mt-4">
        Live consultations work only in the app — website is for browsing profiles & shopping.
      </p>
    </div>
  );
}