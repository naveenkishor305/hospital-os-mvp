# Medication and pharmacy workflow

## Scope

The protected `/pharmacy` workspace demonstrates an outpatient prescription lifecycle using illustrative, session-based data.

## Lifecycle

1. Receive an authorized prescription from consultation.
2. Confirm patient identity, allergies and current medicines.
3. Apply a clinical hold when an allergy or interaction risk is unresolved.
4. Record attributed prescriber clarification without silently changing therapy.
5. Complete final pharmacist verification before releasing supply.
6. Select a compatible physical batch using FEFO guidance.
7. Block expired or quarantined stock and require barcode confirmation.
8. Record batch, expiry, quantity, pharmacist and inventory decrement.
9. Preserve partial-fill reasons and the balance-supply plan.
10. Confirm label accuracy, counselling, recipient and patient handoff.

## Safety rules

- No dispensing without prescription authorization and final pharmacist verification.
- Allergy conflicts are hard stops and cannot be overridden in the dispensing form.
- The system does not recommend a replacement medicine.
- Unsafe lines may be discontinued only through an attributed prescriber-clarification record.
- Expired and quarantined batches remain visible but cannot be issued.
- FEFO is guidance; the pharmacist must select and scan the physical batch.
- Substitution requires matching generic medicine, prescription eligibility and a documented communication record.
- Partial fulfilment requires both a reason and an outstanding-supply plan.
- Consequential verification, inventory and handoff actions require connectivity.

## Prototype boundary

The module does not write clinical or inventory records to Supabase, generate a legal label or receipt, process payment, integrate scanner hardware, or enforce jurisdiction-specific controlled-medicine rules.
