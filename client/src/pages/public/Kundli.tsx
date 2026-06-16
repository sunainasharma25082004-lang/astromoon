import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User, Calendar, MapPin, Clock, FileText } from 'lucide-react';

export default function KundliPage() {
  const [form, setForm] = useState({ name: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '' });
  const [result, setResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult({
      ascendant: 'Aries', moon_sign: 'Cancer', sun_sign: 'Leo', nakshatra: 'Ashwini',
      planets: [{ name: 'Sun', sign: 'Leo', house: 1 }, { name: 'Moon', sign: 'Cancer', house: 12 }],
      yogas: [{ name: 'Budhaditya Yoga', effect: 'Intelligence' }],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 mb-4"><Sparkles className="w-4 h-4 mr-2" />Free Kundli</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Generate Your Birth Chart</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div><label className="block text-sm font-medium mb-2">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field pl-11" placeholder="Enter your name" required /></div></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Date of Birth</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className="input-field pl-11" required /></div></div>
                <div><label className="block text-sm font-medium mb-2">Time of Birth</label><div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="time" value={form.timeOfBirth} onChange={e => setForm({ ...form, timeOfBirth: e.target.value })} className="input-field pl-11" required /></div></div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Place of Birth</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={form.placeOfBirth} onChange={e => setForm({ ...form, placeOfBirth: e.target.value })} className="input-field pl-11" placeholder="City, Country" required /></div></div>
              <button type="submit" className="btn-cosmic w-full"><Sparkles className="w-5 h-5 mr-2" />Generate Free Kundli</button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {result ? (
              <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                <div className="bg-gradient-to-r from-cosmic-purple to-secondary-600 text-white p-6"><h3 className="text-xl font-bold">Your Birth Chart</h3></div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">{[{ label: 'Ascendant', value: result.ascendant }, { label: 'Moon Sign', value: result.moon_sign }, { label: 'Sun Sign', value: result.sun_sign }, { label: 'Nakshatra', value: result.nakshatra }].map(i => (<div key={i.label} className="p-3 bg-gray-50 rounded-xl"><div className="text-xs text-gray-500">{i.label}</div><div className="font-semibold">{i.value}</div></div>))}</div>
                  <h4 className="font-semibold mb-3">Planetary Positions</h4>
                  <div className="grid grid-cols-3 gap-2">{result.planets.map((p: any) => (<div key={p.name} className="p-2 bg-gray-50 rounded-lg text-center"><div className="font-medium">{p.name}</div><div className="text-xs text-gray-500">{p.sign}</div></div>))}</div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your Kundli Will Appear Here</h3>
                <p className="text-gray-500">Fill in your birth details</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
