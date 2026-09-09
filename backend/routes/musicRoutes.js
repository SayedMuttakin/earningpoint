const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const path = require('path');

// Master in-memory catalog
let masterCatalog = [];
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'master_music_catalog.json');

const loadCatalogFromFile = () => {
  try {
    if (fs.existsSync(CATALOG_PATH)) {
      const data = fs.readFileSync(CATALOG_PATH, 'utf-8');
      masterCatalog = JSON.parse(data);
      console.log(`[Music Service] Loaded ${masterCatalog.length} songs from master_music_catalog.json`);
    } else {
      console.warn('[Music Service] master_music_catalog.json not found at:', CATALOG_PATH);
    }
  } catch (err) {
    console.error('[Music Service] Error reading master_music_catalog.json:', err);
  }
};

loadCatalogFromFile();

// Helper to fetch from iTunes Search API with timeout
const searchItunes = (term, limit = 200) => {
  return new Promise((resolve) => {
    const encodedTerm = encodeURIComponent(term);
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&entity=song&limit=${limit}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent': 'ZenivioMusic/2.0',
          'Accept': 'application/json',
        },
        timeout: 8000,
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
            resolve([]);
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });

    req.on('error', () => {
      resolve([]);
    });
  });
};

// Search cache for fast pagination
const searchResultsCache = new Map();
const SEARCH_CACHE_MAX = 200;
const SEARCH_CACHE_TTL = 1000 * 60 * 30; // 30 mins

// GET /api/music/search?term=&page=1&limit=50
router.get('/search', async (req, res) => {
  try {
    const term = (req.query.term || '').trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 10), 100);

    // 1. Browsing default catalog (no term or term='trending')
    if (!term || term.toLowerCase() === 'trending') {
      const sourceList = masterCatalog.length > 0 ? masterCatalog : [];
      const total = sourceList.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const pagedTracks = sourceList.slice(start, end);
      const hasMore = end < total;

      return res.json({
        success: true,
        count: total,
        page,
        limit,
        hasMore,
        tracks: pagedTracks,
      });
    }

    // 2. Search query handling
    const cacheKey = term.toLowerCase();
    let allMatches = [];

    const now = Date.now();
    const cached = searchResultsCache.get(cacheKey);
    if (cached && (now - cached.timestamp < SEARCH_CACHE_TTL)) {
      allMatches = cached.results;
    } else {
      // Step A: Search local master catalog (ultra-fast)
      const qTokens = term.toLowerCase().split(/\s+/).filter(Boolean);
      const localMatches = masterCatalog.filter((track) => {
        const searchBlob = `${track.title} ${track.artist} ${track.album || ''} ${track.genre || ''}`.toLowerCase();
        return qTokens.every((token) => searchBlob.includes(token));
      });

      // Step B: Live iTunes Search to discover tracks outside master catalog
      let liveMatches = [];
      try {
        const rawResults = await searchItunes(term, 200);
        liveMatches = rawResults
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
            isApplePreview: true,
          }));
      } catch (err) {
        console.warn('[Music Service] Live search error:', err.message);
      }

      // Step C: Deduplicate and merge (prioritize live high-relevance matches then local)
      const seenIds = new Set();
      const merged = [];

      for (const track of liveMatches) {
        if (!seenIds.has(track.id)) {
          seenIds.add(track.id);
          merged.push(track);
        }
      }

      for (const track of localMatches) {
        if (!seenIds.has(track.id)) {
          seenIds.add(track.id);
          merged.push(track);
        }
      }

      allMatches = merged;

      // Cache search results
      if (searchResultsCache.size > SEARCH_CACHE_MAX) {
        const oldestKey = searchResultsCache.keys().next().value;
        searchResultsCache.delete(oldestKey);
      }
      searchResultsCache.set(cacheKey, {
        timestamp: now,
        results: allMatches,
      });
    }

    // Paginate results
    const total = allMatches.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const pagedTracks = allMatches.slice(start, end);
    const hasMore = end < total;

    res.json({
      success: true,
      count: total,
      page,
      limit,
      hasMore,
      tracks: pagedTracks,
    });
  } catch (err) {
    console.error('[Music Route Error]', err);
    res.status(500).json({
      success: false,
      message: 'Failed to search music catalog',
      tracks: [],
    });
  }
});

module.exports = router;
