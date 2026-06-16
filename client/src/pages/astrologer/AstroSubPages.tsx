import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Clock, User, Star, Settings } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ReactNode;
  description: string;
  items?: { label: string; value: string }[];
}

function AstroSubPage({ title, icon, description, items }: Props) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">{icon}</div>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        {items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-amber-50/50 rounded-xl">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            <p>No data yet.</p>
            <Link to="/astro" className="text-amber-700 font-medium mt-2 inline-block">← Back to Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function AstroConsultationsPage() {
  return (
    <AstroSubPage
      title="All Consultations"
      icon={<Calendar className="w-5 h-5" />}
      description="Your complete consultation history"
      items={[
        { label: 'Rahul Sharma — Chat', value: 'Active • ₹20/min' },
        { label: 'Priya Verma — Video', value: 'Completed • ₹55/min' },
        { label: 'Amit Kapoor — Audio', value: 'Completed • ₹30/min' },
      ]}
    />
  );
}

export function AstroEarningsPage() {
  return (
    <AstroSubPage
      title="Earnings & Payouts"
      icon={<DollarSign className="w-5 h-5" />}
      description="Your income and withdrawal history"
      items={[
        { label: 'This Month', value: '₹18,450' },
        { label: 'Last Payout', value: '₹12,300 • Jun 7' },
        { label: 'Pending Balance', value: '₹4,200' },
        { label: 'Next Payout', value: 'Friday' },
      ]}
    />
  );
}

export function AstroAvailabilityPage() {
  return (
    <AstroSubPage
      title="Availability"
      icon={<Clock className="w-5 h-5" />}
      description="Manage your online schedule"
      items={[
        { label: 'Monday', value: '9:00 AM — 6:00 PM' },
        { label: 'Wednesday', value: '10:00 AM — 8:00 PM' },
        { label: 'Friday', value: '9:00 AM — 5:00 PM' },
      ]}
    />
  );
}

export function AstroProfilePage() {
  return (
    <AstroSubPage
      title="My Profile"
      icon={<User className="w-5 h-5" />}
      description="Your public astrologer profile"
      items={[
        { label: 'Specialization', value: 'Vedic Astrology, Kundli' },
        { label: 'Languages', value: 'Hindi, English' },
        { label: 'Experience', value: '15 Years' },
        { label: 'Chat Rate', value: '₹20/min' },
      ]}
    />
  );
}

export function AstroReviewsPage() {
  return (
    <AstroSubPage
      title="Reviews"
      icon={<Star className="w-5 h-5" />}
      description="What clients say about you"
      items={[
        { label: 'Rahul — ★★★★★', value: 'Very accurate predictions!' },
        { label: 'Priya — ★★★★☆', value: 'Helpful career guidance' },
        { label: 'Amit — ★★★★★', value: 'Best astrologer I consulted' },
      ]}
    />
  );
}

export function AstroSettingsPage() {
  return (
    <AstroSubPage
      title="Settings"
      icon={<Settings className="w-5 h-5" />}
      description="Account and notification preferences"
      items={[
        { label: 'Auto-accept consultations', value: 'Off' },
        { label: 'Notification sound', value: 'On' },
        { label: 'Payout method', value: 'Bank Transfer' },
      ]}
    />
  );
}