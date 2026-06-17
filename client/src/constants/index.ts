export const APP_NAME = 'Astro Star';

export const APP_PLAY_STORE_URL =
  import.meta.env.VITE_PLAY_STORE_URL || 'https://play.google.com/store/apps';

export const APP_APK_DOWNLOAD_URL =
  import.meta.env.VITE_APK_DOWNLOAD_URL || '';
export const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  { id: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
  { id: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
  { id: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  { id: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' },
];
