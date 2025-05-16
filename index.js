#!/usr/bin/env node

require('dotenv').config();
const readline = require('readline');
const { authorize } = require('./auth');
const { getSetlists } = require('./setlist');
const { createPlaylistFromSetlist } = require('./spotify');
const { getOtherSetlistsAtVenue } = require('./setlist');

function promptUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function chooseSetlist(setlists) {
  console.log('\n🎤 Recent Setlists:\n');
  setlists.forEach((s, i) => {
    const todayTag = s.isToday ? ' 🟢 (Today)' : '';
    console.log(`${i + 1}. ${s.venue}${todayTag}`);
  });

  let index;
  while (true) {
    const input = await promptUser('\nChoose a setlist (1–' + setlists.length + '): ');
    index = parseInt(input) - 1;
    if (index >= 0 && index < setlists.length) break;
    console.log('❌ Invalid selection, try again.');
  }

  return setlists[index];
}

(async () => {
  try {
    const artistName = process.argv[2] || await promptUser('Enter the artist/band name: ');
    const setlists = await getSetlists(artistName);

    console.log(`\n🔍 Searching setlists for "${artistName}"...`);

    if (!setlists.length) {
      console.log(`⚠️ No setlists found for "${artistName}".`);
      return;
    }

    const selected = await chooseSetlist(setlists);
    //console.log('\n🔍 DEBUG selected setlist:', selected);
    console.log(`\n🎶 ${selected.mainSongs.length} songs by ${selected.mainArtist}.`);

    let combinedSongs = selected.mainSongs.map(title => ({
      title,
      artist: selected.mainArtist
    }));

  const addedArtists = new Set([selected.mainArtist]);

  if (selected.openers.length > 0) {
    console.log('\n🎤 Openers found:');
    selected.openers.forEach((opener, i) => {
        console.log(`  ${i + 1}. ${opener.artist} (${opener.songs.length} songs)`);
    });

    const addOpeners = await promptUser('Would you like to include opener songs too? (y/n): ');
    if (addOpeners.toLowerCase() === 'y') {
        for (const opener of selected.openers) {
        if (addedArtists.has(opener.artist)) continue; // 🧹 skip duplicates

        console.log(`✅ Adding songs from ${opener.artist}`);
        combinedSongs.push(...opener.songs.map(title => ({
            title,
            artist: opener.artist
        })));

        addedArtists.add(opener.artist);
        }
    }
  }

const others = await getOtherSetlistsAtVenue(selected.venueId, selected.eventDate, selected.mainArtist);

if (others.length > 0) {
  console.log('\n🎤 Other performers found on the same date and venue:');
  for (const other of others) {
    if (addedArtists.has(other.artist)) continue;

    const confirm = await promptUser(`Include setlist from ${other.artist}? (${other.songs.length} songs) (y/n): `);
    if (confirm.toLowerCase() === 'y') {
      console.log(`✅ Adding songs from ${other.artist}`);
      combinedSongs.push(...other.songs.map(title => ({
        title,
        artist: other.artist
      })));
      addedArtists.add(other.artist);
    }
  }
}

    const playlistName = await promptUser('\n🎧 Enter a name for your new Spotify playlist: ');

    const token = await authorize();
    await createPlaylistFromSetlist(selected.mainArtist, combinedSongs, token, playlistName);

    console.log('\n✅ Playlist created successfully!');
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message || err);
  }
})();
