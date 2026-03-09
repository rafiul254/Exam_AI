<div align="center">
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=7c3aed&height=200&section=header&text=ExamAI&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=AI-Powered%20Smart%20Study%20Platform&descAlignY=58&descSize=20&descColor=c4b5fd" width="100%" />
</div>

<div align="center">
  <a href="#"><img src="https://img.shields.io/badge/STATUS-LIVE-22c55e?style=for-the-badge&labelColor=0f0f1a" /></a>
  <a href="#"><img src="https://img.shields.io/badge/VERSION-1.0.0-7c3aed?style=for-the-badge&labelColor=0f0f1a" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/LICENSE-MIT-06b6d4?style=for-the-badge&labelColor=0f0f1a" /></a>
  <a href="#"><img src="https://img.shields.io/badge/PRs-WELCOME-f59e0b?style=for-the-badge&labelColor=0f0f1a" /></a>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq_AI-F55036?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white" />
</div>

<br />

<p align="center">
  <b>ExamAI</b> is a full-stack MERN SaaS application that transforms <i>any</i> study material — PDFs, YouTube videos,<br />
  voice recordings, or handwritten photos — into comprehensive AI-generated study notes,<br />
  flashcards, quizzes, and mind maps. Powered by <b>LLaMA 3.3 70B</b> via Groq.
</p>

<div align="center">
  <a href="#-live-demo"><strong>🌐 Live Demo</strong></a> &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-features"><strong>✨ Features</strong></a> &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-installation"><strong>⚙️ Installation</strong></a> &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-deployment"><strong>🚀 Deployment</strong></a> &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#-api-reference"><strong>📡 API Docs</strong></a>
</div>

