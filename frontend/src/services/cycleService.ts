import { PeriodData, CycleData, CycleAnalytics, DataCollectionForm } from '@/types';

// Mock API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const cycleService = {
  async savePeriodData(data: DataCollectionForm, userId: string): Promise<PeriodData> {
    await delay(500);

    const periodData: PeriodData = {
      id: Date.now().toString(),
      userId,
      startDate: data.periodStartDate,
      endDate: data.periodEndDate,
      flowIntensity: data.flowIntensity,
      symptoms: data.symptoms,
      mood: data.mood,
      notes: data.notes,
    };

    // In a real app, this would be saved to a database
    console.log('Saved period data:', periodData);
    
    return periodData;
  },

  async getCycleData(userId: string): Promise<CycleData> {
    await delay(300);

    // Mock cycle data - in real app, calculate from stored periods
    return {
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
  },

  async getAnalytics(userId: string): Promise<CycleAnalytics> {
    await delay(300);

    return {
      averageCycleLength: 28,
      averagePeriodLength: 5,
      cycleLengthVariation: 2,
      predictionAccuracy: 94,
      totalCyclesTracked: 12,
    };
  },

  async getPeriodHistory(userId: string): Promise<PeriodData[]> {
    await delay(300);

    return [
      {
        id: '1',
        userId,
        startDate: new Date(2024, 11, 1),
        endDate: new Date(2024, 11, 5),
        flowIntensity: 'medium',
        symptoms: ['cramps', 'fatigue'],
        mood: 'okay',
      },
      {
        id: '2',
        userId,
        startDate: new Date(2025, 0, 1),
        endDate: new Date(2025, 0, 5),
        flowIntensity: 'medium',
        symptoms: ['cramps', 'headache'],
        mood: 'low',
      },
    ];
  },

  calculateNextPeriod(lastPeriodStart: Date, cycleLength: number): Date {
    const nextPeriod = new Date(lastPeriodStart);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
    return nextPeriod;
  },

  calculateFertileWindow(lastPeriodStart: Date, cycleLength: number): { start: Date; end: Date; ovulation: Date } {
    const ovulationDay = cycleLength - 14;
    const ovulation = new Date(lastPeriodStart);
    ovulation.setDate(ovulation.getDate() + ovulationDay);

    const start = new Date(ovulation);
    start.setDate(start.getDate() - 5);

    const end = new Date(ovulation);
    end.setDate(end.getDate() + 1);

    return { start, end, ovulation };
  },
};
