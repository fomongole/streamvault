# StreamVault

**StreamVault** is a high-fidelity media discovery application designed to replicate the premium user experience of major streaming platforms like Plex. Built with modern web technologies, it features a seamless, responsive interface for browsing movies and TV shows, viewing detailed metadata, and managing a personal watchlist.

### [🌐 View Live Demo](https://streamvault-lime.vercel.app/)

## 🚀 Features

### **Advanced Discovery**
- **Live Search:** Instant, debounced search dropdown for movies, TV shows, and people.
- **Infinite Scrolling:** Seamlessly load content on Genre and Category pages without manual pagination.
- **Dynamic Filtering:** Browse content by specific genres (Action, Comedy, Sci-Fi, etc.).

### **Rich User Interface**
- **Immersive Details:** Deep detail pages with blurred backdrop headers, cast lists, and metadata.
- **Actor Profiles:** Dedicated pages for actors featuring biographies and "Known For" filmography grids.
- **Where to Watch:** Integration with JustWatch data to show available streaming providers (Netflix, Amazon, etc.).
- **Trailer Integration:** Watch YouTube trailers directly within the app via a modal.

### **Personalization**
- **Local Watchlist:** Persist favorite movies and shows to the browser's local storage using **Zustand**. No login required.

---

## Tech Stack

This project uses a modern, performance-oriented stack:

- **Framework:** [React 18](https://reactjs.org/) (via [Vite](https://vitejs.dev/))
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (Custom Plex-inspired Theme)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Client) & [TanStack Query](https://tanstack.com/query/latest) (Server)
- **Routing:** [React Router DOM v6](https://reactrouter.com/)
- **Data Source:** [TMDB API](https://www.themoviedb.org/documentation/api)
- **Icons:** [Lucide React](https://lucide.dev/)

---

Data provided by The Movie Database (TMDB). This product uses the TMDB API but is not endorsed or certified by TMDB.
