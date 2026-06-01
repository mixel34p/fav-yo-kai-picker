export const SUPABASE_URL = 'https://epdtcqnfmlwzejawhyhm.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwZHRjcW5mbWx3emVqYXdoeWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NjgyMTIsImV4cCI6MjA2MzE0NDIxMn0.kGYE12oAgrU8RGMyVucBizAFsPX9vr0CZnB6l7Q5TK4';

export const TRIBE_COLORS = {
  Brave: '#D42018',
  Charming: '#E6007A',
  Mysterious: '#6A1B9A',
  Tough: '#1565C0',
  Heartful: '#EF6C00',
  Shady: '#455A64',
  Eerie: '#2E7D32',
  Slippery: '#00838F',
  Boss: '#F9A825',
  Wicked: '#4A148C',
  Enma: '#B71C1C',
};

export const STATIC_SLOTS = [
  { id: 'overall', label: 'Favorite' },
];

export const TRIBE_ORDER = [
  'Brave',
  'Mysterious',
  'Tough',
  'Charming',
  'Heartful',
  'Shady',
  'Eerie',
  'Slippery',
  'Boss',
];

/** Always shown in the extra favorites row (not tied to matrix tribes). */
export const EXTRA_TRIBE_FAVORITES = [
  'Enma',
  'Wicked',
];

export const EXCLUDED_TRIBES = [
  'Wandroid',
];

export const GAME_ORDER = [
  'Yo-kai Watch 1',
  'Yo-kai Watch 2',
  'Yo-kai Watch 3',
  'Yo-kai Watch 4',
  'Yo-kai Watch Blasters',
];

export const GAME_COLORS = {
  'Yo-kai Watch 1': '#F5B700',
  'Yo-kai Watch 2': '#2B8FE6',
  'Yo-kai Watch 3': '#E53935',
  'Yo-kai Watch 4': '#7E57C2',
  'Yo-kai Watch Blasters': '#C62828',
};

export const EXCLUDED_GAMES = [
  'Yo-kai Watch Busters 2',
  'Yo-kai Watch Sangokushi',
];

export const TRIBE_ICONS = {
  Brave: 'assets/images/tribes/Brave.PNG',
  Charming: 'assets/images/tribes/charming.png',
  Mysterious: 'assets/images/tribes/mysterious.png',
  Tough: 'assets/images/tribes/tough.png',
  Heartful: 'assets/images/tribes/heartful.png',
  Shady: 'assets/images/tribes/shady.png',
  Eerie: 'assets/images/tribes/eerie.png',
  Slippery: 'assets/images/tribes/slippery.png',
  Wicked: 'assets/images/tribes/wicked.png',
  Boss: 'assets/images/tribes/boss.png',
  Enma: 'assets/images/tribes/enma.png',
};

export const GAME_LOGOS = {
  'Yo-kai Watch 1': 'assets/images/games/yw1.png',
  'Yo-kai Watch 2': 'assets/images/games/yw2.png',
  'Yo-kai Watch 3': 'assets/images/games/yw3.png',
  'Yo-kai Watch 4': 'assets/images/games/yw4.png',
  'Yo-kai Watch Blasters': 'assets/images/games/ywb.png',
};

export const STORAGE_KEYS = {
  filters: 'ultimate-yokai-picker:filters',
  favorites: 'ultimate-yokai-picker:favorites',
};
