import { AppData, AttendanceStatus } from '../types';

const STORAGE_KEY = 'obecnosc_app_data_v2'; // Bumped version due to schema changes

const INITIAL_DATA: AppData = {
  groups: [
    { id: 'g1', name: 'Rocznik 2012', description: 'Trening piłkarski' },
    { id: 'g2', name: 'Seniorzy', description: 'Pierwszy skład' },
  ],
  people: [
    { id: 'p1', groupId: 'g1', firstName: 'Jan', lastName: 'Kowalski', birthYear: '2012' },
    { id: 'p2', groupId: 'g1', firstName: 'Anna', lastName: 'Nowak', birthYear: '2012' },
    { id: 'p3', groupId: 'g1', firstName: 'Piotr', lastName: 'Wiśniewski', birthYear: '2013' },
    { id: 'p4', groupId: 'g2', firstName: 'Adam', lastName: 'Lewandowski', birthYear: '1995' },
  ],
  sessions: [],
  records: [],
  isPro: true, // PRO enabled by default
};

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(stored);
    // Ensure PRO is true even if loading old data for this user
    return { ...parsed, isPro: true };
  } catch (e) {
    console.error("Failed to load data", e);
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

const POLISH_HOLIDAYS = [
  '01-01', // Nowy Rok
  '01-06', // Trzech Króli
  '05-01', // Święto Pracy
  '05-03', // Konstytucja 3 Maja
  '08-15', // Wniebowzięcie NMP
  '11-01', // Wszystkich Świętych
  '11-11', // Niepodległości
  '12-25', // Bożego Narodzenia
  '12-26', // Bożego Narodzenia
];

export const isPolishHoliday = (date: Date): boolean => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const key = `${month}-${day}`;
  return POLISH_HOLIDAYS.includes(key);
};

export const getStatusLabel = (status: AttendanceStatus) => {
  switch (status) {
    case AttendanceStatus.PRESENT: return 'Obecny';
    case AttendanceStatus.ABSENT: return 'Nieobecny';
    default: return '-';
  }
};

export const getStatusColor = (status: AttendanceStatus) => {
  switch (status) {
    case AttendanceStatus.PRESENT: return 'bg-green-100 text-green-800 border-green-200';
    case AttendanceStatus.ABSENT: return 'bg-red-50 text-red-400 border-red-100 opacity-60'; // Dimmed for absent
    default: return 'bg-gray-100 text-gray-800';
  }
};
