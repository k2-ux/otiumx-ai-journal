# OtiumX - Architecture & Flow Document

## 1. Executive Summary

**What this app does:**
OtiumX is an AI-powered voice journaling platform designed to help users understand patterns in their own lives. Rather than typing, users speak their daily reflections; the app uses Google Gemini to transcribe the audio into text and stores the result alongside a 1-10 mood score. Once a user has accumulated 7 journal entries (one per day), they can trigger a "Strategic Life Report" — a server-side AI analysis that reads those entries, detects recurring patterns across career, mental wellbeing, physical lifestyle, and growth domains, and returns structured, human-toned insights. The report is multilingual, supporting English, Bengali, Hindi, Kannada, and Malayalam for both voice transcription and the generated analysis output.

**Tech Stack:**

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| Routing | React Router DOM v7 (data router / `createBrowserRouter`) |
| State Management | Redux Toolkit 2 (slices + async thunks with injected service dependencies) |
| Backend / Serverless | Firebase Cloud Functions v2 (Node 20, TypeScript) |
| Database | Cloud Firestore (NoSQL, document-subcollection model) |
| Authentication | Firebase Authentication (email/password) |
| AI — Transcription | Google Gemini 2.5 Flash via `@google/generative-ai` SDK |
| AI — Report Generation | Google Gemini 2.5 Flash via Genkit framework + `@genkit-ai/googleai` plugin |
| Secret Management | Firebase Secret Manager (`GEMINI_API_KEY` secret) |
| Hosting | Firebase Hosting (SPA rewrites to `index.html`) |
| Build Tool | Vite (frontend), `tsc` (Cloud Functions) |

---

## 2. High-Level Data Flow

The following describes the complete round-trip for the two primary user actions: **saving a voice journal** and **generating an insight report**.

### 2a. Voice Journal Submission

```
Browser (React UI)
  │
  │  1. User clicks Record → browser requests microphone permission
  │     via navigator.mediaDevices.getUserMedia()
  │
  ├─► MediaRecorder API
  │     • Records in 1-second chunks (audio/webm format)
  │     • Auto-stops after 2 minutes
  │     • On stop: assembles chunks into a single Blob
  │
  │  2. Blob → FileReader → Base64 string
  │
  ├─► Firebase SDK (httpsCallable)
  │     • Calls Cloud Function `transcribeAudio` with { audio: base64String }
  │     • Firebase SDK attaches user's ID token automatically
  │
  ├─► Cloud Function: transcribeAudio (Firebase Functions v2 / Node 20)
  │     • Validates that audio payload is present
  │     • Reads GEMINI_API_KEY from Firebase Secret Manager
  │     • Sends base64 audio + "Transcribe this audio" prompt
  │       to Gemini 2.5 Flash via @google/generative-ai
  │     • Returns { text: "transcription string" }
  │
  │  3. Transcript lands in React local state → user reviews, edits if needed
  │     User sets mood score (1-10 number input)
  │
  │  4. User clicks Save → dispatches createEntryThunk to Redux
  │
  ├─► Redux Thunk → FirebaseJournalService
  │     • Calls Firestore setDoc() on path:
  │       users/{uid}/journalEntries/{YYYY-MM-DD}
  │       { content, moodScore, createdAt: serverTimestamp() }
  │     • Document ID = today's date → enforces one entry per day
  │
  └─► Redux store updated
        • journalSlice.entries[date] = new entry
        • UI re-renders: Save button disables ("Today's Entry Already Submitted")
        • Progress counter increments toward the 7-entry report threshold
```

### 2b. Insight Report Generation

