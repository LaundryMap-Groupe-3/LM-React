const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let cachedWords = null;
let pendingFetch = null;

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

async function loadBlockedWords() {
  if (cachedWords) return cachedWords;
  if (pendingFetch) return pendingFetch;

  pendingFetch = fetch(`${API_BASE_URL}/api/offensive-words`)
    .then((res) => (res.ok ? res.json() : { words: [] }))
    .then((data) => {
      cachedWords = (data.words ?? []).map(normalize);
      return cachedWords;
    })
    .catch(() => {
      cachedWords = [];
      return cachedWords;
    })
    .finally(() => {
      pendingFetch = null;
    });

  return pendingFetch;
}

// Précharge la liste pour que la première vérification ne soit pas asynchrone à vide
loadBlockedWords();

export async function containsOffensiveContent(text) {
  if (!text) return false;
  const words = await loadBlockedWords();
  const normalized = normalize(text);
  return words.some((word) => word !== '' && normalized.includes(word));
}
