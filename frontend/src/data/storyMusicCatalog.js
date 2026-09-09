export const STORY_MUSIC_CATEGORIES = [
  { id: 'all', label: '🔥 All / Trending' },
  { id: 'bangla', label: '🇧🇩 Bangla Hits' },
  { id: 'bollywood', label: '🎬 Bollywood / Hindi' },
  { id: 'pop', label: '🌍 English Pop' },
  { id: 'lofi', label: '☕ Chill Lo-Fi' },
];

export const STORY_MUSIC_CATALOG = [
  {
    id: 'bangla_romantic_1',
    title: 'Tomake Chai (Acoustic Serenade)',
    artist: 'Dhaka Acoustic Session',
    genre: 'Bangla Romantic',
    category: 'bangla',
    duration: '0:30',
    coverGradient: 'from-rose-500 to-pink-600',
    coverIcon: '🎸',
    url: '/music/bangla_romantic.wav'
  },
  {
    id: 'bangla_folk_1',
    title: 'Bangla Melodic Serenade',
    artist: 'Folk Fusion Studio',
    genre: 'Bangla Folk',
    category: 'bangla',
    duration: '0:30',
    coverGradient: 'from-amber-500 to-orange-600',
    coverIcon: '🪕',
    url: '/music/bangla_melody.wav'
  },
  {
    id: 'hindi_romantic_1',
    title: 'Tum Hi Aana (Soulful Melody)',
    artist: 'Mumbai Strings Acoustic',
    genre: 'Bollywood Romantic',
    category: 'bollywood',
    duration: '0:30',
    coverGradient: 'from-purple-600 to-indigo-600',
    coverIcon: '🎹',
    url: '/music/hindi_romantic.wav'
  },
  {
    id: 'hindi_acoustic_2',
    title: 'Romantic Acoustic Sunset',
    artist: 'Bollywood Lo-Fi Beats',
    genre: 'Hindi Chill Vibe',
    category: 'bollywood',
    duration: '0:30',
    coverGradient: 'from-cyan-600 to-blue-600',
    coverIcon: '✨',
    url: '/music/acoustic_love.wav'
  },
  {
    id: 'english_pop_1',
    title: 'Midnight City (Synth Pop)',
    artist: 'Neon Wave Pop',
    genre: 'English Pop',
    category: 'pop',
    duration: '0:30',
    coverGradient: 'from-fuchsia-600 to-purple-700',
    coverIcon: '⚡',
    url: '/music/english_pop.wav'
  },
  {
    id: 'english_upbeat_2',
    title: 'Upbeat Pop Groove',
    artist: 'Dance City Vibes',
    genre: 'Dance / Pop',
    category: 'pop',
    duration: '0:30',
    coverGradient: 'from-emerald-500 to-teal-700',
    coverIcon: '🕺',
    url: '/music/upbeat_pop.wav'
  },
  {
    id: 'lofi_sunset_1',
    title: 'Sunset Chillhop Dream',
    artist: 'Zenivio Lo-Fi Lounge',
    genre: 'Lo-Fi Chill',
    category: 'lofi',
    duration: '0:30',
    coverGradient: 'from-amber-400 to-pink-500',
    coverIcon: '☕',
    url: '/music/lofi_sunset.wav'
  },
  {
    id: 'lofi_study_2',
    title: 'Midnight Study & Rainy Beats',
    artist: 'Deep Focus Relax',
    genre: 'Lo-Fi Chill',
    category: 'lofi',
    duration: '0:30',
    coverGradient: 'from-slate-700 to-indigo-900',
    coverIcon: '🌙',
    url: '/music/lofi_chill.wav'
  }
];

const musicSearchCache = new Map();

/**
 * Searches global music catalog with multi-page pagination & infinite scrolling
 * Supports both options object or positional arguments.
 * Returns an Array with .hasMore and .count properties attached for seamless compatibility.
 */
export async function searchGlobalMusic(queryOrOptions = '', pageOrApi = 1, maybeLimitOrApi = 50, maybeApi = '') {
  let query = '';
  let page = 1;
  let limit = 50;
  let apiBase = '';

  if (typeof queryOrOptions === 'object' && queryOrOptions !== null) {
    query = queryOrOptions.query || '';
    page = queryOrOptions.page || 1;
    limit = queryOrOptions.limit || 50;
    apiBase = queryOrOptions.apiBase || '';
  } else {
    query = queryOrOptions || '';
    if (typeof pageOrApi === 'string' && pageOrApi.startsWith('http')) {
      apiBase = pageOrApi;
    } else {
      page = typeof pageOrApi === 'number' ? pageOrApi : 1;
      if (typeof maybeLimitOrApi === 'string' && maybeLimitOrApi.startsWith('http')) {
        apiBase = maybeLimitOrApi;
      } else {
        limit = typeof maybeLimitOrApi === 'number' ? maybeLimitOrApi : 50;
        apiBase = maybeApi || '';
      }
    }
  }

  const searchTerm = (typeof query === 'string' ? query : '').trim();
  const cleanApiBase = (apiBase || '').replace(/\/$/, '');
  const cacheKey = `${(searchTerm || '__trending__').toLowerCase()}_p${page}_l${limit}`;

  if (musicSearchCache.has(cacheKey)) {
    return musicSearchCache.get(cacheKey);
  }

  // 1. Try Backend Proxy with Master 6,500+ Catalog and Live Search
  try {
    const endpoint = searchTerm
      ? `${cleanApiBase}/api/music/search?term=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`
      : `${cleanApiBase}/api/music/search?term=trending&page=${page}&limit=${limit}`;

    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks)) {
        const resultList = [...data.tracks];
        resultList.hasMore = Boolean(data.hasMore);
        resultList.total = data.count || data.tracks.length;
        resultList.page = page;

        musicSearchCache.set(cacheKey, resultList);
        return resultList;
      }
    }
  } catch (err) {
    console.warn('Backend music search failed, attempting direct Apple Music fallback...', err);
  }

  // 2. Direct Fallback to Apple iTunes API
  try {
    const directQuery = searchTerm || 'arijit singh coke studio bangla';
    const directUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(directQuery)}&entity=song&limit=200`;

    const directRes = await fetch(directUrl);
    if (directRes.ok) {
      const data = await directRes.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        const allDirectTracks = data.results
          .filter((item) => item.previewUrl && item.trackName)
          .map((item) => ({
            id: `itunes_${item.trackId}`,
            title: item.trackName,
            artist: item.artistName || 'Unknown Artist',
            album: item.collectionName || '',
            url: item.previewUrl,
            coverUrl: item.artworkUrl100
              ? item.artworkUrl100.replace(/100x100bb\./, '300x300bb.')
              : '',
            genre: item.primaryGenreName || 'Music',
            duration: Math.round((item.trackTimeMillis || 30000) / 1000),
          }));

        const start = (page - 1) * limit;
        const pagedDirect = allDirectTracks.slice(start, start + limit);
        const resultList = [...pagedDirect];
        resultList.hasMore = start + limit < allDirectTracks.length;
        resultList.total = allDirectTracks.length;
        resultList.page = page;

        if (resultList.length > 0) {
          musicSearchCache.set(cacheKey, resultList);
          return resultList;
        }
      }
    }
  } catch (directErr) {
    console.warn('Direct Apple Music fallback failed:', directErr);
  }

  // 3. Fallback to local curated tracks
  const localFiltered = STORY_MUSIC_CATALOG.filter((item) => {
    if (!searchTerm) return true;
    return (
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const localRes = [...localFiltered];
  localRes.hasMore = false;
  localRes.total = localFiltered.length;
  localRes.page = 1;
  return localRes;
}
