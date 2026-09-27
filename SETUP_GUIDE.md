# AgentOS: Google Cloud & Firebase Setup Guide

AgentOS is an autonomous multi-user personal AI agent platform built with React, Cloud Firestore, Firebase Auth, Google Workspace APIs, and Google Cloud Run.

---

## Architecture Overview

```
User (Browser Control Center)
       ↓ (Google Login & OAuth Scopes)
Firebase Auth (Google Provider)
       ↓
Cloud Firestore (/users/{userId}/...) [Strict Zero-Trust Tenant Isolation]
       ↓ (Background Tasks Queue)
Cloud Run Backend Daemon (server.ts)
       ↓ (Multi-Model Gemini Planner)
Gemini 3.5 Flash / 3.1 Pro (Thinking Level: HIGH)
       ↓
Tools Layer:
  ├─ Google Drive (Knowledge & CV Retrieval)
  ├─ Gmail API (Email Composition & Dispatch)
  ├─ Google Calendar (Appointment Scheduling)
  ├─ Google Sheets (Data Logging)
  ├─ Google Docs (Report Generation)
  └─ Cloud Browser Automation (Navigating & Form Submissions)
       ↓
Task Completed → TaskReport Stored in Firestore & Drive → In-App & Email Notification
```

---

## 16-Step Setup Instructions

### 1. Create Google Cloud Project
Create a Google Cloud Project in the [GCP Console](https://console.cloud.google.com/) or select `gen-lang-client-0940395063`.

### 2. Enable Required APIs
Run or enable via Console:
```bash
gcloud services enable \
  drive.googleapis.com \
  gmail.googleapis.com \
  calendar-json.googleapis.com \
  sheets.googleapis.com \
  docs.googleapis.com \
  slides.googleapis.com \
  tasks.googleapis.com \
  people.googleapis.com \
  firestore.googleapis.com \
  run.googleapis.com \
  cloudtasks.googleapis.com \
  secretmanager.googleapis.com
```

### 3. Configure OAuth Consent Screen
- User Type: External
- App name: **AgentOS**
- User support email: your authorized email
- Developer contact information
- Add Scopes:
  - `https://www.googleapis.com/auth/drive.file`
  - `https://www.googleapis.com/auth/drive.readonly`
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.readonly`
  - `https://www.googleapis.com/auth/gmail.compose`
  - `https://www.googleapis.com/auth/calendar`
  - `https://www.googleapis.com/auth/calendar.events`
  - `https://www.googleapis.com/auth/spreadsheets`
  - `https://www.googleapis.com/auth/documents`
  - `https://www.googleapis.com/auth/presentations`
  - `https://www.googleapis.com/auth/tasks`
  - `https://www.googleapis.com/auth/contacts`

### 4. Configure Google OAuth Credentials
- Create OAuth 2.0 Web Client ID
- Configure Authorized JavaScript Origins and Redirect URIs.

### 5. Configure Firebase Authentication
- Enable Google Sign-In provider in Firebase Console.
- Ensure popup authorization is supported.

### 6. Configure Cloud Firestore
- Production Database ID: `ai-studio-398e62da-c125-4781-9f9e-53a1145e861d`
- Deploy `firestore.rules` for strict `/users/{userId}/...` tenant isolation.

### 7. Configure Cloud Run
- Deploy the application container with command:
  ```bash
  gcloud run deploy agentos --source . --port 3000 --allow-unauthenticated
  ```

### 8. Configure Cloud Tasks
- Provision asynchronous execution queue for offline daemon processing.

### 9. Configure Gemini API
- Set `GEMINI_API_KEY` from Google AI Studio.

### 10. Configure Secret Manager
- Store service credentials securely; never expose OAuth client secrets or refresh tokens to client-side code.

### 11. Scopes Verification
- Verify scope alignment in `src/lib/firebase.ts`.

### 12. Authorized Domains
- Register the production Cloud Run domain in Firebase Auth Settings.

### 13. Deploy Frontend
```bash
npm run build
```

### 14. Deploy Backend
```bash
npm run start # runs server.ts with Express
```

### 15. Configure Environment Variables
Copy `.env.example` to `.env` with `GEMINI_API_KEY` and `APP_URL`.

### 16. Security Rules Verification
Run security checks against `firestore.rules`.