```
Browser (React UI)
  │
  │  1. User clicks "Generate Strategic Report"
  │     • Client-side gate: if entries < 7, show modal, abort
  │     • User selects output language
  │
  │  2. Dispatches generateReportThunk → FirebaseReportService
  │     → httpsCallable(functions, "generateInsightReport")
  │     → Firebase SDK sends request with user's ID token
  │
  ├─► Cloud Function: generateInsightReport (Firebase Functions v2 / Node 20)
  │
  │     STEP 1 — Auth check
  │       if (!request.auth) → throw HttpsError("unauthenticated")
  │
  │     STEP 2 — Fetch latest 7 Firestore entries (server-side, ordered desc)
  │       if snapshot.size < 7 → throw HttpsError("failed-precondition")
  │
  │     STEP 3 — Re-sort entries chronologically (old → new)
  │       Build journal text block: "Mood: N\nEntry: ..."
  │
  │     STEP 4 — AI analysis via Genkit + Gemini 2.5 Flash
  │       selfAnalysisFlow({ journalText, geminiKey, language })
  │       • Genkit lazy-loaded to avoid cold-start timeout
  │       • Zod output schema enforces structured JSON response
  │       • Temperature: 0.7 (creative but grounded)
  │       • Returns 9-field object (see Data Model)
  │
  │     STEP 5 — Persist report to Firestore
  │       users/{uid}/insightReports/{autoId}
  │       { ...analysis, generatedAt: serverTimestamp() }
  │
  │     STEP 6 — Return { reportId, ...analysis } to client
  │
  └─► Redux store updated
        • reportSlice.latestReport = response payload
        • ReportsPage renders all 9 report sections
```

---

## 3. Core Modules Breakdown

### Module: Application Bootstrap & Providers
**Responsibility:** Wire together the Redux store, Firebase service instances, and the React render tree. Also bridge Firebase Authentication's persistent state back into Redux on every page load or token change.

**Key Files:**
- `src/main.tsx` — React DOM root, wraps app in Redux `<Provider>`
- `src/app/App.tsx` — Subscribes to Firebase `onAuthStateChanged`; dispatches `setUser` or `setUser(null)` to Redux, making auth state reactive to Firebase's own persistence
- `src/app/providers.ts` — Instantiates the three service singletons (`FirebaseAuthService`, `FirebaseJournalService`, `FirebaseReportService`) and exports them as `services`
- `src/store/index.ts` — Configures Redux store; passes `services` as `extraArgument` to the thunk middleware so all thunks receive typed service access

**How it works:** On startup, `main.tsx` renders `<Provider store={store}><App /></Provider>`. Inside `App`, a `useEffect` registers a Firebase auth state observer that fires synchronously if a session token already exists in `localStorage` — this is what prevents a logged-in user from seeing a flash of the login page on hard refresh. The observer dispatches `setUser`, which also flips `auth.initialized = true`, unblocking the `ProtectedRoute` guard.

---

### Module: Authentication
**Responsibility:** Register new users, log existing users in and out, and protect routes that require an authenticated session.

