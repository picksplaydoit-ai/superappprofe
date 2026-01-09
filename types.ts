
export enum GradingType {
  CHECK = 'CHECK',
  SCALE = 'SCALE',
  POINTS = 'POINTS'
}

export type AttendanceStatus = 'present' | 'absent';

export interface Student {
  id: string;
  name: string;
  teamId?: string;
}

export interface AttendanceRecord {
  date: string; // ISO String
  studentId: string;
  status: AttendanceStatus;
}

export interface RubricItem {
  id: string;
  name: string;
  percentage: number;
}

export interface RubricSettings {
  minAttendance: number; // 0-100
  minGrade: number; // 0-100
  items: RubricItem[];
}

export interface Activity {
  id: string;
  name: string;
  rubricItemId: string;
  gradingType: GradingType;
  maxPoints?: number;
  isTeam: boolean;
}

export interface Grade {
  studentId: string;
  activityId: string;
  value: number; // For CHECK: 0 or 1, For SCALE: 0-100, For POINTS: points
}

export interface Course {
  id: string;
  name: string;
  groupName: string;
  students: Student[];
  attendance: AttendanceRecord[];
  rubric: RubricSettings;
  activities: Activity[];
  grades: Grade[];
}

export interface User {
  id: string;
  email: string;
}

export type StudentStatus = 'Aprobado' | 'Reprobado' | 'Sin Derecho';
