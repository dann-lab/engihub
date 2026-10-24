# EngiHub // Nigerian Engineering Workspace

EngiHub is a production-grade, secure engineering learning and community problem-solving workspace designed for engineering students in Nigerian universities (UNILAG, FUTA, ABU, UNN, UNILORIN, OAU, Covenant, etc.).

---

## 🔒 Security Architecture

1. **Authentication**:
   - Google Sign-In and Email/Password authentication with verification via Firebase Auth.
   - Route protection: Unauthenticated visitors see only the landing page with product preview; all internal workspace modules require an active session.
   - Onboarding flow: Prompts new students for their university, department, level, and enrolled courses.
   - User data isolation: Stored strictly under `/users/{uid}/...` in Firestore.

2. **Server-Side Gemini Protection**:
   - The Gemini API key is never exposed to the client bundle.
   - Every AI endpoint verifies the Firebase ID token in `Authorization: Bearer <token>` before processing.
   - Per-user rate limiting: 30 requests/hour and 100 requests/day.
   - Input validation & size limits (max 10MB images, max 10k character payloads).
   - Prompt-injection defense: User-submitted text and scanned notes are treated strictly as data boundaries (`[STUDENT_DATA_START] ... [STUDENT_DATA_END]`), never as instructions.
   - Internal stack traces and keys are filtered; humanized error messages are returned to clients.

3. **Firestore Security Rules**:
   - Attribute-Based Access Control (ABAC) with default-deny on all paths.
   - Private subcollections (`tutor_sessions`, `cbt_quizzes`, `weak_topics`, `scanned_notes`, `portfolio`) accessible only to the owning student UID.
   - Public Solutions Library (`/solutions_library/{solutionId}`) readable by authenticated students, editable and deletable only by the author or admin (`danielolorunlana59@gmail.com`).
   - Community moderation: Solutions with 3 or more reports are automatically hidden until admin review.

---

## 📋 Manual Configuration Checklist (Firebase & Google Cloud Console)

When deploying to production, complete these one-time steps in the [Firebase Console](https://console.firebase.google.com/) and [Google Cloud Console](https://console.cloud.google.com/):

- [ ] **1. Enable Sign-In Providers in Firebase Auth**:
  - In Firebase Console &rarr; **Build** &rarr; **Authentication** &rarr; **Sign-in method**:
    * Enable **Google** provider and configure your support email.
    * Enable **Email/Password** provider (toggle on Email link / verification as desired).
- [ ] **2. Authorize Domains**:
  - In Firebase Console &rarr; **Authentication** &rarr; **Settings** &rarr; **Authorized domains**:
    * Add your Cloud Run / custom domain (e.g., `*.run.app` or your university domain).
- [ ] **3. Restrict Google API Keys**:
  - In Google Cloud Console &rarr; **APIs & Services** &rarr; **Credentials**:
    * Locate the browser API key (used in `firebase-applet-config.json`).
    * Under **Application restrictions**, set HTTP referrers to your hosted domain.
    * Under **API restrictions**, restrict the key to **Firebase Authentication** and **Cloud Firestore API**.
- [ ] **4. Budget Alerts**:
  - In Google Cloud Console &rarr; **Billing** &rarr; **Budgets & alerts**:
    * Create a monthly budget (e.g., $10–$25) with threshold notifications at 50%, 90%, and 100% to protect against unexpected traffic surges.

---

## 🎨 Visual Design System

- **Aesthetic**: An engineer's drafting notebook.
- **Palette**: Neutral off-white drafting paper (light mode) and deep ink-charcoal (dark mode) with a 24px drafting grid. Single accent color: **Safety Orange** (`#EA580C`).
- **Typography**:
  - Headings: **Fraunces** serif
  - Body: **Inter** sans
  - Formulas & Technical Units: **JetBrains Mono**
- **Geometry**: 1px technical borders, 2–4px small-radius corners, zero rounded pill buttons, zero bouncing/glowing, zero generic AI phrases.

---

## 📦 Core Modules

1. **AI Tutor**: Step-gated derivations with mathematical rigor and an "I'm Lost" button that provides physical real-life analogies (overhead tanks, generator governors).
2. **CBT Practice Engine**: Immediate worked steps after every answer and an automated Weak Topics Dashboard for focused revision.
3. **Note Scanner**: Multimodal transcription of handwritten notes into LaTeX math and step-by-step assignment question derivations.
4. **Community Problem Lab**: COREN-grade engineering solutions for Nigerian infrastructure with Naira (₦) BEME cost breakdowns, feasibility indexes, and community moderation.
5. **Portfolio Builder**: Formal engineering dossiers formatted for SIWES submissions, COREN evaluations, and scholarship applications with 1-click print/PDF export.
6. **Progress Dashboard**: Study streaks ($d$), mastery counts, CBT score timelines, and verified competencies.
7. **Admin Console**: Available to `danielolorunlana59@gmail.com` for reviewing reported solutions and inspecting live usage counts.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start full-stack development server
npm run dev
```

Server listens on `http://localhost:3000`.

### Production Build
```bash
npm run build
npm start
```