**Key Files:**
- `src/features/auth/authSlice.ts` — Redux slice: `{ user, loading, error, initialized }`; handles pending/fulfilled/rejected for all three auth thunks
- `src/features/auth/authThunks.ts` — `loginThunk`, `registerThunk`, `logoutThunk`; delegate to injected `authService`
- `src/services/firebase/authService.ts` — `FirebaseAuthService`: wraps Firebase Auth SDK (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`)
- `src/services/interfaces/IAuthService.ts` — Contract interface enabling future service substitution
- `src/features/auth/LoginPage.tsx` / `RegisterPage.tsx` — Form UI with client-side validation
- `src/router/ProtectedRoute.tsx` — Route guard

**How it works:** On registration, `FirebaseAuthService.register()` does two things atomically from the client's perspective: creates the Firebase Auth user, then immediately calls `setDoc()` to create a `users/{uid}` Firestore document with `{ email, createdAt }`. The thunk extracts only `{ uid, email }` from the Firebase user object and stores that minimal shape in Redux as `AppUser`. The `ProtectedRoute` reads both `user` and `initialized` from Redux — it renders a loading state until `initialized` is true, then either renders children or redirects to `/login`.

---

### Module: Journal (Voice Entry)
**Responsibility:** Record voice audio, transcribe it via Gemini AI, store daily entries in Firestore, display the full entry history, and track progress toward the 7-entry report threshold.

**Key Files:**
- `src/features/journal/JournalPage.tsx` — Entire journal UI: MediaRecorder management, recording timer, language picker, transcript display, mood score input, save button, entry list
- `src/features/journal/journalSlice.ts` — Redux slice: `{ entries: Record<string, JournalEntry>, loading, error }`; entries keyed by date string
- `src/features/journal/journalThunks.ts` — `createEntryThunk`, `fetchEntriesThunk`
- `src/services/firebase/journalService.ts` — `FirebaseJournalService`: Firestore reads/writes under `users/{uid}/journalEntries`
- `src/services/interfaces/IJournalService.ts` — Contract interface (includes optional `pageSize`/`lastDoc` params for future pagination)
- `src/types/journal.ts` — `JournalEntry { id, content, moodScore, createdAt }`

**How it works:** The MediaRecorder collects audio in 1-second chunks and assembles them into an `audio/webm` Blob on stop. The Blob is converted to Base64 via `FileReader` and sent to the `transcribeAudio` Cloud Function. The returned transcript populates a `<div>` (not an `<input>`) for display. On save, `createEntryThunk` calls `journalService.createEntry(userId, date, content, moodScore)`, which uses `setDoc` with the `YYYY-MM-DD` date as the document ID — this means re-submitting on the same day silently overwrites the Firestore doc, though the UI prevents this by disabling the Save button when `entries[today]` already exists in Redux state. On mount, `fetchEntriesThunk` loads all past entries ordered by `createdAt` descending.

---

### Module: AI Report Engine
**Responsibility:** Coordinate the end-to-end pipeline that transforms raw journal entries into a structured, human-toned strategic life report using Gemini AI.

**Key Files:**
- `functions/src/index.ts` — Cloud Function `generateInsightReport` (onCall): auth guard, Firestore fetch, orchestration, persistence
- `functions/src/ai.ts` — `selfAnalysisFlow()`: Genkit + Gemini 2.5 Flash invocation with Zod-validated structured output schema
- `functions/src/transcribe.ts` — Cloud Function `transcribeAudio` (onCall): separate Gemini call for speech-to-text
- `src/features/reports/ReportsPage.tsx` — Report UI: language picker, generate button with entry-count gate, structured section renderer
- `src/features/reports/reportSlice.ts` — Redux slice: `{ loading, error, latestReport }`
- `src/features/reports/reportThunks.ts` — `generateReportThunk`
- `src/services/firebase/reportService.ts` — `FirebaseReportService`: calls `generateInsightReport` via `httpsCallable`
- `src/services/interfaces/IReportService.ts` — Contract interface

**How it works:** `generateInsightReport` is a Firebase Functions v2 `onCall` handler. It reads the GEMINI_API_KEY from Firebase Secret Manager at runtime (never exposed to the client). It fetches the user's 7 most recent entries server-side (not trusting the client), re-sorts them old-to-new for narrative coherence, and concatenates them into a text block. This is passed to `selfAnalysisFlow`, which lazy-loads Genkit to avoid increasing cold-start time. Genkit's `ai.generate()` is called with a Zod output schema, forcing Gemini to return a validated JSON object with 9 specific fields. The result is saved as a new document in `users/{uid}/insightReports` before being returned. Genkit is used for the report (structured output, schema validation) while the raw `@google/generative-ai` SDK is used for transcription (simpler, multimodal audio input).

---

### Module: Firebase Infrastructure Layer
**Responsibility:** Initialize the Firebase app once and export typed SDK instances for Auth, Firestore, and Cloud Functions so all modules import from a single source of truth.

**Key Files:**
- `src/firebase/config.ts` — `initializeApp()` with env-var config (`VITE_FIREBASE_*`)
- `src/firebase/auth.ts` — Exports `auth = getAuth(app)`
- `src/firebase/firestore.ts` — Exports `db = getFirestore(app)`
- `src/firebase/functions.ts` — Exports `functions = getFunctions(app)` (default region)
- `firebase.json` — Firebase project config: Firestore rules file, Functions source, Hosting public dir with SPA rewrite

**How it works:** The `app` singleton from `config.ts` is the root dependency. All three service modules import from it. Firestore rules are maintained in a separate `firestore.rules` file referenced in `firebase.json`. The Hosting config rewrites all routes to `index.html`, enabling React Router's client-side routing to handle deep links without 404s on hard refresh.

---

### Module: Routing & Layout
**Responsibility:** Define the application's URL structure, enforce authentication on protected routes, and render the shared navigation shell.

**Key Files:**
- `src/router/index.tsx` — `createBrowserRouter` config: two public routes (`/login`, `/register`) and one protected route group (`/`, `/reports`, `/profile`, `/about`) wrapped in `ProtectedRoute` + `AppLayout`
- `src/router/ProtectedRoute.tsx` — Auth guard component
- `src/app/AppLayout.tsx` — Sticky nav bar with active-link styling, hamburger menu for mobile (<768px), background image, glassmorphism content card; renders `<Outlet>` for child routes
- `src/features/about/AboutPage.tsx` — Static marketing/explainer page
- `src/features/profile/ProfilePage.tsx` — Displays user email, UID, and total journal count from Redux state

---

### Module: State Management (Redux Store)
**Responsibility:** Serve as the single source of truth for all async UI state, and provide typed dispatch and selector hooks to all components.

**Key Files:**
- `src/store/index.ts` — Store configuration with three slice reducers and the `services` extra argument injection
- `src/features/auth/authSlice.ts` — Auth state: `{ user: AppUser | null, loading, error, initialized }`
- `src/features/journal/journalSlice.ts` — Journal state: `{ entries: Record<dateString, JournalEntry>, loading, error }`
- `src/features/reports/reportSlice.ts` — Report state: `{ loading, error, latestReport: any | null }`

**How it works:** Redux Toolkit's `configureStore` receives `services` as `extraArgument` to the thunk middleware. Every `createAsyncThunk` defines a `ThunkConfig` interface requiring `extra.authService` / `extra.journalService` / `extra.reportService`, giving compile-time type safety on service calls. Each thunk's pending/fulfilled/rejected lifecycle maps to a loading spinner, data update, or error string in the slice. Selectors (`selectAuth`, `selectJournal`, `selectReports`) expose the slice state to components.

---

## 4. User Flows & Use Cases

### Flow: User Registration

**Happy Path:**
1. User navigates to `/register`.
2. User enters a valid email (`@` + `.` present) and password (≥ 6 chars).
3. Submit button enables; user clicks "Create Account".
4. `registerThunk` fires; `authSlice.loading = true`; button shows "Creating...".
5. `FirebaseAuthService.register()` calls `createUserWithEmailAndPassword` → Firebase creates Auth user.
6. Immediately calls `setDoc(db, "users", uid)` to create the Firestore user document with `{ email, createdAt: serverTimestamp() }`.
7. Thunk resolves; Redux sets `auth.user = { uid, email }`.
8. `navigate("/")` redirects to the protected Journal page.
9. `AppLayout` renders with the nav bar; `fetchEntriesThunk` fires on mount and returns empty list.

**Edge Cases & Error Handling:**
- **Invalid email / short password before submit:** Client-side validation runs on `onBlur`; submit button stays disabled; field border turns red with shake animation; error message appears inline.
- **Email already in use:** Firebase throws `auth/email-already-in-use`; `registerThunk.rejected` sets `authSlice.error`; displayed as a red error banner below the form via `role="alert"`.
- **Network failure during registration:** Firebase SDK throws a network error; same `rejected` path — error shown to user; Firestore document is NOT created (the `setDoc` call never reached), leaving no orphan document.
- **Firestore `setDoc` fails after Auth user created:** Auth user exists but has no Firestore record. The thunk will still resolve with the `credential.user` object (the `setDoc` await would throw, propagating to `rejected`). This is a partially inconsistent state — the user is created in Auth but has no Firestore doc. The app would still function for journaling because journal queries use `users/{uid}/journalEntries` which creates implicitly, but the user document itself would be absent.

---

### Flow: User Login & Session Restore

**Happy Path:**
1. User navigates to `/login`.
2. Enters valid credentials, clicks "Sign In".
3. `loginThunk` fires; `FirebaseAuthService.login()` calls `signInWithEmailAndPassword`.
4. Redux `auth.user` is set; `navigate("/")` fires.
5. On any subsequent page load (hard refresh), Firebase Auth detects the persisted token in `localStorage`. The `onAuthStateChanged` observer (registered in `App.tsx`'s `useEffect`) fires during app mount, dispatching `setUser({uid, email})` and setting `initialized = true`.
6. `ProtectedRoute` sees both truthy `user` and `initialized = true`, renders the app normally.

**Edge Cases & Error Handling:**
- **Wrong password / no account:** Firebase throws; `loginThunk.rejected` sets `authSlice.error`; shown as a red error banner.
- **Page refresh while logged in:** `initialized` starts as `false`. `ProtectedRoute` renders `<div>Loading...</div>` until the `onAuthStateChanged` callback fires (typically ~100–300ms). This prevents a false redirect to `/login`.
- **Page refresh while logged out:** `onAuthStateChanged` fires with `null`; `setUser(null)` dispatched; `initialized = true`; `ProtectedRoute` redirects to `/login`.
- **Expired / revoked token:** Firebase SDK silently refreshes short-lived ID tokens using the refresh token. If the refresh token is revoked (e.g., user deleted from Firebase console), the next SDK call will throw `auth/user-token-expired`; the `onAuthStateChanged` observer would fire with `null`, logging the user out.

---

### Flow: Recording & Saving a Voice Journal Entry

**Happy Path:**
1. User is on `/` (JournalPage). Past entries already loaded. Progress bar shows count toward 7.
2. User selects input language (e.g., "Hindi") and clicks "Record".
3. Browser prompts for microphone permission. On grant, `MediaRecorder` starts; recording timer counts up; "Recording... 0:01 / 2:00" appears.
4. User speaks their reflection; clicks "Stop".
5. `MediaRecorder.stop()` fires; `onstop` handler runs `processAudio()`.
6. Audio chunks assembled into `Blob` (audio/webm); converted to Base64 via `FileReader`.
7. "Processing voice..." indicator appears while `transcribeAudio` Cloud Function is called.
8. Gemini returns transcript text; displayed in transcript box.
9. User sets mood score (number input 1–10, default 5), clicks "Save Entry".
10. `createEntryThunk` dispatched; `journalService.createEntry` calls `setDoc` on `users/{uid}/journalEntries/{today}`.
11. On success: Redux adds entry; transcript field clears; Save button disables with "Today's Entry Already Submitted".

**Edge Cases & Error Handling:**
- **Microphone permission denied:** `getUserMedia` throws a `DOMException` (`NotAllowedError`). This error is currently uncaught — the app silently fails (no error message shown to user).
- **Empty recording (zero-byte Blob):** `processAudio` detects `blob.size === 0`, logs a `console.warn`, returns early. Transcript stays empty; Save button remains disabled (`!transcript` guard).
- **Transcription Cloud Function error:** Caught in a `try/catch` around `transcribe()`; only `console.error` is called — no user-facing error message is displayed. Transcript stays empty.
- **Recording longer than 2 minutes:** A `setTimeout` of 120,000ms auto-calls `stopRecording()`, preventing unbounded recordings and excessively large payloads to Gemini.
- **Attempting to save with no transcript:** `handleSave` has an early return `if (!user || !transcript)`. The Save button is also `disabled` when `!transcript`.
- **Submitting a second entry on the same day:** `alreadySubmittedToday = entries[today]`. If truthy, Save button is disabled and shows "Today's Entry Already Submitted". Even if bypassed, `setDoc` on the same date-keyed document would silently overwrite the existing Firestore entry.
- **Firestore write failure:** `createEntryThunk.rejected` sets `journalSlice.error`; rendered as `<p className="error">` below the form.

---

### Flow: Generating a Strategic Life Report

**Happy Path:**
1. User navigates to `/reports`. Entry count is ≥ 7. Progress message hidden.
2. User selects report output language (e.g., "Bengali").
3. Clicks "Generate Strategic Report".
4. `generateReportThunk` dispatched; button shows "Analyzing Your Journals...".
5. `FirebaseReportService.generateReport("bengali")` calls the `generateInsightReport` Cloud Function.
6. Cloud Function authenticates the request, fetches 7 entries from Firestore, builds journal text, calls `selfAnalysisFlow`.
7. Genkit calls Gemini 2.5 Flash with the structured prompt; Zod schema validates the response.
8. Report saved to `users/{uid}/insightReports/{autoId}`.
9. Cloud Function returns `{ reportId, corePatterns, careerDirectionSignals, ... }`.
10. Redux sets `reportSlice.latestReport`; `ReportsPage` renders all 9 sections.

**Edge Cases & Error Handling:**
- **Fewer than 7 entries — client-side gate:** `handleGenerate()` checks `progress < 7` and calls `setShowPopup(true)` instead of dispatching. A modal shows a progress bar (`{count} / 7`) and "Got it" button. The Cloud Function is never called.
- **Fewer than 7 entries — server-side gate:** Even if the client check is bypassed, the Cloud Function performs its own Firestore count. `snapshot.size < 7` throws `HttpsError("failed-precondition", "You need at least 7 journal entries...")`. `generateReportThunk.rejected` sets `reportSlice.error`; shown as `<p className="error">`.
- **Unauthenticated call:** Cloud Function throws `HttpsError("unauthenticated", "Login required.")`. This path cannot normally be reached in the app because the `ProtectedRoute` prevents access to `/reports` without a Redux user, and Firebase SDK attaches the ID token automatically.
- **Gemini API key missing at runtime:** Cloud Function throws `HttpsError("internal", "Gemini API key not available.")`. Surface to user as generic error.
- **Gemini returns no structured output:** `selfAnalysisFlow` throws `Error("AI analysis failed to produce structured output.")`. Caught by the outer `catch` in `generateInsightReport`, rethrown as `HttpsError("internal", "Failed to generate insight report.")`.
- **Any other unhandled Cloud Function error:** The outer `catch` block checks `instanceof HttpsError` to re-throw typed errors, otherwise wraps in `HttpsError("internal", ...)`. This prevents raw error messages leaking to the client.
- **Concurrent report generation requests:** No deduplication guard on the client. Multiple clicks while `loading = true` are blocked by the `disabled={loading}` button attribute, preventing duplicate function invocations.
- **Report not persisted in Redux across page refresh:** `reportSlice.latestReport` is in-memory only. On page refresh, `latestReport` resets to `null` and the placeholder image shows. The report is saved in Firestore (`insightReports` collection) but there is no fetch-on-load for past reports — generating a new report is the only way to populate the view.

---

### Flow: Logout

**Happy Path:**
1. User clicks "Logout" on the JournalPage nav area.
2. `logoutThunk` dispatched; `FirebaseAuthService.logout()` calls `signOut(auth)`.
3. Firebase clears the local token. `onAuthStateChanged` fires with `null` → `setUser(null)`.
4. `ProtectedRoute` detects `user === null` and redirects to `/login`.
5. Redux journal and report state persists in memory but is inaccessible (UI redirected).

**Edge Cases & Error Handling:**
- **Network failure during `signOut`:** Firebase `signOut` locally clears the token regardless of network status (it's a local operation). The `logoutThunk.rejected` case sets `loading = false` but does not set an error message. The user may still appear locally logged out.
- **Logout while recording:** The Logout button is in the JournalPage header alongside the recording controls. If the user clicks Logout mid-recording, the auth state change triggers a route redirect. The `MediaRecorder` stream (`streamRef.current`) is not explicitly stopped during logout. The browser will eventually garbage-collect it, but microphone access may briefly persist after redirect.

---

## Appendix: Firestore Data Model

```
users/                              (collection)
  {uid}/                            (document: { email, createdAt })
    journalEntries/                 (subcollection)
      {YYYY-MM-DD}/                 (document: { content, moodScore, createdAt })
    insightReports/                 (subcollection)
      {autoId}/                     (document: {
                                      corePatterns: string[],
                                      careerDirectionSignals: string[],
                                      mentalWellbeingSignals: string[],
                                      physicalLifestyleSignals: string[],
                                      riskFactors: string[],
                                      growthOpportunities: string[],
                                      recommendedStrategicFocus: string,
                                      nextConcreteAction: string,
                                      compoundingVector: string,
                                      generatedAt: Timestamp
                                    })
```

## Appendix: Cloud Functions

| Function | Trigger | Auth Required | Key Dependencies |
|---|---|---|---|
| `generateInsightReport` | `onCall` (HTTPS) | Yes — throws `unauthenticated` | Firebase Admin SDK, Genkit, `@genkit-ai/googleai`, Zod, GEMINI_API_KEY secret |
| `transcribeAudio` | `onCall` (HTTPS) | No explicit check | `@google/generative-ai`, GEMINI_API_KEY secret |
