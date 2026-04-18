# OtiumX

> *Speak your day. Understand your life.*

OtiumX is a voice journaling app that listens to how your week actually went — the small stuff, the stuck feelings, the quiet wins — and reflects it back to you as a gentle, honest life insight report powered by AI.

No forms. No prompts. Just you talking, and something thoughtful listening.

**Live:** [otiumx.web.app](https://otiumx.web.app)

---

## How it works

1. **Record a daily reflection** — hit record, talk for up to 2 minutes. Say whatever's on your mind.
2. **Do it for 7 days** — one entry per day. The app transcribes your voice and logs your mood.
3. **Generate your report** — once you have 7 entries, the AI reads through all of them and finds the patterns you might have missed.

The report covers things like: what keeps coming up in your thinking, how you seem to feel about your work, what your energy's been like, what might be worth paying attention to, and one small thing you could actually do this week.

---

## Features

- Voice recording with auto-transcription (Google Gemini)
- Mood scoring per entry (1–10)
- Multi-language support — English, Bengali, Hindi, Kannada, Malayalam
- AI insight reports — friendly, conversational, not clinical
- One journal per day (keeps you honest)
- Reports unlock after 7 entries and use your latest 7
- Secure — your journals are private, only you can read them

---

## Tech Stack

| Layer | What's used |
|---|---|
| Frontend | React 19 + TypeScript, Redux Toolkit, React Router, Vite |
| Backend | Firebase Cloud Functions (Node 20) |
| AI | Google Gemini 2.5 Flash via Genkit |
| Database | Firestore |
| Auth | Firebase Authentication |
| Hosting | Firebase Hosting |

---

## Project Structure

```
src/
  features/
    auth/         # login, register, auth state
    journal/      # recording, transcription, entry list
    reports/      # report generation and display
  services/
    firebase/     # journal, report, and auth service implementations
  types/          # shared TypeScript types

functions/
  src/
    ai.ts         # Gemini/Genkit prompt and structured output
    index.ts      # Cloud Function endpoints
```

---

## Running locally

```bash
npm install
npm run dev
```

For the backend, you'll need a Firebase project and a Gemini API key set as a Firebase Function secret (`GEMINI_KEY`).

---

## Why "OtiumX"

*Otium* is a Latin word for peaceful, reflective rest — the kind of time the Romans thought was essential for a good life. The X is just because it sounded cool.
