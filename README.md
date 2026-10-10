# Spotify-music-player
# 🎵 Melodify — Liquid Glass Music Player

A feature-rich, fully functional Spotify clone web application built with HTML, CSS, and JavaScript, featuring a gorgeous **Liquid Glass (Glassmorphism)** dark aesthetic, custom user authentication, a fully working audio playback engine, playlist management, and a custom song adder.

![Melodify Preview](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80)

---

## ✨ Features

- **Liquid Glass UI (Glassmorphism)**: Modern dark-mode interface (`#07090f` base) featuring backdrop blurs (`backdrop-filter: blur(24px)`), ambient radial gradients, glowing Spotify-green accents (`#1ed760`), and smooth transitions.
- **Persistent User Authentication**: Floating glass login gate that saves your username in `localStorage` with a dynamic time-based greeting and sidebar logout.
- **10 Pre-loaded Tracks + Custom Audio Streaming**: Fully wired up with royalty-free MP3 stream URLs that play, pause, seek, and loop seamlessly.
- **Full Player Controls**:
  - Play / Pause, Next, Previous
  - Shuffle & Repeat modes
  - Interactive Progress bar & Volume bar with mute toggle
  - Like / Favorite songs system (saved to `localStorage`)
  - Collapsible Play Queue drawer
- **Playlist Management & Custom Song Adder**:
  - Create custom playlists instantly via modal.
  - **Add custom songs** to any playlist by providing a direct audio MP3 URL, title, artist, album, and cover image link (persisted locally).
- **Search & Discovery**:
  - Real-time live search filter matching tracks by title or artist.
  - Category genre browse view and tabbed Your Library view.

---

## 📂 Project Structure

```text
spotify-liquid-glass/
│
├── index.html       # Main structure, views, modals, and player bar
├── style.css        # Liquid glass design system and responsive layout
└── script.js        # Audio playback engine, state, storage, and interactivity
