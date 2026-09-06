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

// GET /api/music/search?term=arijit+singh&limit=30
router.get('/search', async (req, res) => {
  try {
    const term = (req.query.term || '').trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);

    if (!term) {
      return res.json({ success: true, count: 0, tracks: [] });
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
