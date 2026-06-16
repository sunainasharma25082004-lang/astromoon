import { Link } from 'react-router-dom';
import { Sparkles, Mail, Phone, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { APP_NAME } from '../../constants';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-cosmic-navy via-cosmic-purple to-cosmic-light text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-light to-gold rounded-full flex items-center justify-center"><Sparkles className="w-6 h-6 text-cosmic-dark" /></div>
              <span className="font-display text-xl font-bold">{APP_NAME}</span>
            </Link>
            <p className="text-white/70 text-sm mb-6">Your trusted platform for Vedic astrology consultations.</p>
            <div className="flex gap-3">{[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (<a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><Icon className="w-5 h-5" /></a>))}</div>
          </div>

          {[['Services', [{ label: 'Chat with Astrologer', path: '/astrologers?type=chat' }, { label: 'Talk to Astrologer', path: '/astrologers?type=call' }, { label: 'Free Kundli', path: '/kundli' }, { label: 'Horoscope', path: '/horoscope' }]],
            ['Explore', [{ label: 'Blog', path: '/blog' }, { label: 'Shop', path: '/shop' }, { label: 'Astrologers', path: '/astrologers' }]],
            ['Support', [{ label: 'Help & FAQ', path: '/#faq' }, { label: 'Privacy', path: '/#privacy' }, { label: 'Terms', path: '/#terms' }]]].map(([title, links]: any) => (
              <div key={title}>
                <h3 className="font-semibold text-gold-light mb-4">{title}</h3>
                <ul className="space-y-2">{links.map((link: any) => (<li key={link.path}><Link to={link.path} className="text-sm text-white/70 hover:text-white transition-colors">{link.label}</Link></li>))}</ul>
              </div>
            ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/60">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
