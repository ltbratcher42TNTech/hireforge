# HireForge

A local-first resume and job application toolkit powered by AI. Build tailored resumes, cover letters, and thank-you notes in minutes!

---

## Features

- **Resume Builder** — Generate clean, printable resumes from your profile, experience, skills, certifications, projects,and awards
- **Selective Experience** — Choose exactly which roles, bullets, and skills to include per resume
- **Section Ordering** — Reorganize resume sections before generating for maximum control
- **AI Bullet Enhancement** — Improve job description bullets using Google Gemini for stronger, more impactful wording
- **AI Resume Polish** — Polish all resume bullets at once with one click
- **Cover Letter Generator** — Create tailored cover letters with control over tone, length, paragraph count, and which experiences to highlight
- **Thank-You Letter Generator** — Generate a professional post-interview thank-you in JUST seconds
- **Profile** — Store your contact info, LinkedIn, GitHub, and website to display right on the top of your resume
- **Jobs** — Track work experience with per-job bullet points, which you can choose to include or exclude
- **Projects** — Track side projects with bullet points and URLs, separated from job experience
- **Education** — Store degrees, institutions, dates, and GPA
- **Skills** — Organize skills into custom categories
- **Certifications** — Track certifications with issuer and date
- **Awards** — Track awards and honors with descriptions
- **Professional Summary** — Store and include a summary statement on your resume
- **User Accounts** — Register and log in with a username and password. Your data is scoped to your account only
- **Change Password** — Update your password from the profile section
- **Recruiter Guest Mode** — Try out the full app instantly with pre-seeded demo data, no sign-up required (AI features excluded unless you add your API key)
- **Gemini API Key Management** — Your key is stored safely in your browser only, never on the server
- **Flexible Runtime** — Run in the browser or launch as a standalone desktop app via Electron

---

## How It Works

1. Register or continue as a guest
2. Enter your profile, summary, experience, projects, skills, certifications, and awards
3. Add your Gemini API key in the Profile section to enable AI features (optional, but very useful)
4. Select what to include and arrange section order
5. Generate a resume, cover letter, or thank-you letter
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

- Frontend: HTML, Bootstrap 5, Bootswatch Flatly theme, Vanilla JavaScript (modular)
- Backend: Node.js + Express
- Database: SQLite (local file, no setup required beyond running the initDB file)
- Auth: JWT (HMAC-signed tokens, PBKDF2 password hashing via Node crypto)
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

### Environment Variables

Create a `.env` file in the `backend/` directory:

```
PORT=8000
AUTH_TOKEN_SECRET=your-long-random-secret-here
```
`AUTH_TOKEN_SECRET` should be a long random string. You can generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```


---

## Running as a Desktop App (via Electron)

```bash
cd backend
npm run start:desktop
```

Launches HireForge as a standalone Electron window, no browser necessary.

---

## Guest Mode

Click **Continue as Recruiter Guest** on the login screen to instantly access a fully populated demo account. No registration required. Guest accounts are seeded with realistic sample data so you can explore every feature immediately.

---

## Project Structure

```
├── README.md
├── docs/
│   └── REGRESSION_CHECKLIST.md
├── backend/
│   ├── electron/
│   │   └── main.js
│   ├── routes/
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── awards.js
│   │   ├── certifications.js
│   │   ├── details.js
│   │   ├── education.js
│   │   ├── jobs.js
│   │   ├── profile.js
│   │   ├── projectdetails.js
│   │   ├── projects.js
│   │   ├── skillcategories.js
│   │   ├── skills.js
│   │   └── summary.js
│   ├── utils/
│   │   ├── auth.js
│   │   ├── db.js
│   │   ├── responses.js
│   │   ├── seedGuest.js
│   │   └── users.js
│   ├── initDB.js
│   ├── package.json
│   └── server.js
└── frontend/
├── assets/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── modules/
│       ├── auth.js
│       ├── configurations.js
│       ├── education.js
│       ├── generated-docs.js
│       ├── jobs.js
│       ├── profile.js
│       ├── projects.js
│       ├── records-summary.js
│       ├── resume-builder.js
│       └── skills.js
└── index.html
```

---

## Project Goals

- Help students and young professionals get their start in applications by creating a resume, cover letter, and properly thank recruiters
- Make job applications faster and less repetitive for the applicant
- Give users full, complete control over their data
- Provide high-quality AI assistance without locking users into a paid service
- Build a flexible toolkit for job applications

---

## Disclaimer

All AI-generated content should be reviewed before use. HireForge assists with writing and formatting. The final judgment is always yours.

---

*Built by Lanis Bratcher — Tennessee Tech University, CSC3100, Spring 2026*
