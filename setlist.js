
const axios = require('axios');

const setlistApi = axios.create({
  baseURL: 'https://api.setlist.fm/rest/1.0/',
  headers: {
    'x-api-key': process.env.SETLISTFM_API_KEY,
    'Accept': 'application/json',
  },
});

async function getSetlists(artistName, max = 10) {
  const { data } = await setlistApi.get(`/search/setlists`, {
    params: {
      artistName,
      p: 1,
      sort: 'dateDesc',
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastSetlists = data.setlist.filter(set => {
    const [day, month, year] = set.eventDate.split('-');
    const eventDate = new Date(`${year}-${month}-${day}T00:00:00`);
    return eventDate <= today;
  });

  const pastSetlistsWithFlag = pastSetlists.map(set => {
    const [day, month, year] = set.eventDate.split('-');
    const eventDate = new Date(`${year}-${month}-${day}T00:00:00`);
    const isToday = eventDate.getTime() === today.getTime();

    const allSets = set.sets.set || [];

    const byArtist = [];
    const byOthers = [];

    allSets.forEach(s => {
        const artist = s.artist?.name || set.artist.name;
        const songs = s.song?.map(song => song.name) || [];

        if (artist.toLowerCase() === set.artist.name.toLowerCase()) {
            byArtist.push(...songs);
        } else {
          byOthers.push({ artist, songs });
        }
    });

    return {
        venue: `${set.venue.name} (${set.eventDate}, ${set.venue.city.name})`,
        venueId: set.venue.id,
        eventDate: set.eventDate,
        mainArtist: set.artist.name,
        mainSongs: byArtist,
        openers: byOthers,
        isToday,
    };
  });

  const recent = pastSetlistsWithFlag.slice(0, max);
  return recent;

}

async function getOtherSetlistsAtVenue(venueId, eventDate, mainArtistName) {
  const { data } = await setlistApi.get(`/search/setlists`, {
    params: {
      venueId,
      date: eventDate,
    },
  });

  const potentialOpeners = [];

  for (const set of data.setlist) {
    if (set.artist.name.toLowerCase() === mainArtistName.toLowerCase()) continue;

    const songs = set.sets.set?.flatMap(s => s.song.map(song => song.name)) || [];
    if (songs.length > 0) {
      potentialOpeners.push({
        artist: set.artist.name,
        songs,
      });
    }
  }

  return potentialOpeners;
}

module.exports = {
  getSetlists,
  getOtherSetlistsAtVenue,
};





