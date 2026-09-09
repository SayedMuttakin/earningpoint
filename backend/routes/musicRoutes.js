const express = require('express');
const router = express.Router();
const https = require('https');

// Helper to fetch from iTunes Search API with timeout
const searchItunes = (term, limit = 30) => {
  return new Promise((resolve, reject) => {
    const encodedTerm = encodeURIComponent(term);
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&entity=song&limit=${limit}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'ZenivioMusic/1.0',
          'Accept': 'application/json',
        },
        timeout: 6000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.results || []);
          } catch (e) {
            reject(new Error('Invalid response from music service'));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Music service timeout'));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
};

// Cache for trending songs
let cachedTrendingTracks = [];
let lastTrendingFetch = 0;
const TRENDING_CACHE_TTL = 1000 * 60 * 60 * 2; // 2 hours

const TRENDING_ARTISTS = [
  'arijit singh',
  'coke studio bangla',
  'atif aslam',
  'anupam roy',
  'shreya ghoshal',
  'taylor swift',
  'habib wahid',
  'ed sheeran',
  'pritam'
];

const fetchTrendingHits = async () => {
  const now = Date.now();
  if (cachedTrendingTracks.length > 0 && now - lastTrendingFetch < TRENDING_CACHE_TTL) {
    return cachedTrendingTracks;
  }

  try {
    const promises = TRENDING_ARTISTS.map((artist) =>
      searchItunes(artist, 10).catch(() => [])
    );
    const resultsArray = await Promise.all(promises);
    const combined = [];
    const seenIds = new Set();

    // Interleave results from each artist for maximum variety
    const maxLen = Math.max(...resultsArray.map((arr) => arr.length));
    for (let i = 0; i < maxLen; i++) {
      for (const list of resultsArray) {
        if (list[i] && list[i].trackId && !seenIds.has(list[i].trackId)) {
          seenIds.add(list[i].trackId);
          combined.push(list[i]);
        }
      }
    }

    const formattedTracks = combined
      .filter((item) => item.previewUrl && item.trackName)
      .slice(0, 60)
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
        isApplePreview: true,
      }));

    if (formattedTracks.length > 0) {
      cachedTrendingTracks = formattedTracks;
      lastTrendingFetch = now;
    }

    return cachedTrendingTracks;
  } catch (err) {
    console.error('Failed to fetch trending hits:', err);
    return cachedTrendingTracks;
  }
};

// GET /api/music/search?term=arijit+singh&limit=50
router.get('/search', async (req, res) => {
  try {
    const term = (req.query.term || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 50);

    // If no search term or "trending", return rich trending hits catalog!
    if (!term || term.toLowerCase() === 'trending') {
      const trendingTracks = await fetchTrendingHits();
      return res.json({
        success: true,
        count: trendingTracks.length,
        tracks: trendingTracks,
      });
    }

    const rawResults = await searchItunes(term, limit);

    const tracks = rawResults
      .filter((item) => item.previewUrl && item.trackName)
      .map((item) => {
        // Upgrade 100x100 thumbnail to crisp 300x300
        const coverUrl = item.artworkUrl100
          ? item.artworkUrl100.replace(/100x100bb\./, '300x300bb.')
          : '';

        return {
          id: `itunes_${item.trackId}`,
          title: item.trackName,
          artist: item.artistName || 'Unknown Artist',
          album: item.collectionName || '',
          url: item.previewUrl,
          coverUrl,
          genre: item.primaryGenreName || 'Music',
          duration: Math.round((item.trackTimeMillis || 30000) / 1000),
          isApplePreview: true,
        };
      });

    res.json({
      success: true,
      count: tracks.length,
      tracks,
    });
  } catch (error) {
    console.error('Music search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search music catalog',
      error: error.message,
    });
  }
});

module.exports = router;
