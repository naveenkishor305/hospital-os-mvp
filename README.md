# Nadi Hospital OS MVP

Nadi is a secure clinical-operations MVP built with Next.js, TypeScript,
Tailwind CSS and Supabase. Its internal UI foundation is implemented from the
[Spine Design System](https://github.com/naveenkishor305/spine-design-system).

## Current scope

- Supabase staff email/password authentication
- Protected post-login workspace
- OPD command-centre foundation
- Persistent patient identity-and-safety bar
- Live connectivity and synchronization status
- Internal Spine component inventory at `/design-system`
- Shared loading, empty, error, restricted and critical recovery states
- Patient search at `/patients` with progressive, privacy-safe results
- Duplicate comparison with human review and no automatic merging
- Registration gating, validation, duplicate checks and safe retry behavior
- Patient-record handoff with anchored identity and provenance
- Appointment calendar at `/appointments` with provider availability and slot locking
- Conflict-safe booking, governed rescheduling, cancellation and waitlist review
- Walk-in check-in with queue-token generation and service-point assignment
- Live queue transitions, priority overrides and reasoned reassignment
- Clinical consultation at `/consultation` gated by explicit queue handoff
- Provenance-aware nursing intake, vitals and medication reconciliation
- Structured SOAP notes, coded diagnoses, orders and prescription drafts
- Allergy blocking, interaction review and deliberate clinical signing
- Immutable signed version with attributed addenda and governed visit closure
- Diagnostic worklist at `/diagnostics` with explicit order acceptance
- Identity-safe specimen collection, accession, rejection and recollection
- Separate operational fulfilment and clinical result lifecycle states
- Preliminary entry, final verification and amended-result versioning
- Persistent critical-result routing with structured response evidence
- Attributed result acknowledgement and patient communication records

The workspace currently uses clearly labelled prototype patient, appointment,
queue, consultation and diagnostic data. New bookings and workflow changes persist only
for the current browser component session. Supabase is connected for
authentication; clinical persistence is intentionally not yet connected to
production tables.

## Design-system architecture

```text
src/
├── styles/
│   ├── tokens.css       # Spine semantic and Nadi brand tokens
│   ├── base.css         # Global accessibility and typography rules
│   └── components.css   # Stable primitive states and variants
├── components/
│   ├── brand/           # Nadi identity
│   ├── appointments/    # Scheduling and live OPD queue workspace
│   ├── clinical/        # Patient context and sync patterns
│   ├── consultation/    # Governed consultation and closure workflow
│   ├── diagnostics/     # Order, specimen and result-management workflow
│   ├── layout/          # Authenticated application shell
│   └── ui/              # Shared controls, panels, badges and states
└── app/
    ├── (workspace)/     # Protected product routes
    └── login/           # Existing Supabase sign-in flow
```

Product screens should use semantic tokens and shared components. Avoid adding
one-off hex colors, focus treatments, status styles or generic action labels.

## Environment

Create `.env.local` locally with the existing Supabase project values:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Environment files are intentionally excluded from source packages.

## Run locally

```powershell
Set-Location "C:\Users\navee\Projects\hospital-os-mvp"
npm.cmd install
npm.cmd run dev
```

If port 3000 is already occupied by this project, use the existing server or
stop the reported PID before starting another process.

## Quality checks

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```
