import { Link } from 'react-router-dom';
import { ShoppingBag, FileText, Heart, Bell, Settings } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ReactNode;
  description: string;
  items?: { label: string; value: string }[];
}

function SubPageShell({ title, icon, description, items }: Props) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">{icon}</div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
        {items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-sky-50/50 rounded-xl">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            <p>No items yet.</p>
            <Link to="/astrologers" className="text-sky-600 font-medium mt-2 inline-block">Explore Astrologers →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function UserOrdersPage() {
  return (
    <SubPageShell
      title="My Orders"
      icon={<ShoppingBag className="w-5 h-5" />}
      description="Shop orders and purchases"
      items={[
        { label: 'Rudraksha Mala (Premium)', value: '₹1,299 • Delivered' },
        { label: 'Yellow Sapphire Ring', value: '₹4,500 • Processing' },
      ]}
    />
  );
}

export function UserKundlisPage() {
  return (
    <SubPageShell
      title="My Kundlis"
      icon={<FileText className="w-5 h-5" />}
      description="Saved birth charts and reports"
      items={[
        { label: 'Personal Kundli — Rahul Verma', value: 'Jan 15, 1990 • Delhi' },
        { label: 'Marriage Compatibility Report', value: 'Generated Jun 2024' },
      ]}
    />
  );
}

export function UserSavedPage() {
  return (
    <SubPageShell
      title="Saved Astrologers"
      icon={<Heart className="w-5 h-5" />}
      description="Your favourite astrologers"
      items={[
        { label: 'Acharya Rajesh Kumar', value: '★ 4.8 • Online' },
        { label: 'Dr. Priya Sharma', value: '★ 4.9 • Online' },
      ]}
    />
  );
}

export function UserNotificationsPage() {
  return (
    <SubPageShell
      title="Notifications"
      icon={<Bell className="w-5 h-5" />}
      description="Updates about consultations and wallet"
      items={[
        { label: 'Welcome bonus credited', value: '₹100 added to wallet' },
        { label: 'Free consultation available', value: '5 minutes free on first chat' },
        { label: 'New astrologer online', value: 'Dr. Priya Sharma is now available' },
      ]}
    />
  );
}

export function UserSettingsPage() {
  return (
    <SubPageShell
      title="Settings"
      icon={<Settings className="w-5 h-5" />}
      description="Account preferences"
      items={[
        { label: 'Language', value: 'Hindi / English' },
        { label: 'Notifications', value: 'Enabled' },
        { label: 'Privacy', value: 'Standard' },
      ]}
    />
  );
}