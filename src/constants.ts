import { Doctor, Center } from './types';

export const CENTERS: Center[] = Array.from({ length: 15 }, (_, i) => ({
  id: `center-${i + 1}`,
  name: `Medical Center ${i + 1}`,
  location: `Sector ${i + 1}, Metro City`
}));

const SPECIALTIES = [
  'General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology', 
  'Neurology', 'Orthopedics', 'Psychiatry', 'Oncology', 
  'Radiology', 'Emergency Medicine'
];

const DOCTOR_NAMES = [
  'Dr. Sarah Mitchell', 'Dr. James Wilson', 'Dr. Emily Chen', 'Dr. Michael Brown',
  'Dr. Elena Rodriguez', 'Dr. David Kim', 'Dr. Aisha Khan', 'Dr. Robert Taylor',
  'Dr. Lisa Wang', 'Dr. Thomas Moore', 'Dr. Maria Garcia', 'Dr. Christopher Lee',
  'Dr. Elizabeth Anderson', 'Dr. Daniel Martin', 'Dr. Jennifer White', 'Dr. Kevin Thompson',
  'Dr. Jessica Martinez', 'Dr. Brian Harris', 'Dr. Amanda Robinson', 'Dr. Justin Clark',
  'Dr. Ashley Lewis', 'Dr. Matthew Walker', 'Dr. Nicole Young', 'Dr. Joshua Hall',
  'Dr. Stephanie Allen', 'Dr. Andrew King', 'Dr. Rachel Wright', 'Dr. Timothy Scott',
  'Dr. Megan Nguyen', 'Dr. Jeffrey Green', 'Dr. Kayla Baker', 'Dr. Ryan Adams',
  'Dr. Heather Campbell', 'Dr. Nicholas Hill', 'Dr. Katherine Rivera', 'Dr. Brandon Scott',
  'Dr. Melissa Flores', 'Dr. Gregory Nelson', 'Dr. Samantha Carter', 'Dr. Patrick Perez'
];

export const INITIAL_DOCTORS: Doctor[] = Array.from({ length: 200 }, (_, i) => ({
  id: `doc-${i + 1}`,
  name: DOCTOR_NAMES[i % DOCTOR_NAMES.length] + ` ${Math.floor(i / DOCTOR_NAMES.length) + 1}`,
  specialty: SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)],
  currentCenterId: null,
  currentShift: null
}));
