export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT', 
  // LATE and EXCUSED removed from UI logic, kept in enum for backward compatibility if needed, 
  // but effectively we will only use PRESENT and ABSENT in the new UI.
}

export interface Person {
  id: string;
  groupId: string;
  firstName: string;
  lastName: string;
  birthYear?: string; // Added Year of Birth
}

export interface Group {
  id: string;
  name: string;
  description?: string;
}

export interface Session {
  id: string;
  groupId: string;
  date: string; // ISO string YYYY-MM-DD
  type: 'CLASS' | 'COMPETITION'; // Changed TRIP to COMPETITION (Zawody)
  topic?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  personId: string;
  status: AttendanceStatus;
}

export interface AppData {
  groups: Group[];
  people: Person[];
  sessions: Session[];
  records: AttendanceRecord[];
  isPro: boolean; 
}