import { Download, Smartphone } from 'lucide-react';
import { APP_NAME, APP_PLAY_STORE_URL, APP_APK_DOWNLOAD_URL } from '../../constants';

interface AppDownloadCTAProps {
  variant?: 'card' | 'inline';
  subtitle?: string;
}

export function AppDownloadCTA({
  variant = 'card',
  subtitle = 'Chat, call & video consultations are available in our mobile app.',
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

  if (variant === 'inline') {
    return (
      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-violet-50 p-5 sm:p-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">Continue on {APP_NAME} App</p>
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
        {buttons}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Get the App</h3>
      <p className="text-sm text-gray-600 mb-5">{subtitle}</p>
      {buttons}
      <p className="text-xs text-gray-400 text-center mt-4">
        Install the app to chat, call or video consult with this astrologer.
      </p>
    </div>
  );
}