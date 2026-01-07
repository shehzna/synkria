import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PeriodData, CycleData, CycleAnalytics, CycleTrend } from '@/types';

interface CycleState {
  periods: PeriodData[];
  cycleData: CycleData | null;
  analytics: CycleAnalytics | null;
  trends: CycleTrend[];
  isLoading: boolean;
}

const mockCycleData: CycleData = {
  currentDay: 12,
  cycleLength: 28,
  periodLength: 5,
  daysUntilNext: 16,
  lastPeriodStart: new Date(2025, 0, 1),
  nextPeriodPredicted: new Date(2025, 0, 29),
  fertileWindowStart: new Date(2025, 0, 12),
  fertileWindowEnd: new Date(2025, 0, 17),
  ovulationDate: new Date(2025, 0, 15),
};

const mockAnalytics: CycleAnalytics = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  cycleLengthVariation: 2,
  predictionAccuracy: 94,
  totalCyclesTracked: 12,
};

const mockTrends: CycleTrend[] = [
  { month: 'Aug', cycleLength: 27, periodLength: 5 },
  { month: 'Sep', cycleLength: 29, periodLength: 5 },
  { month: 'Oct', cycleLength: 28, periodLength: 4 },
  { month: 'Nov', cycleLength: 28, periodLength: 5 },
  { month: 'Dec', cycleLength: 27, periodLength: 5 },
  { month: 'Jan', cycleLength: 28, periodLength: 5 },
];

const mockPeriods: PeriodData[] = [
  {
    id: '1',
    userId: '1',
    startDate: new Date(2024, 11, 1),
    endDate: new Date(2024, 11, 5),
    flowIntensity: 'medium',
    symptoms: ['cramps', 'fatigue'],
    mood: 'okay',
  },
  {
    id: '2',
    userId: '1',
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 0, 5),
    flowIntensity: 'medium',
    symptoms: ['cramps', 'headache'],
    mood: 'low',
  },
];

const initialState: CycleState = {
  periods: mockPeriods,
  cycleData: mockCycleData,
  analytics: mockAnalytics,
  trends: mockTrends,
  isLoading: false,
};

const cycleSlice = createSlice({
  name: 'cycle',
  initialState,
  reducers: {
    addPeriodData: (state, action: PayloadAction<PeriodData>) => {
      state.periods.push(action.payload);
    },
    updatePeriodData: (state, action: PayloadAction<PeriodData>) => {
      const index = state.periods.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.periods[index] = action.payload;
      }
    },
    setCycleData: (state, action: PayloadAction<CycleData>) => {
      state.cycleData = action.payload;
    },
    setAnalytics: (state, action: PayloadAction<CycleAnalytics>) => {
      state.analytics = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { addPeriodData, updatePeriodData, setCycleData, setAnalytics, setLoading } = cycleSlice.actions;
export default cycleSlice.reducer;
