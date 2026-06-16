import { Link } from 'react-router-dom';
import { Users, UserCheck, FileText, DollarSign, BarChart3, Shield, Settings } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ReactNode;
  items: { label: string; value: string }[];
}

function AdminSubPage({ title, icon, items }: Props) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center border border-slate-700">{icon}</div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl text-sm">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-white font-medium">{item.value}</span>
            </div>
          ))}
        </div>
        <Link to="/admin" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">← Back to Overview</Link>
      </div>
    </div>
  );
}

export function AdminUsersPage() {
  return <AdminSubPage title="Manage Users" icon={<Users className="w-5 h-5" />} items={[
    { label: 'demo@user.com', value: 'User • ₹2,450' },
    { label: 'rahul@test.com', value: 'User • ₹850' },
    { label: 'priya@test.com', value: 'User • ₹1,200' },
    { label: 'admin@panel.com', value: 'Admin' },
  ]} />;
}

export function AdminAstrologersPage() {
  return <AdminSubPage title="Manage Astrologers" icon={<UserCheck className="w-5 h-5" />} items={[
    { label: 'Acharya Rajesh Kumar', value: 'Approved • Online' },
    { label: 'Dr. Priya Sharma', value: 'Approved • Online' },
    { label: 'Vikram Singh', value: 'Pending Approval' },
  ]} />;
}

export function AdminConsultationsPage() {
  return <AdminSubPage title="All Consultations" icon={<FileText className="w-5 h-5" />} items={[
    { label: 'Rahul → Acharya Rajesh', value: 'Chat • ₹300 • Completed' },
    { label: 'Priya → Dr. Priya Sharma', value: 'Video • ₹1,375 • Completed' },
  ]} />;
}

export function AdminTransactionsPage() {
  return <AdminSubPage title="Transactions" icon={<DollarSign className="w-5 h-5" />} items={[
    { label: 'Total Revenue', value: '₹8,40,000' },
    { label: 'Platform Commission', value: '₹2,52,000' },
    { label: 'Astrologer Payouts', value: '₹5,88,000' },
  ]} />;
}

export function AdminReportsPage() {
  return <AdminSubPage title="Reports" icon={<BarChart3 className="w-5 h-5" />} items={[
    { label: 'Users this week', value: '+312' },
    { label: 'Consultations today', value: '284' },
    { label: 'Revenue growth', value: '+18%' },
  ]} />;
}

export function AdminModerationPage() {
  return <AdminSubPage title="Moderation" icon={<Shield className="w-5 h-5" />} items={[
    { label: 'Flagged reviews', value: '3 pending' },
    { label: 'Reported chats', value: '1 pending' },
    { label: 'Blocked users', value: '0' },
  ]} />;
}

export function AdminSettingsPage() {
  return <AdminSubPage title="Platform Settings" icon={<Settings className="w-5 h-5" />} items={[
    { label: 'Free trial minutes', value: '5 min' },
    { label: 'Platform commission', value: '30%' },
    { label: 'Signup bonus', value: '₹100' },
    { label: 'Payment gateway', value: 'Demo Mode (Razorpay keys pending)' },
  ]} />;
}