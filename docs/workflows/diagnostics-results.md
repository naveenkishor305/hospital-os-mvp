# OPD Diagnostics, Laboratory Orders and Results Workflow

## 1. Workflow identity

- Module: Integrated OPD diagnostics
- Workflow: Order fulfilment, specimen lifecycle, result publication and clinical acknowledgement
- Primary roles: Laboratory technician, diagnostic reviewer and ordering clinician
- Supporting roles: Phlebotomist, radiology staff, nurse and care coordinator
- Trigger: A signed clinical order is routed to the performing department
- End state: Service fulfilled or exception routed, final result published, required clinical acknowledgement recorded, and patient communication documented

## 2. User goal

Fulfil each diagnostic request against the correct patient and encounter, preserve specimen or study provenance, publish a verified result, and close the clinical review loop without hiding exceptions or critical events.

## 3. Preconditions

1. Patient identity is resolved to one accessible record.
2. Order includes service, indication, priority, ordering clinician and encounter.
3. Performing department and accountable queue are known.
4. The user has permission for the next lifecycle action.
5. Consequential publication and acknowledgement actions have confirmed connectivity.

## 4. Primary flow

1. Open the department worklist without changing any order state.
2. Accept the order and establish performing-department ownership.
3. Confirm two patient identifiers at specimen collection.
4. Record specimen label, type, collector, collection time and receipt evidence.
5. Start analytical processing while keeping operational and result states separate.
6. Enter a preliminary value with unit, reference range and interpretive flag.
7. Verify patient, specimen, value, unit and source.
8. Publish the final result with an attributed diagnostic reviewer.
9. Route critical results as persistent events to one accountable clinician.
10. Record clinical interpretation or critical response evidence.
11. Document patient communication after clinical review.
12. Preserve the complete order, specimen, result and acknowledgement evidence chain.

## 5. Alternate and exception flows

### Specimen rejection

- Preserve the rejected specimen record and chain of custody.
- Require a governed rejection reason and recollection handoff.
- Move operational state to `Recollection required`.
- Do not show a clinical result as available.

### Preliminary critical value

- Keep the result visibly preliminary.
- Require diagnostic verification before final publication.
- Create the persistent critical event only after governed publication.

### Final critical result

- Show patient, test, value, unit, result time and required response together.
- Do not allow dismissal as a substitute for handling.
- Require action, outcome, follow-up owner and clinician attestation.
- Block acknowledgement while offline unless a separately governed downtime protocol exists.

### Corrected result

- Do not edit the final value in place.
- Create an amended version with reason, verifier and timestamp.
- Preserve the original value.
- Reopen clinical acknowledgement and patient communication.

## 6. Safety and governance rules

- Opening or filtering a worklist never accepts, selects or advances an order automatically.
- Patient, order, encounter and specimen association remain visible at consequential steps.
- Operational fulfilment state and clinical result state are never collapsed into one badge.
- Red is reserved for critical and destructive meaning and is never the only urgency signal.
- A critical result has one primary accountable owner and a rule-based escalation route.
- Preliminary results cannot be presented as final.
- Critical acknowledgement, final publication and amendment require confirmed synchronization.
- The application shell does not replace validated analyser, modality or diagnostic-viewer controls.

## 7. Information architecture

1. Persistent critical-result action banner
2. Department worklist and safety-weighted metrics
3. Active patient identity-and-safety context
4. Order detail with operational and result states
5. Specimen collection, accession and exception handling
6. Preliminary entry and diagnostic verification
7. Result table with value, unit, range, flag, source and time
8. Structured acknowledgement and critical response record
9. Patient communication and amended-result versioning
10. Chain of custody and audit evidence

## 8. Prototype boundary

The MVP stores changes only in the current browser component session. It does not persist orders to Supabase, print specimen labels, connect to analysers, transmit HL7/FHIR messages, control diagnostic modalities, open DICOM studies, or claim production clinical compliance.

## 9. Acceptance criteria

- A placed order must be explicitly accepted.
- Collection cannot complete without identity confirmation, specimen label and collector.
- A rejected specimen preserves evidence and moves to recollection required.
- Result entry is unavailable until analytical processing begins.
- Preliminary and final results are visually and semantically distinct.
- Final publication is blocked without verification attestation and online state.
- Values, units and reference ranges remain visually connected.
- Critical results create a persistent, non-dismissible action banner.
- Critical acknowledgement requires action, outcome, follow-up owner and attestation.
- Final results cannot be edited in place; corrections create amended versions.
- Amended results reopen clinical acknowledgement.

