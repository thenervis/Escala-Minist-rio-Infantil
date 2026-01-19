
export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  joinedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number; // Quantidade de voluntários necessária
}

export interface Assignment {
  id: string;
  date: string; // ISO format (YYYY-MM-DD)
  roomId: string;
  volunteerId: string;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  SCHEDULE = 'schedule',
  VOLUNTEERS = 'volunteers',
  REPORTS = 'reports'
}
