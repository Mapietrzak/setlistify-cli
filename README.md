# 🎶 Setlistify CLI

Create custom Spotify playlists based on real concert setlists using the Setlist.fm and Spotify Web APIs. This interactive CLI lets you search an artist’s recent live shows, view their setlists (including openers and other performers), and build a playlist you can listen to right away.

---

## ✨ Features

- 🎤 Search recent setlists by artist name  
- 🎶 Automatically fetch the main artist’s songs  
- 👥 Optionally include openers and other acts from the same event  
- 📝 Name your playlist  
- ✅ Match songs on Spotify and create a private playlist in your account  
- 🚫 Skips duplicates and logs any missing tracks  

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/setlistify-cli.git
cd setlistify-cli

### 2. Install Dependencies 

```bash
npm install

### 3. Set Up Environment Variables 

Create a .env file using the example template:

cp .env.example .env

Then fill in the following credentials:

# .env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8888/callback

SETLISTFM_API_KEY=your_setlistfm_api_key

---

## 🧠 How It Works

1. Authorize Spotify: A browser tab will open and ask you to log in.

2. Search Artist: Enter a band name (e.g., `Radiohead`).

3. Pick a Setlist: Choose from recent shows, optionally include openers or other performers.

4. Confirm Playlist Name: Choose what to call your playlist.

5. Done!: Your playlist appears in your Spotify account 🎉

---

## 🖥️ Usage

\`node index.js\`

You'll be prompted step-by-step. Here's what a session might look like:

Enter the artist/band name: Arctic Monkeys

🎤 Recent Setlists:
1. Madison Square Garden (01-05-2024, New York)
2. The O2 (30-04-2024, London)

Choose a setlist (1–2): 1

🎶 18 songs by Arctic Monkeys.
🎤 Openers found:
  1. Fontaines D.C. (9 songs)
Would you like to include opener songs too? (y/n): y

🎤 Other performers found on the same date and venue:
Include setlist from The Last Shadow Puppets? (6 songs) (y/n): n

🎧 Enter a name for your new Spotify playlist: AM Live NYC

✅ Playlist created successfully!

---

## API Keys and Setup Info

🎧 Spotify API
Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

Create a new app

Add the redirect URI:
http://127.0.0.1:8888/callback

Copy your Client ID and Client Secret into .env

🎤 Setlist.fm API
Create an account at setlist.fm

Request an API key

Add it to .env under SETLISTFM_API_KEY

---

## 👨‍💻 Project Structure

setlistify-cli/
├── index.js                # CLI entry point
├── auth.js                 # Handles Spotify OAuth
├── spotify.js              # Finds tracks and creates playlists
├── setlist.js              # Interacts with Setlist.fm
├── .env.example            # Example environment config
├── .gitignore
├── package.json
└── README.md

## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Attribution
This project uses the [Setlist.fm API](https://www.setlist.fm/api) to retrieve setlist data.  
Please make sure to comply with their [Terms of Service](https://www.setlist.fm/legal/terms-of-service) if you use this tool or adapt it for public distribution.

Setlist data provided by [setlist.fm](https://www.setlist.fm).