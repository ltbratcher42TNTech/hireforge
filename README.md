# HireForge

A web-based resume and job application toolkit powered by AI, designed to make the job search a little less painful

Try it [here](https://www.hireforge.dev)!

HireForge helps you build and manage professional application materials. Store your experience, projects, education, skills, certifications, and awards once, then use that information to create tailored resumes and other application documents.

Want to try it without creating an account?
Use Recruiter Guest Mode on the login screen to explore the application with pre-populated demo data.

---

## Features

### Resume Builder
- Build clean, printable resumes from your stored information
- Select exactly which jobs, bullets, projects, and skills to include
- Reorder resume sections before generating
- Maintain separate information for jobs, projects, education, skills, certifications, and awards
- Store your contact info, LinkedIn, GitHub, and website to display right on the top of your resume
- Store a reusable professional summary

### AI Assistance
- Enhance individual resume bullets with Google Gemini
- Generate tailored cover letters for each job
- Generate professional interview thank-you notes
- Control tone, length, paragraph count, and which experiences are highlighted for the cover letter

### Management
- Store your professional information in one place
- Manage both your work experience and project history
- Organize skills into custom categories you can add and create
- Track certifications and awards
- User accounts with data scoped to each account

### Guest Mode
Guest Mode provides quick, immediate access to a fully populated demo account without requiring registration of an account. This makes it easy to explore HireForge before creating an account.

---

## Screenshots

![Photo displaying the dashboard](screenshots/Dashboard)
![Photo showing the resume builder screen](screenshots/resume-builder-screen)
![Completed resume](screenshots/finished-demo-resume)

---

## How It Works

1. Register or continue as a guest
2. Enter your profile, summary, education, experience, projects, skills, certifications, and awards
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

## Running Locally

### Requirements
- Node.js
- npm


### Installation & Setup

```bash
git clone https://github.com/ltbratcher42TNTech/resume-builder
cd resume-builder/backend
npm install
node initDB.js
node server.js
```

Then open [http://localhost:8000](http://localhost:8000)


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

## Desktop App (via Electron)

HireForge can also be launched as a standalone Electron application:

```bash
cd backend
npm run start:desktop
```

Launches HireForge as a standalone Electron window, no browser necessary.

---

## Project Structure

```
├── README.md
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
