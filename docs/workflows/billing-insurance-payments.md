# Billing, insurance and payment workflow

## Scope

The v08 prototype connects completed OPD services to a governed financial account. It keeps source charges, payer responses, invoice state, collections, refunds and reconciliation as separate records.

## Roles

- Billing executive: reviews source charges, coverage and adjustments; finalizes invoices.
- Insurance desk: records payer eligibility and prior-authorization responses.
- Cashier: verifies payer identity, captures payments, issues receipts and reconciles settlements.
- Authorized approver: approves discounts and refunds outside the initiating role.

## Workflow

1. Open the patient financial account from the clinical handoff or Billing navigation.
2. Reconcile automatically captured consultation, diagnostic and pharmacy charges.
3. Preserve source references and void incorrect items only with a documented reason.
4. For insured accounts, record eligibility, returned estimates and payer evidence.
5. Keep authorization-sensitive services blocked until an approval reference is recorded.
6. Request and approve discounts as separate actions.
7. Finalize the invoice only after every readiness condition passes.
8. Collect one or more patient payments against the remaining balance.
9. Generate a receipt for each collection and retain method, reference, user and time.
10. Cancel an unpaid finalized invoice only with reason and approval evidence.
11. Link approved refunds to the original payment without overwriting the receipt.
12. Reconcile every cashier transaction to a settlement, terminal or cash-batch reference.

## Safety and governance rules

- Coverage estimates are not recorded as payments or guaranteed claim proceeds.
- Invoice finalization is blocked by unresolved charge holds, coverage, authorization or discount decisions.
- Non-cash payments require a transaction reference.
- Collections cannot exceed the remaining patient responsibility.
- Refunds cannot exceed the refundable portion of the original payment and require approval evidence.
- Paid invoices cannot be cancelled; they require linked refunds or adjustments.
- Finalized invoice and receipt records are never silently rewritten.
- Every consequential action retains actor, time and evidence in the session audit trail.

## Prototype boundary

All v08 data is illustrative and stored only in the current browser component session. The module does not contact a payer, submit a claim, create a tax invoice, move money, write production financial records to Supabase or certify regulatory compliance.
