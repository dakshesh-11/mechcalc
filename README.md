# MECHCALC — Mechanical Design Workspace

Responsive Vite, React and TypeScript engineering workspace with ISO fit evaluation from controlled CSV data, taper pin, bolt torque and sheet metal calculators, SVG diagrams, and printable/PDF calculation reports.

## Local setup

Requirements: Node.js 20 or newer and pnpm (npm is also supported).

1. Create a Firebase project and register a Web app in Firebase Console.
2. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**.
3. In **Authentication → Settings → Authorized domains**, add `localhost` for development and your Vercel domain after deployment.
4. Copy `.env.example` to `.env` and fill in the six values from **Project settings → General → Your apps → SDK setup and configuration**. Restart Vite after changing environment values.
5. Install and run:

```sh
pnpm install
pnpm dev
```

The app opens at the URL Vite prints (usually `http://localhost:5173`). Without Firebase configuration, the sign-in page clearly reports setup is required and does not provide a guest or fake-login path.

## Firebase environment variables

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Firebase Web configuration is client-side project identification, not a server secret. Authentication credentials and tokens are managed by Firebase; this application does not store passwords or place credentials in local storage. Keep `.env` private and configure the same variables in Vercel. Firebase Authorized Domains and any data-service security rules must be configured for your project.

## Checks

```sh
pnpm test
pnpm build
pnpm preview
```

## Deploy to Vercel

1. Push this project to a Git provider and import it into Vercel, or run `pnpm dlx vercel` from the project directory.
2. Set the six `VITE_FIREBASE_*` variables in Vercel Project Settings → Environment Variables for the environments you use.
3. Add the deployment domain to Firebase Authentication's Authorized domains; enable Email/Password and Google sign-in in Firebase.
4. Deploy. The included `vercel.json` rewrites SPA routes to `index.html` so `/login`, `/register`, and `/app/*` load directly.

Vite embeds `VITE_*` values into the client bundle at build time, so set them before deploying/rebuilding.

## Engineering scope and assumptions

- **ISO fits:** calculations use hole and shaft deviations from a user-supplied CSV; no standard tolerance table is bundled or inferred. Use a licensed, controlled ISO 286 dataset. CSV columns: `kind,designation,minDiameterMm,maxDiameterMm,upperDeviationUm,lowerDeviationUm`.
- **Taper pin:** `1:n` means 1 mm diametral change per n mm axial length; `d = D − L/n`.
- **Bolt torque:** `T = K × F × d`, with diameter and preload converted to SI. K is an empirical assumption; the output is an estimate, not a certified safe torque.
- **Sheet metal:** `BA = θ × (R + K × T)` with θ in radians. Bend deduction uses the outside setback convention; entered flange lengths are outside dimensions. K-factor depends on material and forming conditions.
- **Reports:** calculations can be printed or exported as A4 PDFs. Recent results remain in page memory only.
- **Authentication:** Firebase manages email/password and Google authentication, local-persistent sessions, password reset and logout. Password policy is at least 8 characters with uppercase, lowercase, number and special character.

ISO values in unit tests are synthetic fixtures for calculation behavior only and are not an ISO reference table.



