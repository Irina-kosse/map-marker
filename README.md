# Map Marker Manager (Angular 22)

This is a technical assessment project demonstrating a simple application to manage locations on a map[cite: 3]. 

## 🚀 Live Demo
[https://irina-kosse.github.io/map-marker/](https://irina-kosse.github.io/map-marker/)

## 🛠 Tech Stack & Architecture
- **Framework:** Angular 22 (Standalone & Zoneless approach for optimal performance)[cite: 3].
- **State Management:** NGXS (utilized for robust state handling and reactivity)[cite: 3].
- **Map Integration:** OpenLayers (encapsulated within a dedicated MapService)[cite: 3].
- **UI Components:** PrimeNG.
- **Data Integrity:** Implemented Branded Types (Nominal Typing) for latitude, longitude, and opacity to ensure compile-time validation.
- **Reactivity:** Utilized Angular Signals (`selectSignal`, `viewChild`, `effect()`) for seamless state-to-UI synchronization.

## 📦 How to Run Locally
1. Ensure you have Node.js 22.x installed.
2. Clone the repository.
3. Run `npm install` to install dependencies.
4. Run `npm start` (or `ng serve`) to start the development server.
5. Open `http://localhost:4200/` in your browser.

## 📖 User Guide

### 1. Adding Markers
- **Via Header Button:** Click the **"+ Add"** button in the sidebar to open the creation dialog, enter the title, description, coordinates, color, and opacity, then click **Save**.
- **Via Map Right-Click:** Right-click anywhere on the empty map area. The dialog will open automatically with the clicked location's latitude and longitude pre-filled.

### 2. Drag & Drop
- Hover over any marker on the map until the cursor changes to `grab`.
- Click and drag the marker across the map (`grabbing` cursor).
- Release the mouse button: the marker's coordinates will immediately update in the store, sidebar card, and local storage.

### 3. Marker Context Menu (Picker)
- **Right-click on an existing marker** to open a context popover anchored directly to the marker:
  - **Edit:** Opens the edit dialog to modify marker details or styling.
  - **Delete:** Triggers a confirmation popup before removing the marker.

### 4. Sidebar & Marker List
- **Search & Filter:** Type into the search input in the sidebar to instantly filter markers by title or description.
- **Fly to Location:** Click on any marker card in the sidebar to smoothly pan and zoom the map view directly to that marker.
- **Card Actions:** Use the inline **Edit** and **Delete** buttons on each card to manage markers. Deleting from a card prompts a confirmation dialog.
- **Clear All:** Click the **"Clear all"** button at the bottom of the sidebar to remove all markers after confirming via a popup.

### 5. State Persistence
- All markers, updates, and removals are automatically synchronized with the browser's `localStorage` via `@ngxs/storage-plugin` and persist across page reloads.
