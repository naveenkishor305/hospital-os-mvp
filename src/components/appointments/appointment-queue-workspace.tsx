"use client";

import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  DoorOpen,
  ListChecks,
  MoveRight,
  Plus,
  RotateCcw,
  Stethoscope,
  TicketCheck,
  UserCheck,
  UsersRound,
  XCircle,
  Zap,
} from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { PatientContextBar } from "@/components/clinical/patient-context-bar";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { SelectField } from "@/components/ui/select-field";
import {
  StatusBadge,
  type StatusTone,
} from "@/components/ui/status-badge";
import { TextField } from "@/components/ui/text-field";
import {
  prototypeAppointments,
  prototypeClinicians,
  prototypeWaitlist,
  scheduleDates,
  type AppointmentPriority,
  type AppointmentRecord,
  type WaitlistRecord,
} from "@/data/appointments";
import { prototypePatients } from "@/data/patients";
import { cn } from "@/lib/cn";

type WorkspaceView = "schedule" | "queue";

type BookingDraft = {
  patientId: string;
  department: string;
  clinicianId: string;
  date: string;
  time: string;
  visitType: string;
  source: string;
  identityVerified: boolean;
};

type BookingErrors = Partial<Record<keyof BookingDraft | "rescheduleReason", string>>;

type Notice = {
  tone: StatusTone;
  title: string;
  message: string;
};

const defaultBooking: BookingDraft = {
  patientId: "",
  department: "",
  clinicianId: "",
  date: scheduleDates[0].value,
  time: "",
  visitType: "New consultation",
  source: "Front desk",
  identityVerified: false,
};

const departmentOptions = Array.from(
  new Set(prototypeClinicians.map((clinician) => clinician.department)),
);

function appointmentTone(status: AppointmentRecord["appointmentStatus"]): StatusTone {
  if (status === "Completed") return "success";
  if (status === "Cancelled") return "critical";
  if (status === "Arrived") return "information";
  return "neutral";
}

function queueTone(status: AppointmentRecord["queueStatus"]): StatusTone {
  if (status === "Completed") return "success";
  if (status === "In consultation" || status === "Called") return "information";
  if (status === "Waiting") return "warning";
  return "neutral";
}

function priorityTone(priority: AppointmentPriority): StatusTone {
  if (priority === "Urgent") return "critical";
  if (priority === "Follow-up") return "information";
  return "neutral";
}

function queueActionLabel(status: AppointmentRecord["queueStatus"]) {
  if (status === "Waiting") return "Call patient";
  if (status === "Called") return "Start consultation";
  return null;
}

function departmentCode(department: string) {
  const codes: Record<string, string> = {
    Cardiology: "CA",
    "General medicine": "GM",
    Orthopaedics: "OR",
    Ophthalmology: "EY",
  };

  return codes[department] ?? "OP";
}

function currentClockTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function AppointmentQueueWorkspace({
  initialPatientId,
}: {
  initialPatientId?: string;
}) {
  const validInitialPatient = prototypePatients.find(
    (patient) => patient.id === initialPatientId && !patient.restricted,
  );
  const [activeView, setActiveView] = useState<WorkspaceView>("schedule");
  const [appointments, setAppointments] = useState(prototypeAppointments);
  const [waitlist, setWaitlist] = useState(prototypeWaitlist);
  const [booking, setBooking] = useState<BookingDraft>({
    ...defaultBooking,
    patientId: validInitialPatient?.id ?? "",
  });
  const [bookingErrors, setBookingErrors] = useState<BookingErrors>({});
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(
    validInitialPatient
      ? {
          tone: "information",
          title: "Patient handed off from the record",
          message: "Confirm two identifiers before choosing a service, provider and slot.",
        }
      : null,
  );
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showPriority, setShowPriority] = useState(false);
  const [priorityValue, setPriorityValue] = useState<AppointmentPriority>("Routine");
  const [priorityReason, setPriorityReason] = useState("");
  const [showReassign, setShowReassign] = useState(false);
  const [reassignmentRoom, setReassignmentRoom] = useState("");
  const [reassignmentReason, setReassignmentReason] = useState("");

  const selectedClinician = prototypeClinicians.find(
    (clinician) => clinician.id === booking.clinicianId,
  );
  const selectedAppointment = appointments.find(
    (appointment) => appointment.id === selectedAppointmentId,
  );
  const formPatient = prototypePatients.find(
    (patient) => patient.id === booking.patientId && !patient.restricted,
  );
  const contextPatient = selectedAppointment
    ? prototypePatients.find(
        (patient) => patient.id === selectedAppointment.patientId && !patient.restricted,
      )
    : formPatient;

  const availableClinicians = prototypeClinicians.filter(
    (clinician) => clinician.department === booking.department,
  );

  const slotStates = useMemo(() => {
    if (!selectedClinician) return [];

    return (selectedClinician.schedule[booking.date] ?? []).map((time) => {
      const blocked = selectedClinician.blockedSlots?.find(
        (slot) => slot.date === booking.date && slot.time === time,
      );
      const occupied = appointments.find(
        (appointment) =>
          appointment.id !== editingAppointmentId &&
          appointment.clinicianId === selectedClinician.id &&
          appointment.date === booking.date &&
          appointment.time === time &&
          appointment.appointmentStatus !== "Cancelled",
      );

      return {
        time,
        state: blocked ? "blocked" : occupied ? "booked" : "available",
        detail: blocked?.reason ?? occupied?.patientName ?? "Available",
      } as const;
    });
  }, [appointments, booking.date, editingAppointmentId, selectedClinician]);

  const dateAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === booking.date)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, booking.date],
  );

  const queueAppointments = useMemo(() => {
    const priorityWeight: Record<AppointmentPriority, number> = {
      Urgent: 0,
      "Follow-up": 1,
      Routine: 2,
    };

    return appointments
      .filter(
        (appointment) =>
          appointment.queueStatus !== "Not queued" &&
          appointment.appointmentStatus !== "Cancelled",
      )
      .sort((a, b) => {
        if (a.queueStatus === "Completed" && b.queueStatus !== "Completed") return 1;
        if (b.queueStatus === "Completed" && a.queueStatus !== "Completed") return -1;
        return (
          priorityWeight[a.priority] - priorityWeight[b.priority] ||
          (a.arrivedAt ?? a.time).localeCompare(b.arrivedAt ?? b.time)
        );
      });
  }, [appointments]);

  const activeQueue = queueAppointments.filter(
    (appointment) => appointment.queueStatus !== "Completed",
  );

  function resetActionForms() {
    setCancelTargetId(null);
    setCancellationReason("");
    setShowPriority(false);
    setPriorityReason("");
    setShowReassign(false);
    setReassignmentRoom("");
    setReassignmentReason("");
  }

  function startNewBooking() {
    setActiveView("schedule");
    setBooking(defaultBooking);
    setBookingErrors({});
    setEditingAppointmentId(null);
    setRescheduleReason("");
    setSelectedAppointmentId(null);
    resetActionForms();
    setNotice(null);
  }

  function makeQueueToken(department: string) {
    const prefix = departmentCode(department);
    const highestNumber = appointments.reduce((highest, appointment) => {
      if (!appointment.token?.startsWith(`${prefix}-`)) return highest;
      const tokenNumber = Number(appointment.token.split("-")[1]);
      return Number.isFinite(tokenNumber) ? Math.max(highest, tokenNumber) : highest;
    }, 0);

    return `${prefix}-${String(highestNumber + 1).padStart(3, "0")}`;
  }

  function validateBooking() {
    const errors: BookingErrors = {};
    const patient = prototypePatients.find(
      (record) => record.id === booking.patientId && !record.restricted,
    );
    const clinician = prototypeClinicians.find(
      (record) => record.id === booking.clinicianId,
    );
    const chosenSlot = slotStates.find((slot) => slot.time === booking.time);

    if (!patient) errors.patientId = "Select an accessible patient record.";
    if (!booking.department) errors.department = "Select a department.";
    if (!clinician || clinician.department !== booking.department) {
      errors.clinicianId = "Select an available clinician for this department.";
    }
    if (!booking.date) errors.date = "Select an appointment date.";
    if (!booking.time || !chosenSlot || chosenSlot.state !== "available") {
      errors.time = "Choose an available slot.";
    }
    if (!booking.identityVerified) {
      errors.identityVerified = "Confirm two patient identifiers before booking.";
    }
    if (editingAppointmentId && !rescheduleReason.trim()) {
      errors.rescheduleReason = "Record why the appointment is being rescheduled.";
    }

    const patientCollision = appointments.find(
      (appointment) =>
        appointment.id !== editingAppointmentId &&
        appointment.patientId === booking.patientId &&
        appointment.date === booking.date &&
        appointment.time === booking.time &&
        appointment.appointmentStatus !== "Cancelled",
    );

    if (patientCollision) {
      errors.time = `This patient already has an appointment at ${patientCollision.time}.`;
    }

    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleBookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateBooking()) return;

    const patient = prototypePatients.find((record) => record.id === booking.patientId)!;
    const clinician = prototypeClinicians.find(
      (record) => record.id === booking.clinicianId,
    )!;
    const walkIn = booking.source === "Walk-in";

    if (editingAppointmentId) {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === editingAppointmentId
            ? {
                ...appointment,
                patientId: patient.id,
                patientName: patient.name,
                mrn: patient.mrn,
                department: booking.department,
                clinicianId: clinician.id,
                clinician: clinician.name,
                room: clinician.room,
                date: booking.date,
                time: booking.time,
                durationMinutes: clinician.slotMinutes,
                visitType: booking.visitType,
                source: booking.source,
                appointmentStatus: "Scheduled",
                queueStatus: "Not queued",
                priority: booking.visitType === "Follow-up" ? "Follow-up" : "Routine",
                arrivedAt: undefined,
                token: undefined,
                waitMinutes: undefined,
                actionNote: `Rescheduled: ${rescheduleReason.trim()}`,
              }
            : appointment,
        ),
      );
      setNotice({
        tone: "success",
        title: "Appointment rescheduled",
        message: `The original appointment was updated to ${booking.date} at ${booking.time}. The reason is retained in the prototype audit note.`,
      });
      setSelectedAppointmentId(editingAppointmentId);
      setEditingAppointmentId(null);
      setRescheduleReason("");
      return;
    }

    const newId = `apt-${patient.id}-${Date.now()}`;
    const token = walkIn ? makeQueueToken(booking.department) : undefined;
    const newAppointment: AppointmentRecord = {
      id: newId,
      patientId: patient.id,
      patientName: patient.name,
      mrn: patient.mrn,
      department: booking.department,
      clinicianId: clinician.id,
      clinician: clinician.name,
      date: booking.date,
      time: booking.time,
      durationMinutes: clinician.slotMinutes,
      visitType: booking.visitType,
      source: booking.source,
      appointmentStatus: walkIn ? "Arrived" : "Scheduled",
      queueStatus: walkIn ? "Waiting" : "Not queued",
      priority: booking.visitType === "Follow-up" ? "Follow-up" : "Routine",
      room: clinician.room,
      bookedAt: "02 Aug 2026 · this session",
      arrivedAt: walkIn ? currentClockTime() : undefined,
      token,
      waitMinutes: walkIn ? 0 : undefined,
    };

    setAppointments((current) => [...current, newAppointment]);
    setSelectedAppointmentId(newId);
    setBooking((current) => ({ ...current, time: "", identityVerified: false }));
    setNotice({
      tone: "success",
      title: walkIn ? "Walk-in created and queued" : "Appointment booked",
      message: walkIn
        ? `${token} was generated and assigned to ${clinician.room}.`
        : `${patient.name} is scheduled with ${clinician.name} at ${booking.time}.`,
    });
    if (walkIn) setActiveView("queue");
  }

  function startReschedule(appointment: AppointmentRecord) {
    if (
      appointment.appointmentStatus !== "Scheduled" ||
      appointment.queueStatus !== "Not queued"
    ) {
      setNotice({
        tone: "warning",
        title: "Reschedule blocked after check-in",
        message: "Return the patient from the active queue through an authorised workflow before changing the booked slot.",
      });
      return;
    }

    setActiveView("schedule");
    setEditingAppointmentId(appointment.id);
    setSelectedAppointmentId(appointment.id);
    setBooking({
      patientId: appointment.patientId,
      department: appointment.department,
      clinicianId: appointment.clinicianId,
      date: appointment.date,
      time: "",
      visitType: appointment.visitType,
      source: appointment.source,
      identityVerified: false,
    });
    setBookingErrors({});
    setRescheduleReason("");
    resetActionForms();
    setNotice({
      tone: "information",
      title: "Select a replacement slot",
      message: "The current slot remains booked until the replacement passes all availability and identity checks.",
    });
  }

  function checkInAppointment(appointmentId: string) {
    const appointment = appointments.find((record) => record.id === appointmentId);
    if (!appointment || appointment.appointmentStatus !== "Scheduled") return;
    const token = makeQueueToken(appointment.department);

    setAppointments((current) =>
      current.map((record) =>
        record.id === appointmentId
          ? {
              ...record,
              appointmentStatus: "Arrived",
              queueStatus: "Waiting",
              arrivedAt: currentClockTime(),
              token,
              waitMinutes: 0,
              actionNote: "Identity confirmed at check-in",
            }
          : record,
      ),
    );
    setSelectedAppointmentId(appointmentId);
    setActiveView("queue");
    setNotice({
      tone: "success",
      title: "Patient checked in",
      message: `${token} was generated and assigned to ${appointment.room}.`,
    });
  }

  function advanceQueue(appointmentId: string) {
    const appointment = appointments.find((record) => record.id === appointmentId);
    if (!appointment) return;
    const nextStatus =
      appointment.queueStatus === "Waiting"
        ? "Called"
        : appointment.queueStatus === "Called"
          ? "In consultation"
          : appointment.queueStatus === "In consultation"
            ? "Completed"
            : null;
    if (!nextStatus) return;

    setAppointments((current) =>
      current.map((record) =>
        record.id === appointmentId
          ? {
              ...record,
              queueStatus: nextStatus,
              appointmentStatus:
                nextStatus === "Completed" ? "Completed" : record.appointmentStatus,
              actionNote:
                nextStatus === "Called"
                  ? "Patient called to service point"
                  : nextStatus === "In consultation"
                    ? "Clinical handoff acknowledged"
                    : "Consultation queue step completed",
            }
          : record,
      ),
    );
    setSelectedAppointmentId(appointmentId);
    setNotice({
      tone: nextStatus === "Completed" ? "success" : "information",
      title: `Queue updated to ${nextStatus.toLowerCase()}`,
      message: `${appointment.token} remains linked to the same patient, clinician and service location.`,
    });
  }

  function callNextPatient() {
    const next = activeQueue.find((appointment) => appointment.queueStatus === "Waiting");
    if (!next) {
      setNotice({
        tone: "information",
        title: "No waiting patient",
        message: "The active queue has no patient ready to call.",
      });
      return;
    }
    advanceQueue(next.id);
  }

  function confirmCancellation() {
    if (!cancelTargetId || !cancellationReason.trim()) return;
    const appointment = appointments.find((record) => record.id === cancelTargetId);
    if (!appointment) return;

    if (
      appointment.queueStatus === "In consultation" ||
      appointment.queueStatus === "Completed"
    ) {
      setNotice({
        tone: "critical",
        title: "Cancellation blocked",
        message: "An appointment cannot be cancelled after consultation has started. Use the governed encounter correction workflow.",
      });
      return;
    }

    setAppointments((current) =>
      current.map((record) =>
        record.id === cancelTargetId
          ? {
              ...record,
              appointmentStatus: "Cancelled",
              queueStatus: "Not queued",
              token: undefined,
              arrivedAt: undefined,
              waitMinutes: undefined,
              actionNote: `Cancelled: ${cancellationReason.trim()}`,
            }
          : record,
      ),
    );
    setCancelTargetId(null);
    setCancellationReason("");
    setNotice({
      tone: "warning",
      title: "Appointment cancelled",
      message: "The slot is available again. Waitlisted patients are not moved automatically; staff must review and offer the released slot.",
    });
  }

  function confirmPriorityChange() {
    if (!selectedAppointment || !priorityReason.trim()) return;
    setAppointments((current) =>
      current.map((record) =>
        record.id === selectedAppointment.id
          ? {
              ...record,
              priority: priorityValue,
              actionNote: `Priority changed to ${priorityValue}: ${priorityReason.trim()}`,
            }
          : record,
      ),
    );
    setShowPriority(false);
    setPriorityReason("");
    setNotice({
      tone: priorityValue === "Urgent" ? "warning" : "information",
      title: "Queue priority updated",
      message: "The reason is visible in the appointment audit note; queue order has been recalculated.",
    });
  }

  function confirmReassignment() {
    if (!selectedAppointment || !reassignmentRoom || !reassignmentReason.trim()) return;
    setAppointments((current) =>
      current.map((record) =>
        record.id === selectedAppointment.id
          ? {
              ...record,
              room: reassignmentRoom,
              actionNote: `Queue reassigned: ${reassignmentReason.trim()}`,
            }
          : record,
      ),
    );
    setShowReassign(false);
    setReassignmentRoom("");
    setReassignmentReason("");
    setNotice({
      tone: "success",
      title: "Queue assignment updated",
      message: `The patient remains in the same queue state and is now routed to ${reassignmentRoom}.`,
    });
  }

  function addToWaitlist() {
    const patient = prototypePatients.find(
      (record) => record.id === booking.patientId && !record.restricted,
    );
    const clinician = prototypeClinicians.find(
      (record) => record.id === booking.clinicianId,
    );
    const errors: BookingErrors = {};
    if (!patient) errors.patientId = "Select an accessible patient record.";
    if (!booking.department) errors.department = "Select a department.";
    if (!clinician) errors.clinicianId = "Select a clinician.";
    if (!booking.identityVerified) {
      errors.identityVerified = "Confirm two patient identifiers first.";
    }
    if (Object.keys(errors).length) {
      setBookingErrors(errors);
      return;
    }

    const duplicate = waitlist.find(
      (record) =>
        record.patientId === patient!.id &&
        record.clinicianId === clinician!.id &&
        record.date === booking.date &&
        record.status === "Waiting",
    );
    if (duplicate) {
      setNotice({
        tone: "warning",
        title: "Already on this waitlist",
        message: "A second waitlist entry was not created.",
      });
      return;
    }

    const entry: WaitlistRecord = {
      id: `waitlist-${Date.now()}`,
      patientId: patient!.id,
      patientName: patient!.name,
      mrn: patient!.mrn,
      department: booking.department,
      clinicianId: clinician!.id,
      clinician: clinician!.name,
      date: booking.date,
      visitType: booking.visitType,
      addedAt: "02 Aug 2026 · this session",
      status: "Waiting",
    };
    setWaitlist((current) => [...current, entry]);
    setNotice({
      tone: "success",
      title: "Patient added to waitlist",
      message: "No appointment was created. Staff must explicitly offer and confirm a released slot.",
    });
  }

  function offerReleasedSlot(entry: WaitlistRecord) {
    const clinician = prototypeClinicians.find(
      (record) => record.id === entry.clinicianId,
    );
    if (!clinician) return;
    const openSlot = (clinician.schedule[entry.date] ?? []).find((time) => {
      const blocked = clinician.blockedSlots?.some(
        (slot) => slot.date === entry.date && slot.time === time,
      );
      const occupied = appointments.some(
        (appointment) =>
          appointment.clinicianId === clinician.id &&
          appointment.date === entry.date &&
          appointment.time === time &&
          appointment.appointmentStatus !== "Cancelled",
      );
      return !blocked && !occupied;
    });

    if (!openSlot) {
      setNotice({
        tone: "warning",
        title: "No released slot available",
        message: "Keep the patient on the waitlist or choose another date with their consent.",
      });
      return;
    }

    setBooking({
      patientId: entry.patientId,
      department: entry.department,
      clinicianId: entry.clinicianId,
      date: entry.date,
      time: openSlot,
      visitType: entry.visitType,
      source: "Waitlist",
      identityVerified: false,
    });
    setWaitlist((current) =>
      current.map((record) =>
        record.id === entry.id ? { ...record, status: "Slot offered" } : record,
      ),
    );
    setSelectedAppointmentId(null);
    setEditingAppointmentId(null);
    setActiveView("schedule");
    setNotice({
      tone: "information",
      title: `Released slot prepared for ${openSlot}`,
      message: "Confirm the offer with the patient and re-verify identity before booking. The slot is not held yet.",
    });
  }

  function renderAppointmentDetail(queueMode: boolean) {
    if (!selectedAppointment) {
      return (
        <Panel elevation="flat">
          <PanelBody className="grid min-h-72 place-items-center text-center">
            <div className="max-w-60">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-surface-subtle text-ink-secondary">
                <CalendarCheck2 aria-hidden="true" size={19} />
              </span>
              <h2 className="mt-4 text-sm font-semibold text-ink-primary">
                Select an appointment
              </h2>
              <p className="mt-2 text-xs leading-5 text-ink-secondary">
                Review identity, appointment state and queue state before taking an action.
              </p>
            </div>
          </PanelBody>
        </Panel>
      );
    }

    const actionLabel = queueActionLabel(selectedAppointment.queueStatus);
    const canCancel =
      selectedAppointment.appointmentStatus !== "Cancelled" &&
      selectedAppointment.appointmentStatus !== "Completed" &&
      selectedAppointment.queueStatus !== "In consultation";

    return (
      <Panel elevation="flat" className="xl:sticky xl:top-[88px]">
        <PanelHeader>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
              Appointment control
            </p>
            <h2 className="mt-2 truncate text-base font-semibold text-ink-primary">
              {selectedAppointment.patientName}
            </h2>
            <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
              {selectedAppointment.mrn} · {selectedAppointment.id}
            </p>
          </div>
          {selectedAppointment.token ? (
            <StatusBadge tone="information" icon={<TicketCheck aria-hidden="true" size={12} />}>
              {selectedAppointment.token}
            </StatusBadge>
          ) : null}
        </PanelHeader>
        <PanelBody>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={appointmentTone(selectedAppointment.appointmentStatus)}>
              Appointment: {selectedAppointment.appointmentStatus}
            </StatusBadge>
            <StatusBadge tone={queueTone(selectedAppointment.queueStatus)}>
              Queue: {selectedAppointment.queueStatus}
            </StatusBadge>
            <StatusBadge tone={priorityTone(selectedAppointment.priority)}>
              {selectedAppointment.priority}
            </StatusBadge>
          </div>

          <dl className="mt-5 divide-y divide-border-subtle text-xs">
            {[
              ["Date and time", `${selectedAppointment.date} · ${selectedAppointment.time}`],
              ["Service", selectedAppointment.department],
              ["Clinician", selectedAppointment.clinician],
              ["Location", selectedAppointment.room],
              ["Visit type", selectedAppointment.visitType],
              ["Booking source", selectedAppointment.source],
            ].map(([label, value]) => (
              <div key={label} className="grid grid-cols-[104px_1fr] gap-3 py-3 first:pt-0">
                <dt className="text-ink-tertiary">{label}</dt>
                <dd className="text-right font-medium text-ink-primary">{value}</dd>
              </div>
            ))}
          </dl>

          {selectedAppointment.actionNote ? (
            <Alert tone="information" title="Latest audit note" className="mt-4">
              {selectedAppointment.actionNote}
            </Alert>
          ) : null}

          <div className="mt-5 grid gap-2">
            {selectedAppointment.appointmentStatus === "Scheduled" ? (
              <Button
                fullWidth
                startIcon={<UserCheck aria-hidden="true" size={15} />}
                onClick={() => checkInAppointment(selectedAppointment.id)}
              >
                Confirm identity & check in
              </Button>
            ) : null}
            {queueMode && actionLabel ? (
              <Button
                fullWidth
                startIcon={<ArrowRight aria-hidden="true" size={15} />}
                onClick={() => advanceQueue(selectedAppointment.id)}
              >
                {actionLabel}
              </Button>
            ) : null}
            {queueMode && selectedAppointment.queueStatus === "In consultation" ? (
              <ButtonLink
                fullWidth
                href={`/consultation?appointment=${selectedAppointment.id}&handoff=confirmed`}
                startIcon={<Stethoscope aria-hidden="true" size={15} />}
                endIcon={<ArrowRight aria-hidden="true" size={14} />}
              >
                Open consultation workspace
              </ButtonLink>
            ) : null}
            <Button
              fullWidth
              variant="secondary"
              startIcon={<RotateCcw aria-hidden="true" size={14} />}
              disabled={selectedAppointment.appointmentStatus !== "Scheduled"}
              onClick={() => startReschedule(selectedAppointment)}
            >
              Reschedule
            </Button>
            {queueMode && selectedAppointment.queueStatus !== "Completed" ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowPriority((current) => !current);
                    setShowReassign(false);
                    setPriorityValue(selectedAppointment.priority);
                  }}
                >
                  Set priority
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowReassign((current) => !current);
                    setShowPriority(false);
                    setReassignmentRoom(selectedAppointment.room);
                  }}
                >
                  Reassign
                </Button>
              </div>
            ) : null}
            {canCancel ? (
              <Button
                fullWidth
                variant="tertiary"
                className="spine-button--critical-text"
                startIcon={<XCircle aria-hidden="true" size={14} />}
                onClick={() => {
                  setCancelTargetId(selectedAppointment.id);
                  setShowPriority(false);
                  setShowReassign(false);
                }}
              >
                Cancel appointment
              </Button>
            ) : null}
          </div>

          {showPriority ? (
            <div className="mt-5 border-t border-border-subtle pt-5">
              <Alert tone="warning" title="Priority changes require a reason">
                Urgent priority changes queue order but never bypasses identity or clinical handoff checks.
              </Alert>
              <SelectField
                id="queue-priority"
                label="Queue priority"
                value={priorityValue}
                onChange={(event) => setPriorityValue(event.target.value as AppointmentPriority)}
                fieldClassName="mt-4"
              >
                <option value="Routine">Routine</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Urgent">Urgent override</option>
              </SelectField>
              <label className="spine-field mt-4" htmlFor="priority-reason">
                <span className="spine-field__label">Reason</span>
                <textarea
                  id="priority-reason"
                  className="spine-input min-h-20 py-2.5"
                  value={priorityReason}
                  onChange={(event) => setPriorityReason(event.target.value)}
                  placeholder="Record the operational or clinical reason"
                />
              </label>
              <Button
                fullWidth
                className="mt-4"
                disabled={!priorityReason.trim()}
                onClick={confirmPriorityChange}
              >
                Apply priority
              </Button>
            </div>
          ) : null}

          {showReassign ? (
            <div className="mt-5 border-t border-border-subtle pt-5">
              <SelectField
                id="queue-location"
                label="New service location"
                value={reassignmentRoom}
                onChange={(event) => setReassignmentRoom(event.target.value)}
              >
                <option value="">Select a location</option>
                {prototypeClinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.room}>
                    {clinician.room} · {clinician.department}
                  </option>
                ))}
              </SelectField>
              <label className="spine-field mt-4" htmlFor="reassignment-reason">
                <span className="spine-field__label">Reassignment reason</span>
                <textarea
                  id="reassignment-reason"
                  className="spine-input min-h-20 py-2.5"
                  value={reassignmentReason}
                  onChange={(event) => setReassignmentReason(event.target.value)}
                  placeholder="Why is this queue item moving?"
                />
              </label>
              <Button
                fullWidth
                className="mt-4"
                disabled={!reassignmentRoom || !reassignmentReason.trim()}
                onClick={confirmReassignment}
              >
                Confirm reassignment
              </Button>
            </div>
          ) : null}

          {cancelTargetId === selectedAppointment.id ? (
            <div className="mt-5 border-t border-border-subtle pt-5">
              <Alert tone="critical" title="Confirm appointment cancellation">
                This releases the slot and removes any active queue token. The reason remains visible for review.
              </Alert>
              <label className="spine-field mt-4" htmlFor="cancellation-reason">
                <span className="spine-field__label">Cancellation reason</span>
                <textarea
                  id="cancellation-reason"
                  className="spine-input min-h-20 py-2.5"
                  value={cancellationReason}
                  onChange={(event) => setCancellationReason(event.target.value)}
                  placeholder="Record who requested cancellation and why"
                />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCancelTargetId(null);
                    setCancellationReason("");
                  }}
                >
                  Keep appointment
                </Button>
                <Button
                  variant="critical"
                  disabled={!cancellationReason.trim()}
                  onClick={confirmCancellation}
                >
                  Cancel appointment
                </Button>
              </div>
            </div>
          ) : null}
        </PanelBody>
      </Panel>
    );
  }

  return (
    <div className="spine-page-container py-7 md:py-9">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-action">
              Patient access · OPD
            </p>
            <StatusBadge>Illustrative session data</StatusBadge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink-primary md:text-3xl">
            Appointment calendar
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary">
            Book conflict-safe slots, confirm arrivals and move each patient through a visible, accountable queue.
          </p>
        </div>
        <Button startIcon={<Plus aria-hidden="true" size={15} />} onClick={startNewBooking}>
          New appointment
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-default">
        <div className="spine-segmented-control" aria-label="Appointment workspace view">
          <button
            type="button"
            className="spine-segmented-control__item"
            data-active={activeView === "schedule"}
            aria-pressed={activeView === "schedule"}
            onClick={() => setActiveView("schedule")}
          >
            <CalendarClock aria-hidden="true" size={15} />
            Schedule
          </button>
          <button
            type="button"
            className="spine-segmented-control__item"
            data-active={activeView === "queue"}
            aria-pressed={activeView === "queue"}
            onClick={() => setActiveView("queue")}
          >
            <ListChecks aria-hidden="true" size={15} />
            Live queue
            <StatusBadge tone="warning" className="ml-1 min-h-5 px-1.5 text-[9px]">
              {activeQueue.length}
            </StatusBadge>
          </button>
        </div>
        <p className="pb-3 text-[10px] text-ink-tertiary">
          Reception workspace · Main facility
        </p>
      </div>

      {notice ? (
        <Alert tone={notice.tone} title={notice.title} className="mt-5">
          {notice.message}
        </Alert>
      ) : null}

      {contextPatient ? (
        <div className="mt-5">
          <PatientContextBar
            name={contextPatient.name}
            age={contextPatient.age}
            sex={contextPatient.sex}
            mrn={contextPatient.mrn}
            encounter={contextPatient.encounter ?? "No active encounter"}
            location={selectedAppointment?.room ?? contextPatient.location ?? "Appointment desk"}
            clinician={selectedAppointment?.clinician ?? contextPatient.clinician ?? "Not assigned"}
            allergies={contextPatient.allergies}
            verifiedAt={booking.identityVerified ? "this booking step" : "previous workflow"}
          />
        </div>
      ) : null}

      {activeView === "schedule" ? (
        <>
          <form onSubmit={handleBookingSubmit} className="mt-6 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
            <Panel elevation="flat">
              <PanelHeader>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                    {editingAppointmentId ? "Reschedule" : "Booking details"}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                    {editingAppointmentId ? "Choose a replacement" : "Patient and service"}
                  </h2>
                </div>
                {editingAppointmentId ? (
                  <StatusBadge tone="warning">Original slot held</StatusBadge>
                ) : null}
              </PanelHeader>
              <PanelBody className="space-y-4">
                <SelectField
                  id="appointment-patient"
                  label="Patient"
                  value={booking.patientId}
                  error={bookingErrors.patientId}
                  disabled={Boolean(editingAppointmentId)}
                  onChange={(event) => {
                    setBooking((current) => ({
                      ...current,
                      patientId: event.target.value,
                      identityVerified: false,
                    }));
                    setSelectedAppointmentId(null);
                  }}
                >
                  <option value="">Select a verified patient</option>
                  {prototypePatients
                    .filter((patient) => !patient.restricted)
                    .map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} · {patient.mrn}
                      </option>
                    ))}
                </SelectField>
                <ButtonLink href="/patients" variant="tertiary" size="sm" className="-ml-3">
                  Find or register another patient
                </ButtonLink>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <SelectField
                    id="appointment-department"
                    label="Department"
                    value={booking.department}
                    error={bookingErrors.department}
                    onChange={(event) =>
                      setBooking((current) => ({
                        ...current,
                        department: event.target.value,
                        clinicianId: "",
                        time: "",
                      }))
                    }
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </SelectField>
                  <SelectField
                    id="appointment-clinician"
                    label="Clinician"
                    value={booking.clinicianId}
                    error={bookingErrors.clinicianId}
                    disabled={!booking.department}
                    onChange={(event) =>
                      setBooking((current) => ({
                        ...current,
                        clinicianId: event.target.value,
                        time: "",
                      }))
                    }
                  >
                    <option value="">Select clinician</option>
                    {availableClinicians.map((clinician) => (
                      <option key={clinician.id} value={clinician.id}>
                        {clinician.name}
                      </option>
                    ))}
                  </SelectField>
                </div>

                <SelectField
                  id="appointment-date"
                  label="Date"
                  value={booking.date}
                  error={bookingErrors.date}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      date: event.target.value,
                      time: "",
                    }))
                  }
                >
                  {scheduleDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </SelectField>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <SelectField
                    id="appointment-visit-type"
                    label="Visit type"
                    value={booking.visitType}
                    onChange={(event) =>
                      setBooking((current) => ({ ...current, visitType: event.target.value }))
                    }
                  >
                    <option>New consultation</option>
                    <option>Follow-up</option>
                    <option>Referral</option>
                  </SelectField>
                  <SelectField
                    id="appointment-source"
                    label="Booking source"
                    value={booking.source}
                    onChange={(event) =>
                      setBooking((current) => ({ ...current, source: event.target.value }))
                    }
                  >
                    <option>Front desk</option>
                    <option>Walk-in</option>
                    <option>Online</option>
                    <option>Call centre</option>
                    <option>WhatsApp</option>
                    <option>Referral</option>
                    <option>Waitlist</option>
                  </SelectField>
                </div>

                {editingAppointmentId ? (
                  <TextField
                    id="reschedule-reason"
                    label="Reschedule reason"
                    value={rescheduleReason}
                    error={bookingErrors.rescheduleReason}
                    onChange={(event) => setRescheduleReason(event.target.value)}
                    placeholder="Patient request, clinician leave, service change…"
                  />
                ) : null}

                <CheckboxField
                  id="appointment-identity-confirmed"
                  label="Two patient identifiers confirmed"
                  description="Confirm name plus date of birth, mobile suffix or MRN with the patient."
                  checked={booking.identityVerified}
                  error={bookingErrors.identityVerified}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      identityVerified: event.target.checked,
                    }))
                  }
                />
              </PanelBody>
            </Panel>

            <Panel elevation="flat">
              <PanelHeader>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                    Availability
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                    Select an available slot
                  </h2>
                  <p className="mt-1 text-xs text-ink-secondary">
                    {selectedClinician
                      ? `${selectedClinician.name} · ${selectedClinician.room} · ${selectedClinician.slotMinutes}-minute slots`
                      : "Choose a department and clinician to load their governed schedule."}
                  </p>
                </div>
                {selectedClinician ? (
                  <StatusBadge tone="success">
                    {slotStates.filter((slot) => slot.state === "available").length} available
                  </StatusBadge>
                ) : null}
              </PanelHeader>
              <PanelBody>
                {!selectedClinician ? (
                  <div className="grid min-h-64 place-items-center text-center">
                    <div className="max-w-64">
                      <span className="mx-auto grid size-11 place-items-center rounded-full bg-surface-subtle text-ink-secondary">
                        <CalendarClock aria-hidden="true" size={19} />
                      </span>
                      <h3 className="mt-4 text-sm font-semibold text-ink-primary">
                        Provider schedule not selected
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-ink-secondary">
                        Availability is shown only after the service and responsible clinician are explicit.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                      {slotStates.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className="spine-slot"
                          data-state={slot.state}
                          data-selected={booking.time === slot.time}
                          disabled={slot.state !== "available"}
                          aria-pressed={booking.time === slot.time}
                          aria-label={`${slot.time}, ${slot.state}${slot.detail ? `, ${slot.detail}` : ""}`}
                          onClick={() =>
                            setBooking((current) => ({ ...current, time: slot.time }))
                          }
                        >
                          <span className="spine-mono text-sm font-semibold">{slot.time}</span>
                          <span className="mt-1 text-[10px]">{slot.detail}</span>
                        </button>
                      ))}
                    </div>

                    {bookingErrors.time ? (
                      <p className="mt-3 text-xs font-semibold text-error">{bookingErrors.time}</p>
                    ) : null}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-5">
                      <div className="flex flex-wrap gap-4 text-[10px] text-ink-secondary">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-success" /> Available
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-border-default" /> Booked
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-warning" /> Blocked
                        </span>
                      </div>
                      <p className="spine-mono text-xs font-semibold text-ink-primary">
                        {booking.time ? `Selected ${booking.time}` : "No slot selected"}
                      </p>
                    </div>

                    <Alert tone="information" title="Conflict checks run again on confirmation" className="mt-5">
                      The slot and patient are rechecked immediately before the appointment is created. Double booking is never silently allowed.
                    </Alert>

                    <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Button
                        type="submit"
                        fullWidth
                        startIcon={
                          booking.source === "Walk-in" ? (
                            <TicketCheck aria-hidden="true" size={15} />
                          ) : (
                            <CalendarCheck2 aria-hidden="true" size={15} />
                          )
                        }
                      >
                        {editingAppointmentId
                          ? "Confirm reschedule"
                          : booking.source === "Walk-in"
                            ? "Create visit & check in"
                            : "Book appointment"}
                      </Button>
                      {!editingAppointmentId ? (
                        <Button type="button" variant="secondary" onClick={addToWaitlist}>
                          Add to waitlist
                        </Button>
                      ) : null}
                    </div>
                  </>
                )}
              </PanelBody>
            </Panel>
          </form>

          <div className="mt-6 grid gap-6 2xl:grid-cols-[1.42fr_0.58fr]">
            <div className="space-y-6">
              <Panel>
                <PanelHeader>
                  <div>
                    <div className="flex items-center gap-2 text-action">
                      <CalendarCheck2 aria-hidden="true" size={16} />
                      <p className="text-xs font-bold uppercase tracking-[0.1em]">
                        Daily schedule
                      </p>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                      {scheduleDates.find((date) => date.value === booking.date)?.label}
                    </h2>
                  </div>
                  <StatusBadge>{dateAppointments.length} appointments</StatusBadge>
                </PanelHeader>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[840px] border-collapse text-left">
                    <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                      <tr>
                        <th className="px-5 py-3 font-semibold" scope="col">Time</th>
                        <th className="px-5 py-3 font-semibold" scope="col">Patient</th>
                        <th className="px-5 py-3 font-semibold" scope="col">Service</th>
                        <th className="px-5 py-3 font-semibold" scope="col">Appointment</th>
                        <th className="px-5 py-3 font-semibold" scope="col">Queue</th>
                        <th className="px-5 py-3 font-semibold" scope="col"><span className="sr-only">Manage</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                      {dateAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className={cn(
                            "hover:bg-surface-subtle/60",
                            selectedAppointmentId === appointment.id && "bg-selected/50",
                          )}
                        >
                          <td className="spine-mono px-5 py-4 text-xs font-semibold text-ink-primary">
                            {appointment.time}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-xs font-semibold text-ink-primary">{appointment.patientName}</p>
                            <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">{appointment.mrn}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-xs text-ink-primary">{appointment.clinician}</p>
                            <p className="mt-1 text-[10px] text-ink-tertiary">{appointment.department}</p>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge tone={appointmentTone(appointment.appointmentStatus)}>
                              {appointment.appointmentStatus}
                            </StatusBadge>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge tone={queueTone(appointment.queueStatus)}>
                              {appointment.queueStatus}
                            </StatusBadge>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button
                              variant="tertiary"
                              size="sm"
                              endIcon={<ArrowRight aria-hidden="true" size={13} />}
                              onClick={() => {
                                setSelectedAppointmentId(appointment.id);
                                resetActionForms();
                              }}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel elevation="flat">
                <PanelHeader>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-action">
                      Waiting list
                    </p>
                    <h2 className="mt-2 text-base font-semibold text-ink-primary">
                      Manual slot offers
                    </h2>
                  </div>
                  <StatusBadge tone="warning">{waitlist.filter((entry) => entry.status === "Waiting").length} waiting</StatusBadge>
                </PanelHeader>
                <div className="divide-y divide-border-subtle">
                  {waitlist.map((entry) => (
                    <div key={entry.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-ink-primary">{entry.patientName}</p>
                          <StatusBadge tone={entry.status === "Slot offered" ? "information" : "warning"}>
                            {entry.status}
                          </StatusBadge>
                        </div>
                        <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">
                          {entry.mrn} · {entry.clinician} · {entry.date}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={entry.status === "Slot offered"}
                        onClick={() => offerReleasedSlot(entry)}
                      >
                        Review released slot
                      </Button>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
            {renderAppointmentDetail(false)}
          </div>
        </>
      ) : (
        <>
          <section aria-labelledby="queue-summary-title" className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <h2 id="queue-summary-title" className="sr-only">Live queue summary</h2>
            {[
              {
                label: "Waiting",
                value: activeQueue.filter((appointment) => appointment.queueStatus === "Waiting").length,
                detail: "Ready to be called",
                icon: UsersRound,
                tone: "warning" as StatusTone,
              },
              {
                label: "Called",
                value: activeQueue.filter((appointment) => appointment.queueStatus === "Called").length,
                detail: "Moving to service point",
                icon: DoorOpen,
                tone: "information" as StatusTone,
              },
              {
                label: "In consultation",
                value: activeQueue.filter((appointment) => appointment.queueStatus === "In consultation").length,
                detail: "Clinical handoff complete",
                icon: Stethoscope,
                tone: "success" as StatusTone,
              },
              {
                label: "Average wait",
                value: `${Math.round(
                  activeQueue.reduce((total, appointment) => total + (appointment.waitMinutes ?? 0), 0) /
                    Math.max(activeQueue.length, 1),
                )} min`,
                detail: "Target under 20 min",
                icon: Clock3,
                tone: "success" as StatusTone,
              },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Panel key={metric.label} elevation="flat">
                  <PanelBody>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-tertiary">
                          {metric.label}
                        </p>
                        <p className="spine-mono mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink-primary">
                          {metric.value}
                        </p>
                      </div>
                      <span className="grid size-9 place-items-center rounded-md bg-selected text-action">
                        <Icon aria-hidden="true" size={17} />
                      </span>
                    </div>
                    <StatusBadge tone={metric.tone} className="mt-4">
                      {metric.detail}
                    </StatusBadge>
                  </PanelBody>
                </Panel>
              );
            })}
          </section>

          <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_0.55fr]">
            <Panel>
              <PanelHeader>
                <div>
                  <div className="flex items-center gap-2 text-action">
                    <TicketCheck aria-hidden="true" size={16} />
                    <p className="text-xs font-bold uppercase tracking-[0.1em]">Live OPD queue</p>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-ink-primary">
                    Queue position and handoff state
                  </h2>
                </div>
                <Button
                  size="sm"
                  startIcon={<Zap aria-hidden="true" size={14} />}
                  onClick={callNextPatient}
                >
                  Call next
                </Button>
              </PanelHeader>
              <Alert tone="information" title="Queue state is separate from appointment state" className="m-5 mb-0">
                Calling a patient changes operational position only. Consultation starts only after an explicit clinical handoff.
              </Alert>
              <div className="overflow-x-auto">
                <table className="mt-5 w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-surface-subtle text-[10px] uppercase tracking-[0.08em] text-ink-tertiary">
                    <tr>
                      <th className="px-5 py-3 font-semibold" scope="col">Token</th>
                      <th className="px-5 py-3 font-semibold" scope="col">Patient</th>
                      <th className="px-5 py-3 font-semibold" scope="col">Service point</th>
                      <th className="px-5 py-3 font-semibold" scope="col">Wait</th>
                      <th className="px-5 py-3 font-semibold" scope="col">Priority</th>
                      <th className="px-5 py-3 font-semibold" scope="col">Queue state</th>
                      <th className="px-5 py-3 font-semibold" scope="col"><span className="sr-only">Manage</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {queueAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className={cn(
                          "hover:bg-surface-subtle/60",
                          selectedAppointmentId === appointment.id && "bg-selected/50",
                        )}
                      >
                        <td className="px-5 py-4">
                          <span className="spine-mono text-sm font-bold text-action">{appointment.token}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-ink-primary">{appointment.patientName}</p>
                          <p className="spine-mono mt-1 text-[10px] text-ink-tertiary">{appointment.mrn}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-xs text-ink-primary">{appointment.room}</p>
                          <p className="mt-1 text-[10px] text-ink-tertiary">{appointment.clinician}</p>
                        </td>
                        <td className="spine-mono px-5 py-4 text-xs text-ink-primary">
                          {appointment.queueStatus === "Completed" ? "—" : `${appointment.waitMinutes ?? 0} min`}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={priorityTone(appointment.priority)}>{appointment.priority}</StatusBadge>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge tone={queueTone(appointment.queueStatus)}>{appointment.queueStatus}</StatusBadge>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="tertiary"
                            size="sm"
                            endIcon={<MoveRight aria-hidden="true" size={13} />}
                            onClick={() => {
                              setSelectedAppointmentId(appointment.id);
                              resetActionForms();
                            }}
                          >
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
            {renderAppointmentDetail(true)}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Alert tone="success" title="Token generation governed">
              Tokens are issued only after explicit check-in and remain linked to the verified patient.
            </Alert>
            <Alert tone="warning" title="Priority needs a reason">
              Urgent and follow-up ordering is visible, reversible and recorded in the audit note.
            </Alert>
            <Alert tone="information" title="Reassignment preserves state">
              Moving a queue item changes its service point without silently completing or restarting it.
            </Alert>
          </div>
        </>
      )}
    </div>
  );
}
