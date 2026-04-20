export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  currentCenterId: string | null;
  currentShift: Shift | null;
}

export interface Center {
  id: string;
  name: string;
  location: string;
}

export interface Shift {
  doctorId: string;
  centerId: string;
  startTime: string; // ISO string or HH:mm
  endTime: string;   // ISO string or HH:mm
  date: string;      // YYYY-MM-DD
}
