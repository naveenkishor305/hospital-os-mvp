"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Columns3,
  Database,
  Languages,
  LockKeyhole,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { PatientContextBar } from "@/components/clinical/patient-context-bar";
import {
  Alert,
  Button,
  ButtonLink,
  CheckboxField,
  IconButton,
  Panel,
  PanelBody,
  PanelHeader,
  SelectField,
  StatusBadge,
  TextField,
} from "@naveenkishor305/spine-ui";
import {
  prototypePatients,
  type PatientAccessRecord,
} from "@/data/patients";
import {
  findDuplicateCandidates,
  searchPatients,
  type PatientSearchMode,
} from "@/lib/patient-search";

type RegistrationDraft = {
  fullName: string;
  dob: string;
  sex: string;
  mobile: string;
  language: string;
  address: string;
  noticeAcknowledged: boolean;
  duplicatesReviewed: boolean;
};

type RegistrationErrors = Partial<Record<keyof RegistrationDraft, string>>;

type RegisteredPatient = RegistrationDraft & {
  mrn: string;
  age: number;
};

const initialRegistration: RegistrationDraft = {
  fullName: "",
  dob: "",
  sex: "",
  mobile: "",
  language: "English",
  address: "",
  noticeAcknowledged: false,
  duplicatesReviewed: false,
};

function safeName(patient: PatientAccessRecord) {
  return patient.restricted ? "Restricted patient record" : patient.name;
}

