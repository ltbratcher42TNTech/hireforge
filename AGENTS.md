# AGENTS.md — Resume Builder (CSC3100 Final)

## Project Overview
This is a locally run resume builder web application built for a web development final project.
It uses a plain HTML/CSS/JS frontend with Bootstrap 5, and a Node.js/Express backend with SQLite.
There is no framework on the frontend (no React, no Vue). The backend serves RESTful API routes only.

## Project Structure
frontend/
  index.html        — Single page application, all sections shown/hidden via JS
  css/styles.css    — Minimal custom CSS, Bootstrap handles most styling
  js/app.js         — All frontend logic, organized by section with comments
  assets/           — Local copies of Bootstrap CSS and JS

backend/
  server.js         — Entry point, all Express routes organized by section
  resume.db         — SQLite database (DO NOT TOUCH)

## Primary Focus
- Primary assistance needed on the frontend (app.js and index.html)
- Secondary assistance on backend routes in server.js if asked
- Resume builder/preview section is the highest priority remaining feature

## API Response Format
All backend GET routes return a wrapped JSON object like this:
{ "message": "...", "data": [...] }
All frontend fetch calls should unwrap using objData.data

## Coding Conventions
- Hungarian Notation for all variables (str, arr, obj, bln, int prefixes)
- camelCase for all variable names
- async/await preferred over .then()
- No build tools (no Webpack, Babel, Vite)
- No external libraries without approval
- No CDNs — all libraries must be local in assets/
- Bootstrap 5 utility classes only, minimal custom CSS
- ES6+ features preferred (arrow functions, template literals, promises)
- querySelector and addEventListener over inline onclick handlers
- strQuery variable for all SQL queries before passing to db.run/db.all

## Accessibility
- All form inputs must have aria-label attributes
- WCAG 2.1+ standards required
- Lighthouse accessibility score must be 93 or higher

## DO NOT
- Do NOT touch resume.db or suggest schema changes
- Do NOT add new database tables
- Do NOT edit existing comments without confirmation
- Do NOT modify existing working code without confirmation
- Do NOT use CDNs
- Do NOT hardcode credentials
- Do NOT use React or any frontend framework
- Do NOT add libraries without approval

## Database Tables (reference only)
- tblJobs — JobID, Title, Company, StartDate, EndDate
- tblJobDetails — DetailID, JobID, Detail
- tblSkillCategories — CategoryID, Name
- tblSkills — SkillID, CategoryID, Name
- tblCertifications — CertID, Name, Issuer, DateEarned
- tblAwards — AwardID, Name, Issuer, DateEarned, Description

## Notes
- This project will be verbally defended during finals week, so it must follow my general style
- All AI generated code must be commented indicating AI assistance
- Gemini API key is stored in localStorage on the frontend, never hardcoded
- Base URL is stored as const strBaseURL = 'http://localhost:8000'
