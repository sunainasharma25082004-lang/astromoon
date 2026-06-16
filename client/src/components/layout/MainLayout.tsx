import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20"><Outlet /></main>
      <Footer />
    </div>
  );
}
