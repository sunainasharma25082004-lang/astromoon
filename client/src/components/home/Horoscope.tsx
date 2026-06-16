import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sun } from 'lucide-react';
import { ZODIAC_SIGNS } from '../../constants';

const horoscopeData: Record<string, { prediction: string; lucky_number: string; mood: string }> = {
  aries: { prediction: 'Today brings new opportunities for growth. Energy levels are high.', lucky_number: '9', mood: 'Energetic' },
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

export function DailyHoroscope() {
  const [selectedSign, setSelectedSign] = useState('aries');
  const horoscope = horoscopeData[selectedSign];
  const signData = ZODIAC_SIGNS.find(s => s.id === selectedSign);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center px-4 py-2 rounded-full bg-cosmic-purple/10 text-cosmic-purple mb-4">
            <Sun className="w-4 h-4 mr-2" />Daily Predictions
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Today's Horoscope</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="grid grid-cols-4 gap-3">
            {ZODIAC_SIGNS.map(sign => (
              <motion.button key={sign.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedSign(sign.id)} className={`p-4 rounded-xl text-center transition-all ${selectedSign === sign.id ? 'bg-gradient-to-br from-cosmic-purple to-secondary-600 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
                <div className="text-2xl mb-1">{sign.symbol}</div>
                <div className="text-sm font-medium">{sign.name}</div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={selectedSign} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-xl border p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cosmic-purple/10 to-cosmic-light/10 flex items-center justify-center text-4xl mr-4">{signData?.symbol}</div>
                <div><h3 className="text-2xl font-display font-bold">{signData?.name}</h3><p className="text-gray-500">{signData?.dates}</p></div>
                <div className="ml-auto text-right"><div className="text-sm text-gray-500">Element</div><div className="text-cosmic-purple font-medium">{signData?.element}</div></div>
              </div>
              <div className="mb-6"><h4 className="text-sm text-gray-500 mb-2">Today's Prediction</h4><p className="text-gray-700 leading-relaxed">{horoscope.prediction}</p></div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-amber-50 rounded-xl text-center"><div className="text-xs text-gray-500">Lucky Number</div><div className="text-lg font-bold text-amber-600">{horoscope.lucky_number}</div></div>
                <div className="p-4 bg-blue-50 rounded-xl text-center"><div className="text-xs text-gray-500">Mood</div><div className="text-lg font-bold text-blue-600">{horoscope.mood}</div></div>
                <div className="p-4 bg-purple-50 rounded-xl text-center"><div className="text-xs text-gray-500">Element</div><div className="text-lg font-bold text-purple-600">{signData?.element}</div></div>
              </div>
              <Link to={`/horoscope/${selectedSign}`} className="w-full py-3 bg-gradient-to-r from-cosmic-purple to-secondary-600 text-white text-center rounded-xl font-medium hover:shadow-lg flex items-center justify-center">Read Full Horoscope<ArrowRight className="w-4 h-4 ml-2" /></Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
