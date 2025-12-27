
export type Role = 'Owner' | 'Admin' | 'User';

export type Team = 'A' | 'B' | 'C' | 'D';

export type AbsenceReason = 'Break' | 'Lunch' | 'Meeting' | 'Emergency' | 'System Issue' | 'Other';

export interface CloudConfig {
  url: string;
  key: string;
  isConnected: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: Role;
  team?: Team;
  createdAt?: number;
}

export interface AbsenceLog {
  id: string;
  workerId: string;
  startTime: number;
  endTime: number | null;
  duration: number;
  reason: AbsenceReason;
  date: string;
}

export interface LoginLog {
  id: string;
  username: string;
  role: Role;
  timestamp: number;
}

export interface Worker {
  id: string;
  pcNumber: string;
  name: string;
  team: Team;
  status: 'Active' | 'Away';
  lastAbsenceStart?: number;
  currentReason?: AbsenceReason;
  totalAbsenceToday: number;
}

export interface ShiftConfig {
  startTime: string;
  durationHours: number;
  alertThresholdMinutes: number;
}
