export type IsolationRoom = {
  id: string;
  room: string;
  type: "contact" | "droplet" | "airborne" | "protective";
  patient: string;
};

export const prototypeIsolationRooms: IsolationRoom[] = [
  { id: "iso-1", room: "Ward 4B · Room 412", type: "contact", patient: "Mohammed Farooq" },
  { id: "iso-2", room: "ICU · Bed 2", type: "airborne", patient: "Arvind Nair" },
  { id: "iso-3", room: "Ward 2A · Room 208", type: "protective", patient: "Priya Nambiar" },
];

export const isolationRoomOptions = ["Ward 4B · Room 412", "ICU · Bed 2", "Ward 2A · Room 208", "Ward 3A · Room 305"];

export const handHygieneCompliance = { observed: 142, compliant: 129 };
