import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { ZODIAC_SIGNS } from '../../constants';

const horoscopes: Record<string, { prediction: string; lucky_number: string; mood: string }> = {
  aries: { prediction: 'Today brings new opportunities. Energy levels are high.', lucky_number: '9', mood: 'Energetic' },
  taurus: { prediction: 'Focus on stability and security today.', lucky_number: '6', mood: 'Peaceful' },
  gemini: { prediction: 'Communication is your superpower today.', lucky_number: '5', mood: 'Curious' },
  cancer: { prediction: 'Trust your intuition for important decisions.', lucky_number: '2', mood: 'Intuitive' },
  leo: { prediction: 'Your charisma shines bright. Leadership calling.', lucky_number: '1', mood: 'Confident' },
  virgo: { prediction: 'Attention to detail brings great results.', lucky_number: '5', mood: 'Organized' },
  libra: { prediction: 'Seek balance and harmony in all things.', lucky_number: '6', mood: 'Harmonious' },
  scorpio: { prediction: 'Embrace transformation and change.', lucky_number: '8', mood: 'Intense' },
  sagittarius: { prediction: 'Adventure awaits. Expand your horizons.', lucky_number: '3', mood: 'Optimistic' },
  capricorn: { prediction: 'Your efforts will be rewarded today.', lucky_number: '4', mood: 'Determined' },
  aquarius: { prediction: 'Innovation and independence mark your day.', lucky_number: '7', mood: 'Independent' },
  pisces: { prediction: 'Dreams hold important messages for you.', lucky_number: '3', mood: 'Dreamy' },
};

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState('aries');
  const h = horoscopes[selectedSign];
  const sign = ZODIAC_SIGNS.find(s => s.id === selectedSign);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-700 mb-4"><Star className="w-4 h-4 mr-2" />Daily Predictions</div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Horoscope</h1>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border">{['daily', 'weekly', 'monthly'].map(t => <button key={t} className="px-6 py-2 rounded-lg font-medium capitalize text-gray-600 hover:bg-gray-100">{t}</button>)}</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border p-6">
            <h3 className="font-semibold mb-4">Select Your Zodiac Sign</h3>
            <div className="grid grid-cols-4 gap-3">
              {ZODIAC_SIGNS.map(z => (
                <button key={z.id} onClick={() => setSelectedSign(z.id)} className={`p-4 rounded-xl text-center transition-all ${selectedSign === z.id ? 'bg-gradient-to-br from-cosmic-purple to-secondary-600 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border'}`}>
                  <div className="text-2xl mb-1">{z.symbol}</div>
                  <div className="text-sm font-medium">{z.name}</div>
                </button>
              ))}
            </div>
          </div>

          <motion.div key={selectedSign} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
            <div className="bg-gradient-to-br from-cosmic-purple to-secondary-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div><div className="text-4xl mb-2">{sign?.symbol}</div><h2 className="text-2xl font-display font-bold">{sign?.name}</h2><p className="text-white/80 text-sm">{sign?.dates}</p></div>
                <div className="text-right"><div className="text-white/60 text-sm">Element</div><div className="font-semibold">{sign?.element}</div></div>
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-sm text-gray-500 mb-2">Today's Prediction</h4>
              <p className="text-gray-700 mb-4">{h?.prediction}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-amber-50 rounded-xl"><div className="text-xs text-gray-500">Lucky No.</div><div className="font-bold text-amber-600">{h?.lucky_number}</div></div>
                <div className="text-center p-3 bg-blue-50 rounded-xl"><div className="text-xs text-gray-500">Mood</div><div className="font-bold text-blue-600">{h?.mood}</div></div>
                <div className="text-center p-3 bg-purple-50 rounded-xl"><div className="text-xs text-gray-500">Element</div><div className="font-bold text-purple-600">{sign?.element}</div></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
