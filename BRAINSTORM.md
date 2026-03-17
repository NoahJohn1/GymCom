# GymCom — Brainstorming Document

**App concept:** A gym companion app focused on workout tracking for all experience levels, targeting iOS and Android.

---

## Core Features (Must-Have)

### Workout Logging
- Log exercises with sets, reps, weight, and optional RPE (rate of perceived exertion)
- Rest timer with customizable durations per exercise
- Support for multiple rep schemes: straight sets, drop sets, supersets, circuits
- Bodyweight and cardio exercise support (distance, duration, pace)
- Quick-add from recent workouts or saved templates

### Workout Templates & Programs
- Create and save custom workout templates
- Pre-built beginner/intermediate/advanced programs (e.g., 5/3/1, PPL, GZCLP)
- Program progression tracking — auto-increment weights based on rules
- Schedule workouts to specific days of the week

### Exercise Library
- Comprehensive exercise database with muscle group, equipment, and movement type filters
- Animated or illustrated form guides
- Custom exercise creation
- Primary and secondary muscle group tagging

### Progress Tracking
- Personal records (PRs) auto-detected and celebrated
- Volume and tonnage tracking over time
- Charts for weight, reps, and estimated 1RM per exercise
- Body measurements and weight log
- Progress photos

---

## Secondary Features (Should-Have)

### Adaptive Experience
- Onboarding flow to assess experience level and goals
- Recommended starter programs for beginners
- Dynamic difficulty suggestions based on logged performance

### Nutrition (Basic)
- Calorie and macro goal setting
- Simple food log or integration with MyFitnessPal / Apple Health
- Water intake tracking

### Analytics & Insights
- Weekly/monthly workout summaries
- Muscle group frequency heatmap (are you overtraining chest?)
- Streaks and consistency metrics
- Estimated recovery status

### Notifications & Reminders
- Scheduled workout reminders
- Rest day reminders
- PR anniversary / milestone notifications

---

## Stretch Features (Nice-to-Have)

### AI / Smart Features
- AI-generated workout suggestions based on history and goals
- Plate calculator with rack visualization
- Voice input for logging during workouts (hands-free)
- Form analysis via phone camera (CV/ML)

### Social Layer (Future)
- Follow friends and see their PRs / activity
- Workout sharing (export or in-app)
- Gym buddy finder by location
- Challenges and leaderboards

### Integrations
- Apple Health / Google Fit sync
- Apple Watch / Wear OS companion for in-gym logging
- Wearable heart rate data during sessions
- Spotify / music control from within the app

### Gym & Equipment
- Gym check-in and equipment availability (crowdsourcing)
- Home gym equipment profile (only suggest exercises you can do)
- QR code scan to look up exercise for a machine

---

## UX Considerations

- **Speed is critical** — logging during a workout must be fast (< 3 taps to log a set)
- **Offline-first** — gym Wi-Fi is unreliable; all core features must work without internet
- **Dark mode** — most gym environments and user preference
- **Large tap targets** — used with sweaty hands, possibly while fatigued
- **Minimal friction onboarding** — get to first workout log in under 2 minutes

---

## Monetization Ideas

| Model | Notes |
|---|---|
| Free + Premium tier | Core logging free; programs, analytics, AI features behind paywall |
| One-time purchase | Less recurring revenue but strong user trust |
| Subscription | Monthly/annual; ~$5–10/mo market rate for fitness apps |
| Marketplace | Sell coach-created programs in-app |

---

## Competitors to Study

- **Strong** — clean UX, popular for powerlifters, good template system
- **Hevy** — social-forward, great for sharing workouts
- **JEFIT** — large exercise library, more complex UI
- **Strava** — not lifting-focused but excellent social and streak mechanics
- **Fitbod** — AI-driven workout generation, good adaptive logic

---

## Open Questions

- What makes GymCom meaningfully different from Strong or Hevy?
- Do we build social features from day one or bolt them on later?
- What does the freemium split look like — what's locked vs. free?
- Native (Swift/Kotlin) vs. cross-platform (React Native, Flutter, Expo)?
- Self-hosted backend vs. Supabase / Firebase for MVP?
