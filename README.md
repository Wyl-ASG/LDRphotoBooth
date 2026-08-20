# 🌸 Puri-Puri Booth (LDR Photo Booth)

> **Bring long-distance hearts together!** A real-time, peer-to-peer web photobooth for long-distance couples, friends, and families to snap, decorate, and save photobooth prints side-by-side.

🌐 **Live Demo**: [https://ld-rphoto-booth.vercel.app](https://ld-rphoto-booth.vercel.app)

> [!NOTE]  
> **Google Drive Export Notice on Live Demo**:  
> On the production website, direct Google Drive saving is currently non-functional because the Google OAuth API is in **Test Mode** (restricted to authorized test accounts). However, **all core features**—hosting, joining via Room ID, real-time video, filters, live sticker decorating, and direct high-resolution `.jpg` downloads—work 100% without Google Drive!

---

## ✨ Features

- 📹 **Real-Time WebRTC P2P Video Streaming**: Direct peer-to-peer connection powered by PeerJS. Video and data stream directly between participants without intermediate video servers.
- ⏱️ **Synchronized Camera Countdown & Burst Mode**: Dual-camera capture triggers simultaneously for host and guest, capturing high-speed burst frames and rendering both video feeds side-by-side for every pose.
- 🖼️ **Multiple Photobooth Layouts**:
  - **2x6 Photo Strips**: 3-pose & 4-pose layouts with customizable title and date footers.
  - **6x4 4R Landscape & Portrait Prints**: 1-pose, 2-pose, 3-pose, and 4-pose layouts.
- 🎨 **Real-Time Camera Filters**:
  - Normal / Raw
  - ✨ **Kawaii** (soft glow, boosted saturation, vintage pink tint)
  - 🎞️ **Vintage** (warm sepia tone)
  - 🖤 **Black & White** (high contrast monochrome)
- ✍️ **Custom Titles & Dates**: Customize romantic/festive signatures (e.g. "Groom & Bride", "Date Night", date stamps) directly on the print template.
- 🐱 **Interactive Multiplayer Decorate Stage**:
  - Add cute stamps/stickers (🐱, 🐰, 🎀, ✨, 💖, 👑, 🌸, 🧸, etc.).
  - Drag stickers live across the canvas—edits sync across both participants' screens in real-time via WebRTC data channels.
- 💾 **Instant Download, Animated GIFs & Google Drive Export**:
  - Download high-resolution JPEG prints and animated GIFs of your burst captures directly to your device.
  - Optional 1-click upload of photos and GIFs to Google Drive via Google OAuth2 integration.
- 📱 **Progressive Web App (PWA) Support**: Install the app directly to your home screen on mobile or desktop for a native-like experience.

---

## 🚀 How to Use the App

### 1. Host a Session
1. Open the application at [https://ld-rphoto-booth.vercel.app](https://ld-rphoto-booth.vercel.app).
2. Click **Start (Host)** (or **Host + Google Drive** if configured).
3. Allow browser camera permissions when prompted.
4. A unique **Room ID** (e.g., `booth-x7k9p2`) will be generated.
5. Click the copy button next to your Room ID and send it to your friend/partner.

### 2. Join as a Guest
1. Open the application on your device.
2. Click **Join Friend**.
3. Paste or type the **Room ID** provided by the host.
4. Click **Connect!** and grant camera permissions.

### 3. Take Photos
1. The **Host** configures the desired layout (Strips or 4R), camera filter, and custom titles/dates using the toolbar.
2. Click **Start Session** to begin.
3. The app executes a synchronized countdown (3..2..1) for each required pose frame.
4. Smile! Cameras snap simultaneously on both devices.

### 4. Decorate Print
1. After all poses are snapped, both participants enter the **Decorate Stage**.
2. Click any stamp icon from the toolbar to place it on the print canvas.
3. Click and drag stickers anywhere on the canvas—the movement updates in real-time for both participants!
4. When finished decorating, click **Finish & Save**.

### 5. Download & Share
1. In the **Photo Gallery**, click **Download Photo** to save the photobooth print (`.jpg`) directly to your device.
2. (Host only) Click **Save to Drive** to upload the final print to your Google Drive account.

---

## 💻 Download & Run on Your Own (Local Setup)

Follow these steps to run the application locally or host it on your own server.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm`, `yarn`, or `pnpm`
- A modern web browser (Chrome, Firefox, Safari, Edge) with camera permissions enabled.

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/LDRphotoBooth.git
cd LDRphotoBooth
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables (Optional)
If you want to enable the **Google Drive Export** feature:

1. Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
   ```
2. Get a Google OAuth 2.0 Client ID from the [Google Cloud Console](https://console.cloud.google.com/):
   - Create a project.
   - Enable the **Google Drive API**.
   - Configure the OAuth consent screen and create an **OAuth 2.0 Client ID** (Web Application).
   - Add your local origin (e.g., `http://localhost:5173`) or your domain to **Authorized JavaScript origins**.

*(Note: If you skip this step or if your Google OAuth app is in Testing mode, the app will work fully for local sessions, WebRTC P2P streaming, sticker decorating, and local JPG downloads without Google Drive export.)*

### Step 4: Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Step 5: Build for Production
To create an optimized production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + Custom Glassmorphic Purikura CSS
- **P2P Networking**: [PeerJS](https://peerjs.com/) (WebRTC Video & Data Channels)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Storage Integrations**: HTML5 Canvas Export & Google Drive REST API v3

---

## 🔒 Privacy & Permissions

- **Camera Access**: Camera streams are processed locally in your browser and transmitted directly to your connected peer over encrypted WebRTC channels (P2P). No video feed or camera data is stored on any server.
- **HTTPS Note**: Modern web browsers require HTTPS (or `localhost`) to grant camera permissions. When deploying on a public domain (e.g. Vercel, Netlify), make sure HTTPS is enabled.

---

## 📄 License

This project is open-source under the MIT License.