<br />

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend | [examai.vercel.app](#) ← *add after deploy* |
| ⚙️ Backend API | [examai-api.up.railway.app](#) ← *add after deploy* |

> 🔑 **Test credentials** — Email: `demo@examai.com` / Password: `demo1234`

---

## 📸 Screenshots

> 📌 **Add your screenshots here after deploying.**
>
> Create an `assets/` folder in the repo root, upload your screenshots, then replace the placeholders below:

```
| Dashboard | Smart Notes | Upload |
|-----------|-------------|--------|
| ![Dashboard](assets/dashboard.png) | ![Notes](assets/notes.png) | ![Upload](assets/upload.png) |

| Flashcards | Mind Map | Analytics |
|------------|----------|-----------|
| ![Flash](assets/flashcards.png) | ![Map](assets/mindmap.png) | ![Stats](assets/analytics.png) |
```

---

## ✨ Features

### 🔷 Core — 4 Ways to Generate Notes

| Method | How It Works |
|--------|-------------|
| 📄 **PDF / TXT Upload** | Drag & drop any document → Multer uploads → pdf-parse extracts text → AI generates notes |
| ▶️ **YouTube to Notes** | Paste video URL → scrape transcript from captions → fallback to description → AI summarizes |
| 🎙️ **Voice Recording** | Speak into mic → Web Speech API transcribes in real-time → AI structures the content |
| 📸 **Photo OCR** | Upload handwritten or printed image → Tesseract.js extracts text → AI generates notes |

---

### 🔷 AI Study Toolkit

Every note automatically gets all of the following generated in the background:

```
📝  Detailed Summary          4–6 paragraphs, 300+ words
💡  Simplified Explanation    Beginner-friendly + real-world analogies
⚡  Key Points                10–15 complete concept sentences
🃏  Flashcards                12+ cards (easy / medium / hard)
🎯  Quiz                      6+ MCQs with explanations
🏷️  Smart Tags                Auto-categorized topic labels
```

---

### 🔷 Smart Revision (Spaced Repetition)

```
1. Select any note from the revision page
2. Flashcard appears — read the question
3. Click to flip → see the answer
4. Rate yourself: 😕 Hard  |  🤔 Okay  |  😊 Easy
5. Progress bar fills as you complete each card
6. Session score saved → mastery % updated on note
```

---

### 🔷 Mind Maps

SVG-rendered visual mind maps generated directly from note key points. Two-panel layout: note list on the left, interactive mind map on the right. Central node expands outward to all major concept nodes.

---

### 🔷 Deep Analytics

| Widget | Data Shown |
|--------|-----------|
| 📊 Bar Chart | Minutes studied per day (last 7 days) |
| 🎯 Mastery Bars | Average mastery % per subject |
| 🔢 Stat Cards | Total notes · sessions · accuracy · study time |
| 📋 Notes Table | All notes with subject, mastery, status |

---

### 🔷 Study Rooms (Collaborative)

```
Create Room  →  Set name, topic, subject
             →  Room appears with 🟢 LIVE badge
Join Room    →  Enter real-time chat interface
             →  See member avatars + count
Chat         →  Message study partners
Leave        →  Room stays active for others
```

> Socket.io real-time sync coming in v2.0

---

### 🔷 Productivity Tools

| Tool | Details |
|------|---------|
| 🍅 **Pomodoro Timer** | 25-min focus / 5-min break · SVG ring · Pause, Resume, Reset |
| 📅 **Exam Countdown** | Set exam date → live Days / Hours / Minutes / Seconds countdown |
| 🤖 **Ask AI** | ChatGPT-style Q&A per note — answers using note content as context |

---

### 🔷 Authentication & Security

| Feature | Implementation |
|---------|---------------|
| Email/Password | bcryptjs password hashing · JWT 30-day tokens |
| Google OAuth | Google Identity Services · verified via google-auth-library |
| Forgot Password | Nodemailer sends reset link · 1-hour token expiry |
| Protected Routes | All API endpoints require valid Bearer token |

---

## 🛠️ Tech Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18 | REST API framework |
| mongoose | ^8.x | MongoDB ODM |
| groq-sdk | latest | LLaMA 3.3 70B AI |
| jsonwebtoken | ^9.x | Auth tokens |
| bcryptjs | ^2.x | Password hashing |
| multer | ^1.x | File upload handling |
| pdf-parse | ^1.x | PDF text extraction |
| nodemailer | ^6.x | Email delivery |
| google-auth-library | ^9.x | OAuth token verification |
| dotenv | ^16.x | Environment config |
| cors | ^2.x | Cross-origin requests |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.x | UI framework |
| react-router-dom | ^6.x | Client-side routing |
| axios | ^1.x | HTTP client |
| react-dropzone | ^14.x | Drag & drop uploads |
| react-hot-toast | ^2.x | Toast notifications |
| tesseract.js | ^5.x | In-browser OCR |
| vite | ^5.x | Build tool & dev server |

---

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org) v18+
- [MongoDB Atlas](https://mongodb.com/atlas) account (free M0 cluster)
- [Groq API key](https://console.groq.com) (free)
- Google Cloud project with OAuth 2.0 credentials
- Gmail with App Password enabled

---

### 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/examai.git
cd examai
```

### 2 — Backend setup

```bash
cd ExamAI-backend
npm install
```

Create `ExamAI-backend/.env`:

```env
# ─── Server ─────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Database ────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/examai

# ─── Auth ────────────────────────────────────────
JWT_SECRET=your_long_random_secret_key_here

# ─── AI ──────────────────────────────────────────
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── OAuth ───────────────────────────────────────
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

# ─── Email ───────────────────────────────────────
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# ─── CORS ────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

```bash
node server.js
```

```
✓  MongoDB connected
✓  Server running on http://localhost:5000
```

### 3 — Frontend setup

```bash
cd ExamAI-frontend
npm install
```

Create `ExamAI-frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

```bash
npm run dev
```

```
✓  App running on http://localhost:5173
```

---

## 🔑 Getting API Keys

<details>
<summary><b>🤖 Groq API Key</b> — free, takes 2 minutes</summary>

<br />

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up with GitHub or Google
3. **API Keys → Create New Key**
4. Copy the key → paste into `GROQ_API_KEY`

</details>

<details>
<summary><b>🔵 Google OAuth Client ID</b></summary>

<br />

1. [console.cloud.google.com](https://console.cloud.google.com) → New Project: `ExamAI`
2. **APIs & Services → OAuth consent screen**
    - User type: External → fill in app name & email → Save
3. **Credentials → Create Credentials → OAuth 2.0 Client ID**
    - Application type: **Web application**
    - Authorized JavaScript origins: `http://localhost:5173`
4. Copy **Client ID** → paste into **both** `.env` files

</details>

<details>
<summary><b>📧 Gmail App Password</b></summary>

<br />

1. Enable [2-Step Verification](https://myaccount.google.com/security)
2. Visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. App name: **ExamAI** → Create
4. Copy the 16-character password → paste into `EMAIL_PASS`

</details>

---

## 🚀 Deployment

### Backend → Railway

```
1. railway.app → New Project → Deploy from GitHub
2. Root directory: ExamAI-backend
3. Variables tab → add all .env values
4. Update CLIENT_URL → your Vercel frontend URL
5. Deploy → copy your Railway URL
```

### Frontend → Vercel

```
1. vercel.com → New Project → import repo
2. Root directory: ExamAI-frontend
3. Environment variables:
      VITE_GOOGLE_CLIENT_ID = your google client id
      VITE_API_URL          = https://your-railway-url.up.railway.app
4. In src/services/api.js add:
      axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
5. Deploy
```

> ⚠️ After deploying, add your Vercel domain to **Google OAuth → Authorized JavaScript Origins**

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/register` | ❌ | Create new account |
| `POST` | `/login` | ❌ | Login, returns JWT |
| `POST` | `/google` | ❌ | Login via Google credential |
| `POST` | `/forgot-password` | ❌ | Send reset email |
| `POST` | `/reset-password/:token` | ❌ | Set new password |
| `GET` | `/me` | ✅ | Get current user |

### Notes — `/api/notes`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/` | ✅ | Get all user notes |
| `GET` | `/:id` | ✅ | Get single note |
| `DELETE` | `/:id` | ✅ | Delete note |
| `PUT` | `/:id/mastery` | ✅ | Update mastery level |
| `POST` | `/:id/ask` | ✅ | Ask AI about note |

### Upload — `/api/upload`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/` | ✅ | Upload PDF or TXT file |
| `GET` | `/status/:noteId` | ✅ | Poll processing status |

### YouTube — `/api/youtube`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/` | ✅ | Process YouTube URL |

### Revision — `/api/revision`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/session` | ✅ | Save revision session |
| `GET` | `/stats` | ✅ | Get user statistics |

---

## 📁 Project Structure

```
ExamAI/
│
├── 📄 README.md
├── 📄 LICENSE
├── 📄 .gitignore
│
├── 📁 ExamAI-backend/
│   ├── 📁 middleware/
│   │   └── auth.js                   JWT verification
│   ├── 📁 models/
│   │   └── index.js                  Note · User · RevisionSession schemas
│   ├── 📁 routes/
│   │   ├── auth.js                   Register · Login · OAuth · Reset
│   │   ├── notes.js                  CRUD + Ask AI
│   │   ├── upload.js                 File upload + background processing
│   │   ├── youtube.js                Transcript scraping
│   │   └── revision.js               Session tracking
│   ├── 📁 services/
│   │   └── aiService.js              Groq prompting + JSON parsing
│   ├── 📁 uploads/                   Temp files (auto-cleared)
│   ├── server.js                     Entry point
│   ├── .env                          
│   └── package.json
│
└── 📁 ExamAI-frontend/
    ├── 📁 src/
    │   ├── 📁 components/
    │   │   ├── Layout.jsx             Sidebar + nav
    │   │   ├── StatCard.jsx           Metric card
    │   │   ├── PomodoroWidget.jsx     Focus timer
    │   │   └── ExamCountdown.jsx      Live countdown
    │   ├── 📁 context/
    │   │   └── AuthContext.jsx        Global auth state
    │   ├── 📁 pages/
    │   │   ├── Login.jsx              Email + Google + Forgot password
    │   │   ├── Register.jsx
    │   │   ├── ResetPassword.jsx
    │   │   ├── Dashboard.jsx          Overview + quick actions
    │   │   ├── Notes.jsx              Grid + search + filter
    │   │   ├── NoteDetail.jsx         Tabs: summary · flash · quiz · ask
    │   │   ├── Upload.jsx             4-method upload interface
    │   │   ├── Revision.jsx           Spaced repetition session
    │   │   ├── Analytics.jsx          Charts + tables
    │   │   ├── MindMap.jsx            SVG mind map viewer
    │   │   └── StudyRooms.jsx         Rooms list + chat
    │   ├── 📁 services/
    │   │   └── api.js                 All Axios calls
    │   ├── App.jsx                    Routes
    │   └── main.jsx                   Entry point
    ├── .env                           
    └── package.json
```

---

## 🗺️ Roadmap

- [x] AI note generation (summary, flashcards, quiz, key points)
- [x] 4 upload methods (PDF, YouTube, Voice, OCR)
- [x] Spaced repetition revision system
- [x] Mind maps
- [x] Analytics dashboard
- [x] Study rooms with chat
- [x] Google OAuth + forgot password
- [x] Pomodoro timer + exam countdown
- [ ] Socket.io real-time study rooms
- [ ] Export notes as PDF
- [ ] AI mnemonic / memory trick generator
- [ ] Mobile app (React Native)
- [ ] Stripe Pro subscription
- [ ] Browser extension for quick capture
- [ ] Collaborative note editing

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/your-feature

# 3. Commit with conventional commits
git commit -m "feat: add your feature"

# 4. Push and open a PR
git push origin feature/your-feature
```

---

## 📄 License

Distributed under the **MIT License**. See LICENSE for more information.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=7c3aed&height=100&section=footer" width="100%" />

**Built with the MERN stack · Powered by Groq AI · Designed for students**

⭐ **If ExamAI helped you study better, please give it a star!** ⭐

</div>