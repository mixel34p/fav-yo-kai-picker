import { SUPABASE_KEY, SUPABASE_URL } from './config.js';

const PAGE_SIZE = 1000;
const SELECT_COLUMNS = 'id,name,tribe,imageurl,game';

export async function fetchAllYokai() {
  const allRows = [];
  let offset = 0;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/yokai?select=${SELECT_COLUMNS}&order=name.asc&limit=${PAGE_SIZE}&offset=${offset}`;
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status} ${response.statusText}`);
    }

    const rows = await response.json();
    allRows.push(...rows);

    if (rows.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return allRows;
}
