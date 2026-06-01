export function applyFilters(allYokai, filters) {
  const search = filters.search.trim().toLocaleLowerCase();

  return allYokai.filter((yokai) => {
    const matchesGame = filters.game === 'all' || yokai.game === filters.game;
    const matchesTribe = filters.tribe === 'all' || yokai.tribe === filters.tribe;
    const haystack = `${yokai.name} ${yokai.tribe} ${yokai.game}`.toLocaleLowerCase();
    const matchesSearch = !search || haystack.includes(search);

    return matchesGame && matchesTribe && matchesSearch;
  });
}
