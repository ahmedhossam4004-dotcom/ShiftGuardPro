
import { Worker, Team } from './types';

export const INITIAL_WORKERS: Worker[] = Array.from({ length: 66 }, (_, i) => {
  const team: Team = i < 22 ? 'A' : i < 44 ? 'B' : 'C';
  const pcNum = (i + 1).toString().padStart(2, '0');
  return {
    id: `worker-${i + 1}`,
    pcNumber: `PC-${pcNum}`,
    name: `Worker ${i + 1}`,
    team,
    status: 'Active',
    totalAbsenceToday: 0,
  };
});

export const TEAM_COLORS: Record<Team, string> = {
  A: 'bg-blue-600',
  B: 'bg-purple-600',
  C: 'bg-emerald-600',
  D: 'bg-orange-600',
};

export const ROLE_PERMISSIONS = {
  Owner: ['all'],
  Admin: ['all'],
  User: ['view'],
};
