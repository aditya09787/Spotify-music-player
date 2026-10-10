"use strict";

const cover = (id, width = 700) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
// SoundHelix example MP3s are demo streams; replace these with appropriately licensed catalog tracks for a release.
const tracks = [
  { id: "t1", title: "SoundHelix Song 01", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Electronic", duration: 372.715083, cover: cover("photo-1519608487953-e999c86e7455"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "t2", title: "SoundHelix Song 02", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Electronic", duration: 425.952625, cover: cover("photo-1470225620780-dba8ba36b745"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "t3", title: "SoundHelix Song 03", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Ambient", duration: 344.084875, cover: cover("photo-1470252649378-9c29740c9fa8"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "t4", title: "SoundHelix Song 04", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Indie", duration: 302.524083, cover: cover("photo-1470813740244-df37b8c1edcb"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: "t5", title: "SoundHelix Song 05", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Chill", duration: 353.959167, cover: cover("photo-1500530855697-b586d89ba3ee"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: "t6", title: "SoundHelix Song 06", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Dance", duration: 279.640792, cover: cover("photo-1492684223066-81342ee5ff30"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { id: "t7", title: "SoundHelix Song 07", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Ambient", duration: 420.623667, cover: cover("photo-1518837695005-2083093ee35b"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { id: "t8", title: "SoundHelix Song 08", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Ambient", duration: 325.302833, cover: cover("photo-1462331940025-496dfbfc7564"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id: "t9", title: "SoundHelix Song 09", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Electronic", duration: 389.355083, cover: cover("photo-1490730141103-6cac27aaab94"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
  { id: "t10", title: "SoundHelix Song 10", artist: "SoundHelix", album: "MP3 Demo Collection", genre: "Chill", duration: 527.386083, cover: cover("photo-1500534314209-a25ddb2bd429"), audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" }
];
const CUSTOM_TRACKS_STORAGE_KEY = "soundwave-custom-tracks-v1";
tracks.push(...loadCustomTracks());

const seedPlaylists = [
  { id: "made-for-you", name: "Made for you", description: "A little bit of everything, just for you.", trackIds: ["t1", "t2", "t3", "t5", "t7"] },
  { id: "late-night", name: "Late Night Drives", description: "Windows down. Thoughts off. Music up.", trackIds: ["t1", "t4", "t8", "t9", "t10"] },
  { id: "slow-mornings", name: "Slow Mornings", description: "Soft sounds for an unhurried start.", trackIds: ["t3", "t5", "t8", "t10"] },
  { id: "focus-flow", name: "Focus Flow", description: "Find your rhythm and stay in the zone.", trackIds: ["t7", "t9", "t1", "t2"] },
  { id: "all-the-feels", name: "All the feels", description: "For the days that deserve a soundtrack.", trackIds: ["t2", "t4", "t6", "t8", "t10"] }
];

const icon = (name) => {
  const paths = {
    play: '<path d="m8 5 12 7-12 7V5Z"/>',
    pause: '<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>',
    heart: '<path d="M20.8 8.7c0 4.5-8.8 10.3-8.8 10.3S3.2 13.2 3.2 8.7A4.2 4.2 0 0 1 11 6.4l1 1.1 1-1.1a4.2 4.2 0 0 1 7.8 2.3Z"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    remove: '<path d="M5 12h14"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ""}</svg>`;
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const audio = $("#audio-player");
const viewContainer = $("#view-container");
const searchInput = $("#global-search");
const AUTH_STORAGE_KEY = "soundwave-user-name";
const LIKED_STORAGE_KEY = "soundwave-liked-tracks";
const state = {
  view: "home",
  playlistId: null,
  libraryTab: "playlists",
  searchGenre: "",
  currentTrackId: "t1",
  queue: ["t2", "t3", "t4", "t5"],
  previousTracks: [],
  forwardTracks: [],
  liked: loadLikedTracks(),
  playlists: loadPlaylists(),
  history: ["home"],
  historyIndex: 0,
  shuffle: false,
  repeat: "off",
  isPlaying: false,
  volumeBeforeMute: Number($("#volume-input").value),
  userName: loadUserName()
};

function loadLikedTracks() {
  try {
    const saved = localStorage.getItem(LIKED_STORAGE_KEY);
    if (!saved) return new Set();
    const ids = JSON.parse(saved);
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
      throw new Error("Saved liked tracks have an invalid format.");
    }
    return new Set(ids.filter((id) => tracks.some((track) => track.id === id)));
  } catch (error) {
    console.error("Unable to load liked tracks.", error);
    return new Set();
  }
}

function loadCustomTracks() {
  try {
    const saved = localStorage.getItem(CUSTOM_TRACKS_STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every((track) => track && typeof track.id === "string" && typeof track.title === "string" && typeof track.artist === "string" && typeof track.album === "string" && typeof track.audioUrl === "string" && typeof track.cover === "string" && Number.isFinite(track.duration))) {
      throw new Error("Saved custom tracks have an invalid format.");
    }
    return parsed;
  } catch (error) {
    console.error("Unable to load saved custom tracks.", error);
    return [];
  }
}

function saveCustomTracks() {
  try {
    localStorage.setItem(CUSTOM_TRACKS_STORAGE_KEY, JSON.stringify(tracks.filter((track) => track.id.startsWith("custom-"))));
    return true;
  } catch (error) {
    console.error("Unable to save custom tracks.", error);
    showToast("Your custom song couldn't be saved in this browser.");
    return false;
  }
}

function saveLikedTracks() {
  try {
    localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...state.liked]));
    return true;
  } catch (error) {
    console.error("Unable to save liked tracks.", error);
    showToast("Your favorite couldn't be saved in this browser.");
    return false;
  }
}

function loadUserName() {
  try {
    const savedName = localStorage.getItem(AUTH_STORAGE_KEY);
    return savedName?.trim() || "";
  } catch (error) {
    console.error("Unable to read the saved login.", error);
    return "";
  }
}

function saveUserName(name) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, name);
    return true;
  } catch (error) {
    console.error("Unable to save the login.", error);
    showToast("Your name couldn't be saved. Check your browser storage settings.");
    return false;
  }
}

function renderAccount() {
  const name = state.userName || "Guest";
  $("#profile-name").textContent = name;
  $("#user-pill-name").textContent = name;
  $("#account-menu-name").textContent = name;
  $("#logout-button").classList.toggle("hidden", !state.userName);
  $("#account-logout").classList.toggle("hidden", !state.userName);
}

function showLogin() {
  const overlay = $("#auth-overlay");
  overlay.classList.remove("hidden");
  document.body.classList.add("auth-open");
  $("#auth-error").classList.add("hidden");
  $("#login-name").focus();
}

function hideLogin() {
  $("#auth-overlay").classList.add("hidden");
  document.body.classList.remove("auth-open");
}

function loadPlaylists() {
  try {
    const saved = localStorage.getItem("soundwave-playlists-v1");
    if (!saved) return seedPlaylists.map((playlist) => ({ ...playlist, trackIds: [...playlist.trackIds] }));
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every((item) => item && typeof item.id === "string" && typeof item.name === "string" && Array.isArray(item.trackIds))) {
      throw new Error("Saved playlists have an invalid format.");
    }
    return parsed;
  } catch (error) {
    console.error("Unable to load saved playlists.", error);
    return seedPlaylists.map((playlist) => ({ ...playlist, trackIds: [...playlist.trackIds] }));
  }
}

function savePlaylists() {
  try {
    localStorage.setItem("soundwave-playlists-v1", JSON.stringify(state.playlists));
    return true;
  } catch (error) {
    console.error("Unable to save playlists.", error);
    showToast("Your playlist couldn't be saved in this browser.");
    return false;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function trackById(id) {
  return tracks.find((track) => track.id === id);
}

function playlistById(id) {
  return state.playlists.find((playlist) => playlist.id === id);
}

function playlistTracks(playlist) {
  return playlist.trackIds.map(trackById).filter(Boolean);
}

function updateHistory(view, playlistId = null, record = true) {
  state.view = view;
  state.playlistId = playlistId;
  if (record) {
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(view === "playlist" ? `playlist:${playlistId}` : view);
    state.historyIndex = state.history.length - 1;
  }
  $$(".nav-link").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view || (view === "playlist" && button.dataset.view === "library")));
  renderView();
}

function goToHistory(direction) {
  const nextIndex = state.historyIndex + direction;
  if (nextIndex < 0 || nextIndex >= state.history.length) return;
  state.historyIndex = nextIndex;
  const target = state.history[nextIndex];
  if (target.startsWith("playlist:")) updateHistory("playlist", target.slice(9), false);
  else updateHistory(target, null, false);
}

function renderSidebar() {
  $("#playlist-nav").innerHTML = state.playlists.map((playlist) => {
    const firstTrack = playlistTracks(playlist)[0] || tracks[0];
    return `<button class="playlist-link ${state.view === "playlist" && state.playlistId === playlist.id ? "is-active" : ""}" type="button" data-playlist="${escapeHtml(playlist.id)}"><img class="playlist-mini-art" src="${firstTrack.cover}" alt="" /><span>${escapeHtml(playlist.name)}</span></button>`;
  }).join("");
}

function renderAlbumCards(list, heading, actionLabel) {
  return `<div class="section-heading"><h2>${heading}</h2><button class="text-button" type="button" data-view="library">${actionLabel}</button></div><div class="album-grid">${list.map((playlist) => {
    const art = playlistTracks(playlist)[0] || tracks[0];
    return `<article class="album-card" data-open-playlist="${escapeHtml(playlist.id)}"><div class="album-art-wrap"><img src="${art.cover}" alt="" loading="lazy" /><button class="card-play" type="button" data-play-playlist="${escapeHtml(playlist.id)}" aria-label="Play ${escapeHtml(playlist.name)}">${icon("play")}</button></div><h3>${escapeHtml(playlist.name)}</h3><p>${escapeHtml(playlist.description)}</p></article>`;
  }).join("")}</div>`;
}

function renderHome() {
  const shortcuts = state.playlists.slice(0, 6);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const greetingName = state.userName ? `, ${escapeHtml(state.userName)}` : "";
  return `<div class="greeting-row"><div><span class="eyebrow">YOUR SOUND, YOUR SPACE</span><h1>${greeting}${greetingName}</h1><p>Pick up right where the good part starts.</p></div><span class="date-label">${new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</span></div>
    <section class="hero-card"><div class="hero-copy"><span class="eyebrow">YOUR DAILY MIX</span><h2>A little more you.</h2><p>Familiar favorites and a few new discoveries, made to match your mood.</p><button class="button-primary" type="button" data-play-playlist="${escapeHtml(shortcuts[0]?.id || "")}">${icon("play")} Play your mix</button></div></section>
    <div class="section-heading"><h2>Jump back in</h2><button class="text-button" type="button" data-view="library">See all</button></div>
    <div class="shortcut-grid">${shortcuts.map((playlist) => {
      const art = playlistTracks(playlist)[0] || tracks[0];
      return `<button class="shortcut-card" type="button" data-open-playlist="${escapeHtml(playlist.id)}"><img src="${art.cover}" alt="" loading="lazy" /><span>${escapeHtml(playlist.name)}</span></button>`;
    }).join("")}</div>
    ${renderAlbumCards(state.playlists.slice(1), "Featured Liquid Mixes", "Explore all")}
    <div class="section-heading"><h2>Trending tracks</h2><button class="text-button" type="button" data-view="search">Explore music</button></div>${renderTrackRows(tracks.slice(0, 5), { showAlbum: false })}`;
}

function renderTrackRows(list, { showAlbum = true, table = false } = {}) {
  if (!list.length) return `<div class="empty-state"><span class="empty-icon">♫</span><strong>No tracks here yet</strong><p>Try a different search or add some music to your collection.</p></div>`;
  return `<div class="track-list ${table ? "track-table" : ""}">${table ? `<div class="track-table-header" aria-hidden="true"><span>#</span><span>Title</span><span>Album</span><span>Duration</span><span></span></div>` : ""}${list.map((track, index) => {
    const isCurrent = state.currentTrackId === track.id;
    return `<div class="track-row ${isCurrent ? "is-current" : ""}" role="group" tabindex="0" data-track="${track.id}" aria-label="Play ${escapeHtml(track.title)} by ${escapeHtml(track.artist)}">
      <span class="track-index">${isCurrent && state.isPlaying ? '<svg viewBox="0 0 16 16" aria-label="Now playing"><path d="M2 5h2v8H2zm5-3h2v11H7zm5 5h2v6h-2z"/></svg>' : String(index + 1).padStart(2, "0")}</span>
      <img class="track-art" src="${track.cover}" alt="" loading="lazy" />
      <span class="track-meta"><span class="track-title">${escapeHtml(track.title)}</span><span class="track-artist">${escapeHtml(track.artist)}</span></span>
      ${showAlbum ? `<span class="track-album">${escapeHtml(track.album)}</span>` : ""}
      <span class="track-duration">${formatTime(track.duration)}</span>
      <span class="track-actions"><button class="icon-button queue-add-button" type="button" data-add-queue="${escapeHtml(track.id)}" aria-label="Add ${escapeHtml(track.title)} to queue" title="Add to queue">${icon("plus")}</button><button class="icon-button heart-button ${state.liked.has(track.id) ? "is-liked" : ""}" type="button" data-like="${escapeHtml(track.id)}" aria-label="${state.liked.has(track.id) ? "Remove from" : "Add to"} Liked Songs">${icon("heart")}</button></span>
    </div>`;
  }).join("")}</div>`;
}

function renderLibrary() {
  const likedTracks = tracks.filter((track) => state.liked.has(track.id));
  const playlistContent = `<div class="album-grid">${state.playlists.map((playlist) => {
      const art = playlistTracks(playlist)[0] || tracks[0];
      return `<article class="album-card" data-open-playlist="${escapeHtml(playlist.id)}"><div class="album-art-wrap"><img src="${art.cover}" alt="" loading="lazy" /><button class="card-play" type="button" data-play-playlist="${escapeHtml(playlist.id)}" aria-label="Play ${escapeHtml(playlist.name)}">${icon("play")}</button></div><h3>${escapeHtml(playlist.name)}</h3><p>${playlistTracks(playlist).length} songs · ${escapeHtml(playlist.description)}</p></article>`;
    }).join("")}</div>`;
  const likedContent = likedTracks.length ? renderTrackRows(likedTracks) : `<div class="empty-state"><span class="empty-icon">♡</span><strong>Your liked songs will live here</strong><p>Tap the heart beside a track to save it to your collection.</p></div>`;
  return `<div class="view-heading"><div><span class="eyebrow">YOUR COLLECTION</span><h1 class="view-title">Your Library</h1><p>Your playlists and the songs you keep close.</p></div><button class="button-primary" type="button" id="library-create">${icon("plus")} New playlist</button></div>
    <div class="library-tabs" role="tablist" aria-label="Library collections">
      <button class="library-tab ${state.libraryTab === "playlists" ? "is-active" : ""}" id="tab-playlists" type="button" role="tab" aria-selected="${state.libraryTab === "playlists"}" aria-controls="library-panel" data-library-tab="playlists">Playlists <span>${state.playlists.length}</span></button>
      <button class="library-tab ${state.libraryTab === "liked" ? "is-active" : ""}" id="tab-liked" type="button" role="tab" aria-selected="${state.libraryTab === "liked"}" aria-controls="library-panel" data-library-tab="liked">Liked Songs <span>${likedTracks.length}</span></button>
    </div>
    <section id="library-panel" role="tabpanel" aria-labelledby="${state.libraryTab === "playlists" ? "tab-playlists" : "tab-liked"}">${state.libraryTab === "playlists" ? playlistContent : likedContent}</section>`;
}

function renderSearch(query = "") {
  const normalized = query.trim().toLocaleLowerCase();
  const genres = [...new Set(tracks.map((track) => track.genre))];
  const matches = tracks.filter((track) => (!normalized || `${track.title} ${track.artist}`.toLocaleLowerCase().includes(normalized)) && (!state.searchGenre || track.genre === state.searchGenre));
  const playlists = normalized ? state.playlists.filter((playlist) => `${playlist.name} ${playlist.description}`.toLocaleLowerCase().includes(normalized)) : [];
  const genreCards = `<div class="genre-grid">${genres.map((genre, index) => {
    const genreTrack = tracks.find((track) => track.genre === genre);
    return `<button class="genre-card genre-card--${index % 5} ${state.searchGenre === genre ? "is-active" : ""}" type="button" data-genre="${escapeHtml(genre)}" aria-pressed="${state.searchGenre === genre}"><img src="${genreTrack.cover}" alt="" loading="lazy" /><span>${escapeHtml(genre)}</span></button>`;
  }).join("")}</div>`;
  if (!normalized && !state.searchGenre) return `<div class="view-heading"><div><span class="eyebrow">FIND YOUR NEXT FAVORITE</span><h1 class="view-title">Search</h1><p>Search songs by title or artist, or explore a sound.</p></div></div><div class="section-heading search-category-heading"><h2>Browse by mood</h2></div>${genreCards}`;
  const playlistCards = playlists.length ? `<div class="search-results-label">Playlists</div><div class="shortcut-grid">${playlists.map((playlist) => {
    const art = playlistTracks(playlist)[0] || tracks[0];
    return `<button class="shortcut-card" type="button" data-open-playlist="${escapeHtml(playlist.id)}"><img src="${art.cover}" alt="" /><span>${escapeHtml(playlist.name)}</span></button>`;
  }).join("")}</div>` : "";
  return `<div class="view-heading"><div><span class="eyebrow">SEARCH RESULTS</span><h1 class="view-title">${normalized ? `“${escapeHtml(query.trim())}”` : escapeHtml(state.searchGenre)}</h1><p>${matches.length + playlists.length} ${matches.length + playlists.length === 1 ? "result" : "results"} in your collection.</p></div><button class="text-button" type="button" data-clear-search>Clear filters</button></div>${genreCards}${playlistCards}<div class="search-results-label">Songs</div>${renderTrackRows(matches)}`;
}

function renderPlaylist() {
  const playlist = playlistById(state.playlistId);
  if (!playlist) return renderLibrary();
  const list = playlistTracks(playlist);
  const art = list[0] || tracks[0];
  const duration = list.reduce((total, track) => total + track.duration, 0);
  return `<div class="playlist-hero"><img src="${art.cover}" alt="" /><div><span class="eyebrow">PLAYLIST</span><h1>${escapeHtml(playlist.name)}</h1><p>${escapeHtml(playlist.description)}</p><div class="playlist-hero-actions"><button class="button-primary" type="button" data-play-playlist="${escapeHtml(playlist.id)}">${icon("play")} Play All</button><button class="button-secondary" type="button" data-open-custom-song>${icon("plus")} Add Custom Song</button><span class="date-label">${list.length} songs · ${formatTime(duration)}</span></div></div></div>
    <div class="section-heading"><h2>Tracks</h2><button class="text-button" type="button" data-add-playlist="${escapeHtml(playlist.id)}">Add from catalog</button></div>${renderTrackRows(list, { table: true })}`;
}

function renderView() {
  const query = searchInput.value;
  viewContainer.innerHTML = state.view === "home" ? renderHome() : state.view === "search" ? renderSearch(query) : state.view === "playlist" ? renderPlaylist() : renderLibrary();
  renderSidebar();
  renderPlayer();
  renderQueue();
}

function renderPlayer() {
  const currentTrack = trackById(state.currentTrackId) || tracks[0];
  $("#player-track").innerHTML = `<img src="${currentTrack.cover}" alt="" /><div class="player-track-copy"><strong>${escapeHtml(currentTrack.title)}</strong><span>${escapeHtml(currentTrack.artist)}</span></div><button class="icon-button heart-button ${state.liked.has(currentTrack.id) ? "is-liked" : ""}" type="button" data-like="${currentTrack.id}" aria-label="${state.liked.has(currentTrack.id) ? "Remove from" : "Add to"} Liked Songs">${icon("heart")}</button>`;
  $("#play-button").querySelector(".play-icon").classList.toggle("hidden", state.isPlaying);
  $("#play-button").querySelector(".pause-icon").classList.toggle("hidden", !state.isPlaying);
  $("#play-button").setAttribute("aria-label", state.isPlaying ? "Pause" : "Play");
  $("#shuffle-button").classList.toggle("is-on", state.shuffle);
  $("#shuffle-button").setAttribute("aria-label", `Shuffle ${state.shuffle ? "on" : "off"}`);
  $("#repeat-button").classList.toggle("is-on", state.repeat !== "off");
  $("#repeat-button").classList.toggle("is-repeat-one", state.repeat === "one");
  $("#repeat-button").setAttribute("aria-label", `Repeat ${state.repeat === "one" ? "current track" : state.repeat}`);
  renderVolume();
  updateProgress();
}

function renderVolume() {
  const muted = audio.muted || audio.volume === 0;
  const button = $("#volume-toggle");
  button.classList.toggle("is-muted", muted);
  button.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  button.title = muted ? "Unmute" : "Mute";
  button.innerHTML = muted
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6" /></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Zm4 4a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" /></svg>';
  const volumeInput = $("#volume-input");
  volumeInput.value = String(audio.muted ? 0 : audio.volume);
  volumeInput.style.setProperty("--range-progress", `${(audio.muted ? 0 : audio.volume) * 100}%`);
}

function renderQueue() {
  const currentTrack = trackById(state.currentTrackId) || tracks[0];
  $("#queue-current").innerHTML = `<div class="queue-current-card"><img src="${currentTrack.cover}" alt="" /><div class="queue-current-copy"><strong>${escapeHtml(currentTrack.title)}</strong><span>${escapeHtml(currentTrack.artist)}</span></div><span class="queue-current-mark">♫</span></div>`;
  $("#queue-list").innerHTML = state.queue.map((id, index) => {
    const track = trackById(id);
    if (!track) return "";
    return `<div class="queue-item" data-queue-track="${track.id}" role="group" tabindex="0" aria-label="Play ${escapeHtml(track.title)}"><img src="${track.cover}" alt="" /><div class="queue-item-copy"><strong>${escapeHtml(track.title)}</strong><span>${escapeHtml(track.artist)}</span></div><button class="icon-button" type="button" data-remove-queue="${index}" aria-label="Remove ${escapeHtml(track.title)} from queue">${icon("remove")}</button></div>`;
  }).join("");
  const empty = state.queue.length === 0;
  $("#queue-empty").classList.toggle("hidden", !empty);
  $(".queue-up-next").classList.toggle("hidden", empty);
}

function updateProgress() {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
  const percent = duration ? (current / duration) * 100 : 0;
  const progress = $("#progress-input");
  progress.disabled = !duration || audio.seekable.length === 0;
  progress.value = String(percent);
  progress.style.setProperty("--range-progress", `${percent}%`);
  $("#current-time").textContent = formatTime(current);
  $("#duration-time").textContent = formatTime(duration || trackById(state.currentTrackId)?.duration || 0);
}

function playTrack(trackId, autoplay = true, rememberTrack = true) {
  const track = trackById(trackId);
  if (!track) return;
  const changed = state.currentTrackId !== trackId || audio.src !== new URL(track.audioUrl, document.baseURI).href;
  if (changed && rememberTrack && state.currentTrackId !== trackId) {
    state.previousTracks.push(state.currentTrackId);
    if (state.previousTracks.length > 50) state.previousTracks.shift();
    state.forwardTracks = [];
  }
  state.currentTrackId = trackId;
  if (changed) {
    audio.src = track.audioUrl;
    audio.load();
  }
  renderPlayer();
  renderQueue();
  if (autoplay) {
    audio.play().then(() => {
      state.isPlaying = true;
      renderPlayer();
      renderView();
    }).catch((error) => {
      if (state.currentTrackId !== trackId || error.name === "AbortError") return;
      state.isPlaying = false;
      renderPlayer();
      showToast("Playback couldn't start. Check your connection and try again.");
      console.error("Audio playback failed.", error);
    });
  } else {
    state.isPlaying = false;
    audio.pause();
    renderPlayer();
  }
}

function togglePlayback() {
  if (state.isPlaying) {
    audio.pause();
    state.isPlaying = false;
    renderPlayer();
    return;
  }
  playTrack(state.currentTrackId);
}

function playNext(ended = false) {
  if (ended && state.repeat === "one") {
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error("Unable to replay the current track.", error);
      showToast("This track couldn't be replayed.");
    });
    return;
  }
  if (!ended && state.forwardTracks.length) {
    const nextId = state.forwardTracks.pop();
    state.previousTracks.push(state.currentTrackId);
    playTrack(nextId, true, false);
    return;
  }
  let nextId;
  if (state.shuffle && state.queue.length) {
    const randomIndex = Math.floor(Math.random() * state.queue.length);
    [nextId] = state.queue.splice(randomIndex, 1);
  } else if (state.queue.length) {
    nextId = state.queue.shift();
  } else if (state.shuffle) {
    const choices = tracks.filter((track) => track.id !== state.currentTrackId);
    nextId = choices[Math.floor(Math.random() * choices.length)].id;
  } else if (state.repeat === "all") {
    nextId = tracks[(tracks.findIndex((track) => track.id === state.currentTrackId) + 1) % tracks.length].id;
  } else {
    state.isPlaying = false;
    renderView();
    return;
  }
  if (state.shuffle && !state.queue.includes(state.currentTrackId)) state.queue.push(state.currentTrackId);
  playTrack(nextId);
}

function playPrevious() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const previousId = state.previousTracks.pop();
  if (previousId) {
    state.forwardTracks.push(state.currentTrackId);
    playTrack(previousId, true, false);
    return;
  }
  const index = tracks.findIndex((track) => track.id === state.currentTrackId);
  playTrack(tracks[(index - 1 + tracks.length) % tracks.length].id);
}

function playPlaylist(playlistId) {
  const playlist = playlistById(playlistId);
  const list = playlist ? playlistTracks(playlist) : tracks;
  if (!list.length) {
    showToast("This playlist doesn't have any songs yet.");
    return;
  }
  state.queue = list.slice(1).map((track) => track.id);
  playTrack(list[0].id);
}

function toggleLike(trackId) {
  if (state.liked.has(trackId)) state.liked.delete(trackId);
  else state.liked.add(trackId);
  saveLikedTracks();
  renderView();
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  $("#toast-region").append(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

function openPlaylistModal() {
  const modal = $("#playlist-modal");
  $("#playlist-form").reset();
  $("#playlist-error").classList.add("hidden");
  modal.classList.remove("hidden");
  $("#playlist-name").focus();
}

function closePlaylistModal() {
  $("#playlist-modal").classList.add("hidden");
}

function openCustomSongModal() {
  if (!playlistById(state.playlistId)) {
    showToast("Open a playlist before adding a custom song.");
    return;
  }
  $("#custom-song-form").reset();
  $("#custom-song-error").classList.add("hidden");
  $("#custom-song-modal").classList.remove("hidden");
  $("#custom-song-title").focus();
}

function closeCustomSongModal() {
  $("#custom-song-modal").classList.add("hidden");
}

function submitCustomSong() {
  const playlist = playlistById(state.playlistId);
  if (!playlist) {
    closeCustomSongModal();
    showToast("Open a playlist before adding a custom song.");
    return;
  }
  const title = $("#custom-song-title").value.trim();
  const artist = $("#custom-song-artist").value.trim();
  const album = $("#custom-song-album").value.trim();
  const audioUrl = $("#custom-song-audio").value.trim();
  const coverUrl = $("#custom-song-cover").value.trim();
  const error = $("#custom-song-error");
  const showError = (message) => {
    error.textContent = message;
    error.classList.remove("hidden");
  };
  let audio;
  let artwork;
  try {
    audio = new URL(audioUrl);
    if (!["http:", "https:"].includes(audio.protocol)) throw new Error("Unsupported audio URL protocol.");
    if (coverUrl) {
      artwork = new URL(coverUrl);
      if (!["http:", "https:"].includes(artwork.protocol)) throw new Error("Unsupported cover URL protocol.");
    }
  } catch {
    showError("Enter a valid HTTP or HTTPS URL for the MP3 and cover image.");
    return;
  }
  if (!title || !artist || !album) {
    showError("Add a title, artist, and album to continue.");
    return;
  }
  const track = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    artist,
    album,
    genre: "Custom",
    duration: 0,
    cover: artwork?.href || tracks[0].cover,
    audioUrl: audio.href
  };
  tracks.push(track);
  playlist.trackIds.push(track.id);
  if (!saveCustomTracks()) {
    tracks.pop();
    playlist.trackIds.pop();
    return;
  }
  if (!savePlaylists()) {
    tracks.pop();
    playlist.trackIds.pop();
    saveCustomTracks();
    return;
  }
  closeCustomSongModal();
  renderView();
  showToast(`“${title}” was added to ${playlist.name}.`);
}

function createPlaylist(name, description) {
  const cleanName = name.trim().replace(/\s+/g, " ");
  if (!cleanName) {
    $("#playlist-error").textContent = "A playlist needs a name.";
    $("#playlist-error").classList.remove("hidden");
    $("#playlist-name").focus();
    return;
  }
  const playlist = { id: `playlist-${Date.now()}`, name: cleanName, description: description.trim() || "A collection made by you.", trackIds: [] };
  state.playlists.unshift(playlist);
  if (!savePlaylists()) {
    state.playlists.shift();
    return;
  }
  closePlaylistModal();
  updateHistory("playlist", playlist.id);
  showToast(`“${cleanName}” is ready for its first song.`);
}

function addTrackToPlaylist(playlistId, trackId) {
  const playlist = playlistById(playlistId);
  if (!playlist) return;
  if (playlist.trackIds.includes(trackId)) {
    showToast("That song is already in this playlist.");
    return;
  }
  playlist.trackIds.push(trackId);
  if (!savePlaylists()) {
    playlist.trackIds.pop();
    return;
  }
  renderView();
  showToast(`Added to ${playlist.name}.`);
}

function promptAddTrack(playlistId) {
  const playlist = playlistById(playlistId);
  if (!playlist) return;
  const available = tracks.filter((track) => !playlist.trackIds.includes(track.id));
  if (!available.length) {
    showToast("Every song in the collection is already in this playlist.");
    return;
  }
  const list = available.map((track, index) => `${index + 1}. ${track.title} — ${track.artist}`).join("\n");
  const answer = window.prompt(`Add a song to ${playlist.name} (enter its number):\n${list}`);
  if (answer === null) return;
  const index = Number.parseInt(answer, 10) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= available.length) {
    showToast("Choose one of the song numbers shown.");
    return;
  }
  addTrackToPlaylist(playlistId, available[index].id);
}

function updateSearchView() {
  if (state.view !== "search") updateHistory("search");
  else renderView();
}

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const playPlaylistButton = target.closest("[data-play-playlist]");
  if (playPlaylistButton) {
    event.stopPropagation();
    playPlaylist(playPlaylistButton.dataset.playPlaylist);
    return;
  }
  const likeButton = target.closest("[data-like]");
  if (likeButton) {
    event.stopPropagation();
    toggleLike(likeButton.dataset.like);
    return;
  }
  const removeButton = target.closest("[data-remove-queue]");
  if (removeButton) {
    event.stopPropagation();
    state.queue.splice(Number(removeButton.dataset.removeQueue), 1);
    renderQueue();
    return;
  }
  const addPlaylist = target.closest("[data-add-playlist]");
  if (addPlaylist) {
    promptAddTrack(addPlaylist.dataset.addPlaylist);
    return;
  }
  if (target.closest("[data-open-custom-song]")) {
    openCustomSongModal();
    return;
  }
  const addToQueue = target.closest("[data-add-queue]");
  if (addToQueue) {
    const track = trackById(addToQueue.dataset.addQueue);
    if (track) {
      state.queue.push(track.id);
      renderQueue();
      showToast(`Added “${track.title}” to the queue.`);
    }
    return;
  }
  const libraryTab = target.closest("[data-library-tab]");
  if (libraryTab) {
    state.libraryTab = libraryTab.dataset.libraryTab;
    renderView();
    return;
  }
  const genre = target.closest("[data-genre]");
  if (genre) {
    state.searchGenre = state.searchGenre === genre.dataset.genre ? "" : genre.dataset.genre;
    renderView();
    return;
  }
  if (target.closest("[data-clear-search]")) {
    state.searchGenre = "";
    searchInput.value = "";
    renderView();
    searchInput.focus();
    return;
  }
  if (target.closest("#close-playlist-modal, #cancel-playlist")) {
    closePlaylistModal();
    return;
  }
  if (target.closest("#close-custom-song, #cancel-custom-song")) {
    closeCustomSongModal();
    return;
  }
  const openPlaylist = target.closest("[data-open-playlist]");
  if (openPlaylist) {
    updateHistory("playlist", openPlaylist.dataset.openPlaylist);
    return;
  }
  const sidebarPlaylist = target.closest("[data-playlist]");
  if (sidebarPlaylist) {
    updateHistory("playlist", sidebarPlaylist.dataset.playlist);
    return;
  }
  const nav = target.closest("[data-view]");
  if (nav) {
    if (nav.dataset.view === "search") searchInput.value = "";
    updateHistory(nav.dataset.view);
    if (nav.dataset.view === "search") searchInput.focus();
    return;
  }
  const row = target.closest("[data-track]");
  if (row) {
    const id = row.dataset.track;
    if (state.currentTrackId === id && state.isPlaying) togglePlayback();
    else playTrack(id);
    return;
  }
  const queueItem = target.closest("[data-queue-track]");
  if (queueItem) {
    const index = state.queue.indexOf(queueItem.dataset.queueTrack);
    if (index >= 0) state.queue.splice(index, 1);
    playTrack(queueItem.dataset.queueTrack);
    return;
  }
  const viewLink = target.closest("[data-view-link]");
  if (viewLink) {
    event.preventDefault();
    updateHistory(viewLink.dataset.viewLink);
  }
  if (target.closest("#library-create")) openPlaylistModal();
});

document.addEventListener("keydown", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (event.key === "Escape" && !$("#playlist-modal").classList.contains("hidden")) {
    closePlaylistModal();
    return;
  }
  if (event.key === "Escape" && !$("#custom-song-modal").classList.contains("hidden")) {
    closeCustomSongModal();
    return;
  }
  if (event.key === "Enter" && target?.matches("[data-track], [data-queue-track]")) target.click();
  if (event.code === "Space" && target?.matches("[data-track], [data-queue-track]")) {
    event.preventDefault();
    target.click();
    return;
  }
  if (event.key === "/" && target?.tagName !== "INPUT" && target?.tagName !== "TEXTAREA") {
    event.preventDefault();
    updateSearchView();
    searchInput.focus();
  }
  if (event.code === "Space" && target?.tagName !== "INPUT" && target?.tagName !== "TEXTAREA" && target?.tagName !== "BUTTON") {
    event.preventDefault();
    togglePlayback();
  }
});

searchInput.addEventListener("focus", () => {
  if (state.view !== "search") updateHistory("search");
});
searchInput.addEventListener("input", () => {
  state.searchGenre = "";
  if (state.view !== "search") updateHistory("search");
  else renderView();
});
$("#history-back").addEventListener("click", () => goToHistory(-1));
$("#history-forward").addEventListener("click", () => goToHistory(1));
$("#create-playlist").addEventListener("click", openPlaylistModal);
$("#playlist-form").addEventListener("submit", (event) => {
  event.preventDefault();
  createPlaylist($("#playlist-name").value, $("#playlist-description").value);
});
$("#playlist-modal").addEventListener("click", (event) => {
  if (event.target === $("#playlist-modal")) closePlaylistModal();
});
$("#custom-song-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitCustomSong();
});
$("#custom-song-modal").addEventListener("click", (event) => {
  if (event.target === $("#custom-song-modal")) closeCustomSongModal();
});
$("#play-button").addEventListener("click", togglePlayback);
$("#previous-button").addEventListener("click", playPrevious);
$("#next-button").addEventListener("click", playNext);
$("#shuffle-button").addEventListener("click", () => {
  state.shuffle = !state.shuffle;
  renderPlayer();
  showToast(`Shuffle ${state.shuffle ? "on" : "off"}.`);
});
$("#repeat-button").addEventListener("click", () => {
  state.repeat = state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off";
  renderPlayer();
  showToast(`Repeat ${state.repeat === "off" ? "off" : state.repeat === "all" ? "all tracks" : "one track"}.`);
});
$("#progress-input").addEventListener("input", (event) => {
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  if (duration && audio.seekable.length) {
    audio.currentTime = (Number(event.target.value) / 100) * duration;
    updateProgress();
  }
});
$("#volume-input").addEventListener("input", (event) => {
  const volume = Number(event.target.value);
  audio.volume = volume;
  audio.muted = volume === 0;
  if (volume > 0) state.volumeBeforeMute = volume;
  renderVolume();
});
$("#volume-toggle").addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = state.volumeBeforeMute || 0.72;
  } else {
    state.volumeBeforeMute = audio.volume;
    audio.muted = true;
  }
  renderVolume();
});
$("#queue-toggle").addEventListener("click", () => $("#queue-drawer").classList.toggle("is-open"));
$("#close-queue").addEventListener("click", () => $("#queue-drawer").classList.remove("is-open"));
$("#clear-queue").addEventListener("click", () => {
  state.queue = [];
  renderQueue();
});
$("#install-app").addEventListener("click", () => showToast("To install, use your browser's menu and choose “Install app” or “Add to Home Screen”."));
const showAccountStatus = () => showToast(state.userName ? `You're signed in as ${state.userName}.` : "You're browsing as a guest.");
$("#profile-menu").addEventListener("click", showAccountStatus);
$("#user-pill").addEventListener("click", () => $("#account-menu").classList.toggle("hidden"));
function logout() {
  if (!state.userName) return;
  audio.pause();
  state.isPlaying = false;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Unable to clear the saved login.", error);
    showToast("Couldn't log out because browser storage is unavailable.");
    return;
  }
  state.userName = "";
  renderAccount();
  $("#account-menu").classList.add("hidden");
  updateHistory("home");
  showLogin();
}
$("#logout-button").addEventListener("click", logout);
$("#account-logout").addEventListener("click", logout);
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || event.target.closest("#user-pill, #account-menu")) return;
  $("#account-menu").classList.add("hidden");
});

$("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("#login-name").value.trim().replace(/\s+/g, " ");
  const error = $("#auth-error");
  if (!name) {
    error.textContent = "Please enter your name to continue.";
    error.classList.remove("hidden");
    $("#login-name").focus();
    return;
  }
  if (!saveUserName(name)) return;
  state.userName = name;
  renderAccount();
  hideLogin();
  renderView();
});

audio.volume = Number($("#volume-input").value);
renderVolume();
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("loadedmetadata", () => {
  const currentTrack = trackById(state.currentTrackId);
  if (currentTrack && Number.isFinite(audio.duration)) currentTrack.duration = audio.duration;
  updateProgress();
});
audio.addEventListener("durationchange", updateProgress);
audio.addEventListener("canplay", updateProgress);
audio.addEventListener("play", () => {
  state.isPlaying = true;
  renderPlayer();
});
audio.addEventListener("pause", () => {
  state.isPlaying = false;
  renderPlayer();
});
audio.addEventListener("ended", () => playNext(true));
audio.addEventListener("error", () => {
  if (audio.currentSrc) {
    state.isPlaying = false;
    renderPlayer();
    showToast("This track is unavailable right now.");
  }
});

renderView();
renderAccount();
if (state.userName) hideLogin();
else showLogin();