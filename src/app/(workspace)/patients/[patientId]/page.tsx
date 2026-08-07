import {
  ArrowLeft,
  CalendarCheck2,
  ClipboardCheck,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PatientContextBar } from "@/components/clinical/patient-context-bar";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { prototypePatients } from "@/data/patients";

type PatientRecordPageProps = {
  params: Promise<{ patientId: string }>;
};

export async function generateMetadata({
  params,
}: PatientRecordPageProps): Promise<Metadata> {
  const { patientId } = await params;
  const patient = prototypePatients.find((record) => record.id === patientId);

  return {
    title: patient && !patient.restricted ? patient.name : "Patient Record",
  };
}

export default async function PatientRecordPage({
  params,
}: PatientRecordPageProps) {
  const { patientId } = await params;
  const patient = prototypePatients.find((record) => record.id === patientId);

  if (!patient || patient.restricted) {
    notFound();
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <ButtonLink
            href="/patients"
            variant="tertiary"
            size="sm"
            startIcon={<ArrowLeft aria-hidden="true" size={14} />}
            className="-ml-3"
          >
            Back to patient search
          </ButtonLink>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Patient workspace
            </p>
            <StatusBadge>Illustrative record</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Patient record
          </h1>
        </div>
        <ButtonLink
          href={`/appointments?patient=${patient.id}`}
          startIcon={<CalendarCheck2 aria-hidden="true" size={15} />}
        >
          Book appointment
        </ButtonLink>
      </div>

      <div className="mt-6">
        <PatientContextBar
          name={patient.name}
          age={patient.age}
          sex={patient.sex}
          mrn={patient.mrn}
          encounter={patient.encounter ?? "No active encounter"}
          location={patient.location ?? "Patient access"}
          clinician={patient.clinician ?? "Not assigned"}
          allergies={patient.allergies}
          verifiedAt="this session"
        />
      </div>

      <Alert tone="information" title="Identity context is now anchored" className="mt-5">
        Confirm two identifiers with the patient before creating an encounter,
        appointment, clinical order or financial transaction.
      </Alert>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel>
          <PanelHeader>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                Patient summary
              </p>
              <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                Registration details
              </h2>
            </div>
            <StatusBadge tone="success" icon={<ShieldCheck aria-hidden="true" size={12} />}>
              Identity verified
            </StatusBadge>
          </PanelHeader>
          <PanelBody>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {[
                ["Full name", patient.name],
                ["Date of birth", `${patient.dob} · ${patient.age} years`],
                ["Sex at registration", patient.sex],
                ["Local MRN", patient.mrn],
                ["Mobile", `••••••${patient.phoneSuffix}`],
                ["Preferred language", patient.language],
                ["Locality", patient.address],
                ["ABHA", patient.abhaMasked ?? "Not linked"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary">
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-ink-primary">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </PanelBody>
        </Panel>

        <div className="space-y-6">
          <Panel elevation="flat">
            <PanelHeader>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                  Visit readiness
                </p>
                <h2 className="mt-2 text-base font-semibold text-ink-primary">
                  Current handoff
                </h2>
              </div>
            </PanelHeader>
            <PanelBody>
              <ul className="space-y-4 text-xs">
                <li className="flex gap-3">
                  <CalendarCheck2 aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-action" />
                  <div>
                    <p className="font-semibold text-ink-primary">{patient.appointment}</p>
                    <p className="mt-1 text-ink-secondary">{patient.department ?? "Department not assigned"}</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-action" />
                  <div>
                    <p className="font-semibold text-ink-primary">{patient.location ?? "Patient access"}</p>
                    <p className="mt-1 text-ink-secondary">Main facility</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <Phone aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-action" />
                  <div>
                    <p className="font-semibold text-ink-primary">Consent: {patient.consent}</p>
                    <p className="mt-1 text-ink-secondary">Review scope again at point of use</p>
                  </div>
                </li>
              </ul>
            </PanelBody>
          </Panel>

          <Panel elevation="flat">
            <PanelBody>
              <div className="flex items-center gap-2 text-action">
                <ClipboardCheck aria-hidden="true" size={16} />
                <p className="text-xs font-bold uppercase tracking-[0.1em]">
                  Provenance
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink-secondary">
                Source: {patient.source}. Last updated {patient.lastUpdated}.
                Verify any imported field before consequential use.
              </p>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}
