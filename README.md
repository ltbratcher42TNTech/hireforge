# HireForge

A local-first resume and job application toolkit powered by AI. Build tailored resumes, cover letters, and thank-you notes in minutes!

---

## Features

- **Resume Builder** — This app can generate clean, printable resumes from your profile, experience, skills, certifications, and awards
- **Selective Experience** — Choose exactly which roles, bullets, and skills to include for each resume
- **AI Bullet Enhancement** — Improve job description bullets using Google Gemini for stronger, more impactful wording
- **Cover Letter Generator** — Create entirely custom cover letters with control over aspects such as tone, length, paragraph count, and which experiences you would like to highlight
- **Thank-You Letter Generator** — Utilize Gemini to generate a professional post-interview thank-you in mere seconds
- **Local-First & Private** — Your Gemini API key is stored in YOUR browser only. Your data never leaves your device except directly to the Gemini API
- **Flexible Runtime** — Run in the browser or launch as a standalone desktop app via Electron

---

## How It Works

1. Enter your profile, experience, skills, certifications, and awards
2. Add your Gemini API key in the Profile section
3. Select what experience to include
4. Generate a resume, cover letter, or thank-you letter
5. Customize tone, structure, and content
6. Print or copy and apply

---

## Gemini API Key

HireForge uses Google's Gemini API for any and all AI-powered features.

- Your key is stored locally in browser localStorage
- It is never sent anywhere except when it is sent directly to the Gemini API
- AI features are entirely optional, as the app works without a key

Get your free API key at [Google AI Studio](https://aistudio.google.com)

---

## Tech Stack

- Frontend: HTML, Bootstrap 5, Bootswatch Flatly theme, Vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (local file, no setup required beyond running the initDB file)
- AI: Google Gemini API (gemini-2.5-flash)
- Desktop: Electron

---

## Installation & Setup

```bash
git clone https://github.com/ltbratcher42TNTech/resume-builder
cd resume-builder/backend
npm install
node initDB.js
node server.js
```

Then open [http://localhost:8000](http://localhost:8000)

---

## Running as a Desktop App (via Electron)

```bash
cd backend
npm run start:desktop
```

Launches HireForge as a standalone Electron window, no browser necessary.

---

## Project Goals

- Help students and young professionals get their start in applications by creating a resume, cover letter, and properly thank recruiters
- Make job applications faster and less repetitive for the applicant
- Give users full, complete control over their data
- Provide high-quality AI assistance without locking users into a paid service
- Build a flexible toolkit for job applications

---

## Disclaimer

All AI-generated content should be reviewed before use. HireForge assists with
writing and formatting — final judgment is always yours.

---

## Project Structure

```
.
├── README.md
├── backend
│   ├── electron
│   │   └── main.js
│   ├── initDB.js
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
└── frontend
    ├── assets
    │   ├── bootstrap.bundle.min.js
    │   ├── bootstrap.min.css
    │   ├── flatly.css
    │   ├── images
    │   │   ├── HireForgeLogo-nobg.png
    │   │   ├── HireForgeLogo.png
    │   │   └── MeAsPenguinDev.png
    │   ├── lux.css
    │   └── sandstone.css
    ├── css
    │   └── styles.css
    ├── index.html
    └── js
        └── app.js
```

---

*Built by Lanis Bratcher — Tennessee Tech University, CSC3100, Spring 2026*