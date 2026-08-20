export type EquipmentCheckout = {
  id: string;
  equipment: string;
  ward: string;
  staff: string;
  checkedOutAt: string;
  status: "checked-out" | "reprocessing" | "available";
};

export const prototypeEquipmentCheckouts: EquipmentCheckout[] = [
  { id: "eq-1", equipment: "Glucometer — GLM-014", ward: "Ward 4B", staff: "Nurse Kavitha", checkedOutAt: "40 min ago", status: "checked-out" },
  { id: "eq-2", equipment: "Portable ECG — ECG-006", ward: "Emergency Department", staff: "Nurse Rohan", checkedOutAt: "1 hr ago", status: "checked-out" },
];

export const poctEquipmentRoster = ["Glucometer — GLM-014", "Portable ECG — ECG-006", "Doppler — DOP-002", "Infusion pump — IP-0231"];

export const wardOptions = ["Ward 4B", "Ward 3A", "Ward 2A", "Emergency Department", "ICU", "OT complex"];
