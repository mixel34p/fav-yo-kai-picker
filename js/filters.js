import { getYokaiSearchText } from './i18n.js';

export function applyFilters(allYokai, filters) {
  const search = filters.search.trim().toLocaleLowerCase();

  return allYokai.filter((yokai) => {
    const matchesGame = filters.game === 'all' || yokai.game === filters.game;
    const matchesTribe = filters.tribe === 'all' || yokai.tribe === filters.tribe;
    const haystack = getYokaiSearchText(yokai).toLocaleLowerCase();
    const matchesSearch = !search || haystack.includes(search);

    return matchesGame && matchesTribe && matchesSearch;
  });
}
