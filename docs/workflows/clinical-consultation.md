# OPD Clinical Consultation Workflow

## 1. Workflow identity

- Module: Integrated OPD
- Workflow: Clinical consultation and encounter completion
- Primary role: Doctor
- Supporting roles: Nurse, care coordinator, diagnostic service, pharmacy, billing
- Trigger: Patient check-in is complete and the live queue records an explicit clinical handoff
- End state: Signed clinical record, documented disposition, patient instructions, and governed downstream handoffs

## 2. User goal

Review a verified patient context, document the consultation, prepare clinically justified orders and medication, sign the record deliberately, and complete the visit without losing provenance or hiding safety state.

## 3. Preconditions

1. Patient identity is resolved to one accessible record.
2. Appointment or walk-in encounter is active.
3. Patient is checked in and has a queue token where applicable.
4. Queue state is `In consultation` after an explicit handoff.
5. The clinician has permission to document and sign the encounter.

## 4. Primary flow

1. Open the consultation from the live queue.
2. Anchor the patient identity-and-safety bar.
3. Review the nursing handoff with source and timestamp.
4. Confirm two identifiers, allergies, current medication, chief complaint and vital signs.
5. Save the clinician-verified intake.
6. Complete the structured SOAP note.
7. Record a coded primary or differential diagnosis.
8. Add clinically justified lab, radiology or procedure orders where required.
9. Prepare medication only after allergy and medication reconciliation checks.
10. Save the encounter draft.
11. Review the signing-readiness summary.
12. Attest and sign version 1 while online and conflict-free.
13. Record disposition, follow-up and patient instructions.
14. Confirm communication and downstream items.
15. Complete the encounter and expose billing/follow-up handoffs.

## 5. Alternate and exception flows

### Clinical handoff missing

- Block documentation.
- Preserve the selected appointment context.
- Return the user to the live queue to explicitly start consultation.

### Allergy match

- Show the recorded allergy and matching medication together.
- Block adding the medication to the prescription draft.
- Require the clinician to choose a different medication through normal clinical judgement.

### Potential medication interaction

- Show the selected medication and matching current-medication term.
- Require an attributed clinical review rationale before adding the draft line.
- Do not make or imply an automated prescribing decision.

### Offline or synchronization conflict

- Preserve the encrypted draft and show connectivity, queued work, last sync and conflicts.
- Block signing and encounter closure until synchronization and conflict checks pass.

### Correction after signing

- Keep signed version 1 immutable.
- Record the correction as a linked, timestamped, attributed addendum.

## 6. Safety and governance rules

- The system does not diagnose disease or replace professional clinical judgement.
- AI never silently places an order, prescribes, signs or closes an encounter.
- Imported fields always show provenance and require point-of-care verification.
- A signed clinical record cannot be edited in place.
- Orders remain visibly separate from fulfilment and results.
- Clinical urgency and status are never communicated by colour alone.
- Final actions require explicit review and meaningful labels.

## 7. Information architecture

1. Persistent patient identity-and-safety bar
2. Encounter, save, sign and synchronization state
3. Clinical intake
4. Structured clinical note and diagnoses
5. Orders and prescription
6. Safety review and signature
7. Visit disposition and closure
8. Medication safety, recent results and clinical timeline side context

## 8. Prototype boundary

The MVP stores changes only in the current browser component session. It does not write clinical data to Supabase, transmit orders, issue an electronic prescription, complete billing, or claim production clinical compliance.

## 9. Acceptance criteria

- A scheduled or waiting appointment cannot open an editable consultation.
- Intake cannot complete without identity, allergy and medication verification.
- Invalid vital values produce inline review messages.
- Medication allergy matches are blocked.
- Interaction warnings require a recorded rationale.
- Signing is blocked until intake, SOAP, diagnosis and saved-state checks pass.
- Signing and encounter closure are blocked while offline.
- Signed content is locked and only correctable through an addendum.
- Encounter completion requires disposition, patient instructions and communication confirmation.
