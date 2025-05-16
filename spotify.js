
const axios = require('axios');

async function getUserProfile(token) {
  const res = await axios.get('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

async function searchTrack(token, artist, track) {
  const headers = { Authorization: `Bearer ${token}` };
  const artistLC = artist.toLowerCase();

  const queries = [
    `track:${track} artist:${artist}`,
    `${track} ${artist}`,
    `${track}`
  ];

  for (const query of queries) {
    const res = await axios.get('https://api.spotify.com/v1/search', {
      headers,
      params: {
        q: query,
        type: 'track',
        limit: 5,
      },
    });

    const items = res.data.tracks.items;

    for (const item of items) {
      const itemArtistNames = item.artists.map(a => a.name.toLowerCase());
      const artistMatch = itemArtistNames.includes(artistLC);
      if (!artistMatch) continue;

      const normalize = str =>
        str
          .toLowerCase()
          .replace(/[-:–—()]/g, ' ')    
          .replace(/[^\w\s]/g, '')      
          .replace(/\s+/g, ' ')         
          .trim();

      const normalizedItemTitle = normalize(item.name);
      const normalizedQueryTitle = normalize(track);

      const titleSimilar =
        normalizedItemTitle.includes(normalizedQueryTitle) ||
        normalizedQueryTitle.includes(normalizedItemTitle);

      if (!titleSimilar) {
        console.warn(`⚠️ Title mismatch: Found "${item.name}" (wanted "${track}") by ${item.artists.map(a => a.name).join(', ')}`);
        continue;
      }

      console.log(`✅ Matched Spotify: "${item.name}" by ${item.artists.map(a => a.name).join(', ')}`);
      return item.uri;
    }
  }

  return null;
}


async function createPlaylist(token, userId, name) {
  const res = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    name,
    public: false,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.id;
}

async function addTracksToPlaylist(token, playlistId, uris) {
  await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    uris,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function createPlaylistFromSetlist(artistName, songs, token, playlistName) {
  const user = await getUserProfile(token);
  const playlistId = await createPlaylist(token, user.id, playlistName || `${artistName} - Setlist`);

  const trackUris = [];
  const seenUris = new Set();

  for (const song of songs) {
    const uri = await searchTrack(token, song.artist, song.title);

    if (!uri) {
      console.warn(`⚠️ Could not find: "${song.title}" by ${song.artist}`);
      continue;
    }

    if (seenUris.has(uri)) {
      console.warn(`⚠️ Duplicate track skipped: "${song.title}" by ${song.artist}`);
      continue;
    }

    console.log(`✅ Found: "${song.title}" by ${song.artist}`);
    trackUris.push(uri);
    seenUris.add(uri);
  }

  console.log(`\n🎧 Adding ${trackUris.length} unique tracks to playlist...`);
  await addTracksToPlaylist(token, playlistId, trackUris);
}

module.exports = { createPlaylistFromSetlist };

