import { Link } from 'react-router-dom';
import { APP_NAME } from '../../constants';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-[#f8f7fc] py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/" className="text-sm text-violet-600 hover:underline mb-6 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-500 text-sm mb-8">{APP_NAME} — Last updated {new Date().getFullYear()}</p>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 prose prose-slate max-w-none text-sm leading-relaxed space-y-4 text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>By using {APP_NAME}, you agree to these terms. The platform provides astrologer profiles, free tools, and a spiritual products shop.</p>
      <p><strong>Accounts:</strong> One email and one phone number per account. You are responsible for keeping your login secure.</p>
      <p><strong>Consultations:</strong> Live chat, call, and video consultations are available through our mobile app only.</p>
      <p><strong>Shop:</strong> Product orders are subject to availability. Refunds are handled per our support policy.</p>
      <p><strong>Astrologer applications:</strong> Approval is at admin discretion. Approved astrologers will be contacted directly by our team.</p>
      <p>We may update these terms. Continued use of the site means you accept the updated terms.</p>
    </LegalPage>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>{APP_NAME} respects your privacy. This policy explains how we collect and use your information.</p>
      <p><strong>Data we collect:</strong> Name, email, phone, order history, saved preferences, and application details when you apply as an astrologer.</p>
      <p><strong>How we use it:</strong> To manage your account, process shop orders, send notifications, and review astrologer applications.</p>
      <p><strong>Security:</strong> Passwords are stored securely. We do not display admin credentials or share your data with third parties without consent.</p>
      <p><strong>Cookies & storage:</strong> We use local storage for cart items and session tokens for login.</p>
      <p>For privacy questions, contact our support team through the website.</p>
    </LegalPage>
  );
}