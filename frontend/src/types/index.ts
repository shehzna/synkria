// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  age?: number;
  cycleLength?: number;
  createdAt: Date;
  is_staff?: boolean;
}

// Authentication types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  age?: number;
  cycleLength?: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Period tracking types
export interface PeriodData {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  flowIntensity: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: 'good' | 'okay' | 'low';
  notes?: string;
}

export interface CycleData {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  daysUntilNext: number;
  lastPeriodStart?: Date;
  nextPeriodPredicted?: Date;
  fertileWindowStart?: Date;
  fertileWindowEnd?: Date;
  ovulationDate?: Date;
}

// Analytics types
export interface CycleAnalytics {
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleLengthVariation: number;
  predictionAccuracy: number;
  totalCyclesTracked: number;
}

export interface CycleTrend {
  month: string;
  cycleLength: number;
  periodLength: number;
}

// Calendar types
export interface CalendarDay {
  date: Date;
  isPeriod: boolean;
  isPredicted: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isToday: boolean;
}

// Form types
export interface DataCollectionForm {
  periodStartDate: Date;
  periodEndDate?: Date;
  symptoms: string[];
  mood: 'good' | 'okay' | 'low';
  flowIntensity: 'light' | 'medium' | 'heavy';
  notes?: string;
}