function calculateAge(dob: string) {
  const birthDate = new Date(`${dob}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return Math.max(0, age);
}

function SearchResultRow({
  patient,
  selected,
  onSelect,
}: {
  patient: PatientAccessRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const hasDuplicateCue = Boolean(patient.duplicateCluster);

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="group w-full border-b border-border-subtle bg-surface px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-subtle data-[selected=true]:bg-selected"
        data-selected={selected}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-ink-primary">
                {safeName(patient)}
              </p>
              {patient.restricted ? (
                <StatusBadge
                  tone="restricted"
                  icon={<LockKeyhole aria-hidden="true" size={12} />}
                >
                  Restricted
                </StatusBadge>
              ) : null}
              {hasDuplicateCue && !patient.restricted ? (
                <StatusBadge
                  tone="warning"
                  icon={<AlertTriangle aria-hidden="true" size={12} />}
                >
                  Possible duplicate
                </StatusBadge>
              ) : null}
            </div>

            {patient.restricted ? (
              <p className="mt-2 text-xs leading-5 text-ink-secondary">
                Details are hidden until a permitted access request is approved.
              </p>
            ) : (
              <>
                <p className="spine-mono mt-2 text-[11px] text-ink-secondary">
                  MRN {patient.mrn} · DOB {patient.dob} · {patient.age} years
                </p>
                <p className="mt-1.5 text-xs text-ink-secondary">
                  Mobile ending {patient.phoneSuffix} · {patient.appointment}
                </p>
              </>
            )}
          </div>

          <span className="mt-1 text-xs font-semibold text-action opacity-0 transition-opacity group-hover:opacity-100 group-data-[selected=true]:opacity-100">
            Review
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-ink-tertiary">
          <span className="inline-flex items-center gap-1.5">
            <Database aria-hidden="true" size={12} />
            {patient.source}
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 aria-hidden="true" size={12} />
            {patient.lastUpdated}
          </span>
        </div>
      </button>
    </li>
  );
}

function PatientQuickView({
  patient,
  onCompare,
}: {
  patient: PatientAccessRecord | null;
  onCompare: (cluster: string) => void;
}) {
  if (!patient) {
    return (
      <Panel elevation="flat" className="xl:sticky xl:top-[88px]">
        <PanelBody className="grid min-h-80 place-items-center text-center">
          <div className="max-w-56">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-surface-subtle text-ink-secondary">
              <Search aria-hidden="true" size={19} />
            </span>
            <h2 className="mt-4 text-sm font-semibold text-ink-primary">
              Select a patient to review
            </h2>
            <p className="mt-2 text-xs leading-5 text-ink-secondary">
              Results are never selected automatically. Confirm the identity
              cues before opening a record.
            </p>
          </div>
        </PanelBody>
      </Panel>
    );
  }

  if (patient.restricted) {
    return (
      <Panel elevation="flat" className="xl:sticky xl:top-[88px]">
        <PanelHeader>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-restricted">
              Access controlled
            </p>
            <h2 className="mt-2 text-base font-semibold text-ink-primary">
              Restricted patient record
            </h2>
          </div>
          <LockKeyhole aria-hidden="true" size={18} className="text-restricted" />
        </PanelHeader>
        <PanelBody>
          <Alert tone="restricted" title="Minimum necessary view only">
            Demographics, contact details and visit history remain hidden. A
            permitted purpose and recorded approval are required to continue.
          </Alert>
          <Button fullWidth className="mt-5" variant="secondary">
            Request permitted access
          </Button>
        </PanelBody>
      </Panel>
    );
  }

  return (
    <Panel elevation="flat" className="xl:sticky xl:top-[88px]">
      <PanelHeader>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
            Minimum identity view
          </p>
          <h2 className="mt-2 truncate text-base font-semibold text-ink-primary">
            {patient.name}
          </h2>
          <p className="spine-mono mt-1 text-[11px] text-ink-secondary">
            MRN {patient.mrn}
          </p>
        </div>
        <StatusBadge tone="success" icon={<ShieldCheck aria-hidden="true" size={12} />}>
          Match review
        </StatusBadge>
      </PanelHeader>
      <PanelBody>
        <dl className="divide-y divide-border-subtle text-xs">
          {[
            ["Date of birth", `${patient.dob} · ${patient.age} years`],
            ["Mobile", `••••••${patient.phoneSuffix}`],
            ["Appointment", patient.appointment ?? "None"],
            ["Department", patient.department ?? "Not assigned"],
            ["Consent", patient.consent],
            ["Source", patient.source],
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[110px_1fr] gap-3 py-3 first:pt-0">
              <dt className="text-ink-tertiary">{label}</dt>
              <dd className="text-right font-medium text-ink-primary">{value}</dd>
            </div>
          ))}
        </dl>

        {patient.duplicateCluster ? (
          <Alert
            tone="warning"
            title="Similar record requires human review"
            className="mt-4"
          >
            Matching phone suffix and similar identity details do not prove
            these records belong to the same person.
          </Alert>
        ) : null}

        <div className="mt-5 grid gap-2">
          <ButtonLink
            href={`/patients/${patient.id}`}
            fullWidth
            endIcon={<ShieldCheck aria-hidden="true" size={14} />}
          >
            Open patient record
          </ButtonLink>
          {patient.duplicateCluster ? (
            <Button
              variant="secondary"
              fullWidth
              startIcon={<Columns3 aria-hidden="true" size={14} />}
              onClick={() => onCompare(patient.duplicateCluster!)}
            >
              Compare similar records
            </Button>
          ) : null}
        </div>
      </PanelBody>
    </Panel>
  );
}

function DuplicateComparison({
  cluster,
  onClose,
  onReview,
}: {
  cluster: string;
  onClose: () => void;
  onReview: (message: string) => void;
}) {
  const records = prototypePatients.filter(
    (patient) => patient.duplicateCluster === cluster,
  );

  if (records.length < 2) {
    return null;
  }

  return (
    <Panel elevation="flat" className="mb-4 border-warning">
      <PanelHeader>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-warning">
            Human duplicate review
          </p>
          <h2 className="mt-2 text-base font-semibold text-ink-primary">
            Compare identity attributes
          </h2>
          <p className="mt-1 text-xs text-ink-secondary">
            The system explains similarities and conflicts. It never merges
            patient records automatically.
          </p>
        </div>
        <IconButton
          label="Close duplicate comparison"
          icon={<X aria-hidden="true" size={16} />}
          onClick={onClose}
        />
      </PanelHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-xs">
          <thead className="bg-surface-subtle text-ink-tertiary">
            <tr>
              <th className="px-4 py-3 font-semibold" scope="col">Attribute</th>
              {records.map((record) => (
                <th key={record.id} className="px-4 py-3 font-semibold" scope="col">
                  {record.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {[
              ["MRN", ...records.map((record) => record.mrn)],
              ["Date of birth", ...records.map((record) => record.dob)],
              ["Mobile", ...records.map((record) => `••••••${record.phoneSuffix}`)],
              ["Address", ...records.map((record) => record.address)],
              ["Source", ...records.map((record) => record.source)],
            ].map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td
                    key={`${row[0]}-${index}`}
                    className={index === 0 ? "px-4 py-3 font-semibold text-ink-secondary" : "px-4 py-3 text-ink-primary"}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PanelBody className="flex flex-wrap justify-end gap-2 border-t border-border-subtle">
        <Button
          variant="secondary"
          onClick={() => onReview("Records marked as different people for this review session. No patient data was merged or changed.")}
        >
          These are different people
        </Button>
        <Button
          onClick={() => onReview("Duplicate candidates routed to the data-quality review queue. Both records remain unchanged.")}
        >
          Route to data-quality review
        </Button>
      </PanelBody>
    </Panel>
  );
}

function RegistrationForm({
  searchSummary,
  onBack,
  onComplete,
}: {
  searchSummary: string;
  onBack: () => void;
  onComplete: (patient: RegisteredPatient) => void;
}) {
  const [draft, setDraft] = useState(initialRegistration);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const duplicateCandidates = useMemo(
    () =>
      findDuplicateCandidates(
        {
          fullName: draft.fullName,
          dob: draft.dob,
          mobile: draft.mobile,
        },
        prototypePatients,
      ),
    [draft.fullName, draft.dob, draft.mobile],
  );

  function updateDraft<Key extends keyof RegistrationDraft>(
    key: Key,
    value: RegistrationDraft[Key],
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
      ...(key === "fullName" || key === "dob" || key === "mobile"
        ? { duplicatesReviewed: false }
        : {}),
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const nextErrors: RegistrationErrors = {};
    const mobile = draft.mobile.replace(/\D/g, "");

    if (draft.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter the patient’s full name.";
    }
    if (!draft.dob) {
      nextErrors.dob = "Enter the date of birth for identity matching.";
    } else if (new Date(`${draft.dob}T00:00:00`) > new Date()) {
      nextErrors.dob = "Date of birth cannot be in the future.";
    }
    if (!draft.sex) {
      nextErrors.sex = "Select sex at registration.";
    }
    if (mobile.length !== 10) {
      nextErrors.mobile = "Enter a complete 10-digit mobile number.";
    }
    if (!draft.noticeAcknowledged) {
      nextErrors.noticeAcknowledged = "Confirm that the registration notice was explained.";
    }
    if (duplicateCandidates.length > 0 && !draft.duplicatesReviewed) {
      nextErrors.duplicatesReviewed = "Review the possible matches before creating a new MRN.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || !validate()) {
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));

    onComplete({
      ...draft,
      age: calculateAge(draft.dob),
      mrn: `HOS-${String(Date.now()).slice(-6)}`,
    });
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-action hover:underline"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            Back to patient search
          </button>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Register patient
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
            Capture minimum registration data, review possible matches and
            create a new local MRN only after identity checks are complete.
          </p>
        </div>
        <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
          Search completed
        </StatusBadge>
      </div>

      <Alert tone="information" title="Registration gate passed" className="mt-6">
        Previous search: <span className="font-semibold">{searchSummary}</span>.
        Search evidence is preserved for this registration attempt.
      </Alert>

      <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel>
            <PanelHeader>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                  Identity
                </p>
                <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                  Patient details
                </h2>
              </div>
              <StatusBadge>Required fields</StatusBadge>
            </PanelHeader>
            <PanelBody className="grid gap-5 md:grid-cols-2">
              <TextField
                id="registration-full-name"
                label="Full name"
                description="Enter the name as provided on the patient’s identity source."
                value={draft.fullName}
                error={errors.fullName}
                onChange={(event) => updateDraft("fullName", event.target.value)}
                autoComplete="name"
                fieldClassName="md:col-span-2"
              />
              <TextField
                id="registration-dob"
                label="Date of birth"
                type="date"
                value={draft.dob}
                error={errors.dob}
                onChange={(event) => updateDraft("dob", event.target.value)}
              />
              <SelectField
                id="registration-sex"
                label="Sex at registration"
                value={draft.sex}
                error={errors.sex}
                onChange={(event) => updateDraft("sex", event.target.value)}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Intersex">Intersex</option>
                <option value="Not stated">Prefer not to state</option>
              </SelectField>
              <TextField
                id="registration-mobile"
                label="Mobile number"
                description="Used for patient matching and visit communication."
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={draft.mobile}
                error={errors.mobile}
                onChange={(event) => updateDraft("mobile", event.target.value.replace(/\D/g, ""))}
                autoComplete="tel"
              />
              <SelectField
                id="registration-language"
                label="Preferred language"
                value={draft.language}
                onChange={(event) => updateDraft("language", event.target.value)}
              >
                <option>English</option>
                <option>Tamil</option>
                <option>Hindi</option>
                <option>Malayalam</option>
                <option>Telugu</option>
              </SelectField>
              <TextField
                id="registration-address"
                label="Locality or address"
                description="Optional during quick registration."
                value={draft.address}
                onChange={(event) => updateDraft("address", event.target.value)}
                autoComplete="street-address"
                fieldClassName="md:col-span-2"
              />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                  Purpose and notice
                </p>
                <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                  Registration acknowledgement
                </h2>
              </div>
            </PanelHeader>
            <PanelBody>
              <CheckboxField
                id="registration-notice"
                label="Registration notice explained"
                description="The patient was told why identity and contact data is being collected for care coordination and hospital operations. This acknowledgement is illustrative and does not replace purpose-specific consent."
                checked={draft.noticeAcknowledged}
                error={errors.noticeAcknowledged}
                onChange={(event) => updateDraft("noticeAcknowledged", event.target.checked)}
              />
            </PanelBody>
          </Panel>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                  Duplicate safety check
                </p>
                <h2 className="mt-2 text-base font-semibold text-ink-primary">
                  Possible patient matches
                </h2>
              </div>
              <StatusBadge tone={duplicateCandidates.length > 0 ? "warning" : "success"}>
                {duplicateCandidates.length > 0
                  ? `${duplicateCandidates.length} to review`
                  : "No match yet"}
              </StatusBadge>
            </PanelHeader>
            <PanelBody>
              {duplicateCandidates.length > 0 ? (
                <div className="space-y-3">
                  <Alert tone="warning" title="Do not create a duplicate MRN">
                    Compare these records before continuing. Similarity is a
                    cue for human review, not proof of identity.
                  </Alert>
                  <ul className="divide-y divide-border-subtle rounded-md border border-border-subtle">
                    {duplicateCandidates.map((candidate) => (
                      <li key={candidate.patient.id} className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-ink-primary">
                              {safeName(candidate.patient)}
                            </p>
                            {!candidate.patient.restricted ? (
                              <p className="spine-mono mt-1 text-[10px] text-ink-secondary">
                                {candidate.patient.mrn} · DOB {candidate.patient.dob}
                              </p>
                            ) : null}
                          </div>
                          <StatusBadge tone="warning">
                            {candidate.confidence}
                          </StatusBadge>
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-ink-secondary">
                          {candidate.reasons.join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <CheckboxField
                    id="registration-duplicates-reviewed"
                    label="I reviewed every possible match"
                    description="I confirmed that this is a different person. No existing records will be merged."
                    checked={draft.duplicatesReviewed}
                    error={errors.duplicatesReviewed}
                    onChange={(event) => updateDraft("duplicatesReviewed", event.target.checked)}
                  />
                </div>
              ) : (
                <div className="rounded-md bg-surface-subtle p-4 text-xs leading-5 text-ink-secondary">
                  Enter the patient’s name, date of birth and mobile number to
                  run identity matching before submission.
                </div>
              )}
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelBody>
              <div className="flex items-center gap-2 text-action">
                <ClipboardCheck aria-hidden="true" size={16} />
                <p className="text-xs font-bold uppercase tracking-[0.1em]">
                  Final review
                </p>
              </div>
              <ul className="mt-4 space-y-3 text-xs leading-5 text-ink-secondary">
                <li>• A new local MRN will be created.</li>
                <li>• Existing records remain unchanged.</li>
                <li>• The registration attempt is protected from repeated submission.</li>
              </ul>
              <Button
                type="submit"
                fullWidth
                className="mt-5"
                loading={submitting}
                startIcon={<UserPlus aria-hidden="true" size={15} />}
              >
                {submitting ? "Creating patient record" : "Create patient record"}
              </Button>
              <Button type="button" variant="tertiary" fullWidth className="mt-2" onClick={onBack}>
                Cancel registration
              </Button>
            </PanelBody>
          </Panel>
        </aside>
      </form>
    </div>
  );
}

function RegistrationComplete({
  patient,
  onReset,
}: {
  patient: RegisteredPatient;
  onReset: () => void;
}) {
  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="max-w-5xl">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-success">
            Registration complete
          </p>
          <StatusBadge tone="success" icon={<CheckCircle2 aria-hidden="true" size={12} />}>
            New local MRN
          </StatusBadge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
          Patient record created
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-secondary">
          Identity details were checked, the registration notice was recorded,
          and the patient can now continue to visit confirmation.
        </p>

        <Alert tone="success" title="Registration saved" className="mt-6">
          A single patient record was created. Repeated submission was blocked
          while the registration was processing.
        </Alert>

        <div className="mt-6">
          <PatientContextBar
            name={patient.fullName}
            age={patient.age}
            sex={patient.sex}
            mrn={patient.mrn}
            encounter="Not created"
            location="Patient access"
            clinician="Not assigned"
            verifiedAt="just now"
          />
        </div>

        <Panel className="mt-6">
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Next safe action
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Confirm this visit
              </h2>
            </div>
          </PanelHeader>
          <PanelBody className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-2xl text-xs leading-5 text-ink-secondary">
              Create an appointment or walk-in encounter only after confirming
              the facility, department, clinician and visit date.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={onReset}>
                Start another search
              </Button>
              <Button startIcon={<CalendarDays aria-hidden="true" size={15} />}>
                Confirm visit
              </Button>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}

export function PatientAccessWorkspace() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<PatientSearchMode>("all");
  const [results, setResults] = useState<PatientAccessRecord[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string>();
  const [compareCluster, setCompareCluster] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string>();
  const [registering, setRegistering] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<RegisteredPatient | null>(null);
  const [lastSearch, setLastSearch] = useState("");

  const selectedPatient =
    results?.find((patient) => patient.id === selectedId) ?? null;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setSearchError("Enter a name, MRN, 10-digit mobile number or date of birth.");
      return;
    }

    const matches = searchPatients(prototypePatients, query, mode);
    setResults(matches);
    setSelectedId(null);
    setCompareCluster(null);
    setReviewMessage(undefined);
    setSearchError(undefined);
    setLastSearch(`${mode === "all" ? "All patient identifiers" : mode.toUpperCase()} · “${query.trim()}”`);
  }

  function resetFlow() {
    setRegisteredPatient(null);
    setRegistering(false);
    setResults(null);
    setSelectedId(null);
    setQuery("");
    setLastSearch("");
  }

  if (registeredPatient) {
    return <RegistrationComplete patient={registeredPatient} onReset={resetFlow} />;
  }

  if (registering) {
    return (
      <RegistrationForm
        searchSummary={lastSearch}
        onBack={() => setRegistering(false)}
        onComplete={setRegisteredPatient}
      />
    );
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Patient access
            </p>
            <StatusBadge>Illustrative records</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Patient search
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-secondary">
            Find the correct person using multiple identity cues before opening
            a record, confirming a visit or starting a new registration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {results === null ? (
            <StatusBadge tone="warning">Search required before registration</StatusBadge>
          ) : (
            <StatusBadge tone="success">Registration gate open</StatusBadge>
          )}
          <Button
            startIcon={<UserPlus aria-hidden="true" size={15} />}
            disabled={results === null}
            onClick={() => setRegistering(true)}
            title={results === null ? "Complete a patient search first" : undefined}
          >
            Register new patient
          </Button>
        </div>
      </div>

      <Alert tone="information" title="Privacy-safe identity matching" className="mt-6">
        Search uses minimum necessary details. The first result is never opened
        automatically, and restricted records do not reveal protected data.
      </Alert>

      <div className="mt-6 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <Panel elevation="flat" className="xl:sticky xl:top-[88px] xl:self-start">
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Search criteria
              </p>
              <h2 className="mt-2 text-base font-semibold text-ink-primary">
                Identify the patient
              </h2>
            </div>
          </PanelHeader>
          <PanelBody>
            <form onSubmit={handleSearch} noValidate className="space-y-5">
              <SelectField
                id="patient-search-mode"
                label="Search by"
                value={mode}
                onChange={(event) => setMode(event.target.value as PatientSearchMode)}
              >
                <option value="all">All patient identifiers</option>
                <option value="name">Patient name</option>
                <option value="mrn">Medical record number</option>
                <option value="mobile">Mobile number</option>
                <option value="dob">Date of birth</option>
              </SelectField>
              <TextField
                id="patient-search-query"
                label="Patient details"
                description="Name, local MRN, mobile number or DOB (YYYY-MM-DD)."
                value={query}
                error={searchError}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchError(undefined);
                }}
                placeholder="e.g. Meera or HOS-024718"
                autoComplete="off"
              />
              <Button
                type="submit"
                fullWidth
                startIcon={<Search aria-hidden="true" size={15} />}
              >
                Search patient index
              </Button>
            </form>

            <div className="mt-6 border-t border-border-subtle pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-tertiary">
                Try prototype searches
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Meera", "HOS-019482", "Ravi"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      setMode("all");
                      setSearchError(undefined);
                    }}
                    className="rounded border border-border-default bg-surface px-2 py-1 text-[10px] font-semibold text-action hover:bg-selected"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-ink-secondary">
                Selecting a suggestion fills the field only. Run the search to
                record a completed identity check.
              </p>
            </div>
          </PanelBody>
        </Panel>

        <main aria-labelledby="patient-results-title" className="min-w-0">
          {reviewMessage ? (
            <Alert tone="success" title="Review action recorded" className="mb-4">
              {reviewMessage}
            </Alert>
          ) : null}

          {compareCluster ? (
            <DuplicateComparison
              cluster={compareCluster}
              onClose={() => setCompareCluster(null)}
              onReview={(message) => {
                setReviewMessage(message);
                setCompareCluster(null);
              }}
            />
          ) : null}

          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                  Progressive results
                </p>
                <h2 id="patient-results-title" className="mt-2 text-base font-semibold text-ink-primary">
                  {results === null
                    ? "Search the enterprise patient index"
                    : `${results.length} patient ${results.length === 1 ? "match" : "matches"}`}
                </h2>
              </div>
              {results !== null ? <StatusBadge>Search completed</StatusBadge> : null}
            </PanelHeader>

            <div aria-live="polite">
              {results === null ? (
                <div className="grid min-h-[460px] place-items-center p-8 text-center">
                  <div className="max-w-sm">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-selected text-action">
                      <Search aria-hidden="true" size={20} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-ink-primary">
                      Begin with at least one identity cue
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-ink-secondary">
                      Results will show local MRN, DOB or age, permitted phone
                      suffix, source and freshness. No result will be selected for you.
                    </p>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="grid min-h-[460px] place-items-center p-8 text-center">
                  <div className="max-w-sm">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-subtle text-ink-secondary">
                      <Search aria-hidden="true" size={20} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-ink-primary">
                      No patient match found
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-ink-secondary">
                      Try another identifier or begin registration. The completed
                      search will remain attached to this registration attempt.
                    </p>
                    <Button
                      className="mt-5"
                      startIcon={<UserPlus aria-hidden="true" size={15} />}
                      onClick={() => setRegistering(true)}
                    >
                      Register new patient
                    </Button>
                  </div>
                </div>
              ) : (
                <ul aria-label="Patient search results">
                  {results.map((patient) => (
                    <SearchResultRow
                      key={patient.id}
                      patient={patient}
                      selected={patient.id === selectedId}
                      onSelect={() => setSelectedId(patient.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </main>

        <aside aria-label="Selected patient quick view">
          <PatientQuickView patient={selectedPatient} onCompare={setCompareCluster} />
        </aside>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-border-subtle bg-surface px-4 py-3 text-xs text-ink-secondary sm:grid-cols-3">
        <span className="inline-flex items-center gap-2">
          <Phone aria-hidden="true" size={14} className="text-action" />
          Phone shown as permitted suffix
        </span>
        <span className="inline-flex items-center gap-2">
          <Languages aria-hidden="true" size={14} className="text-action" />
          Local-language ready fields
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin aria-hidden="true" size={14} className="text-action" />
          Facility source stays visible
        </span>
      </div>
    </div>
  );
}
