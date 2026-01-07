import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, getDay } from 'date-fns';

// Mock period data
const mockPeriodDates = [
  { start: new Date(2024, 11, 1), end: new Date(2024, 11, 5) },
  { start: new Date(2025, 0, 1), end: new Date(2025, 0, 5) },
];

const mockPredictedDates = [
  { start: new Date(2025, 0, 29), end: new Date(2025, 1, 2) },
];

const mockFertileDates = [
  { start: new Date(2025, 0, 12), end: new Date(2025, 0, 17) },
];

const mockOvulationDate = new Date(2025, 0, 15);

export const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  const isPeriodDay = (date: Date) => {
    return mockPeriodDates.some(period => 
      date >= period.start && date <= period.end
    );
  };

  const isPredictedDay = (date: Date) => {
    return mockPredictedDates.some(period => 
      date >= period.start && date <= period.end
    );
  };

  const isFertileDay = (date: Date) => {
    return mockFertileDates.some(period => 
      date >= period.start && date <= period.end
    );
  };

  const isOvulationDay = (date: Date) => {
    return isSameDay(date, mockOvulationDate);
  };

  const getDayClasses = (date: Date) => {
    let classes = 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ';
    
    if (isToday(date)) {
      classes += 'ring-2 ring-primary ring-offset-2 ';
    }

    if (isPeriodDay(date)) {
      return classes + 'bg-cycle-active text-primary-foreground';
    }
    if (isOvulationDay(date)) {
      return classes + 'bg-cycle-ovulation text-foreground';
    }
    if (isFertileDay(date)) {
      return classes + 'bg-cycle-fertile text-primary-foreground';
    }
    if (isPredictedDay(date)) {
      return classes + 'bg-cycle-predicted text-foreground';
    }

    return classes + 'hover:bg-secondary text-foreground';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Calendar
            </h1>
            <p className="text-muted-foreground">
              View your cycle history and predictions
            </p>
          </div>

          <Card className="p-6 border border-border shadow-card">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="h-12" />
              ))}
              {days.map(day => (
                <div key={day.toISOString()} className="h-12 flex items-center justify-center">
                  <div className={getDayClasses(day)}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Legend */}
          <Card className="p-6 border border-border shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cycle-active" />
                <span className="text-sm text-muted-foreground">Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cycle-predicted" />
                <span className="text-sm text-muted-foreground">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cycle-fertile" />
                <span className="text-sm text-muted-foreground">Fertile Window</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cycle-ovulation" />
                <span className="text-sm text-muted-foreground">Ovulation</span>
              </div>
            </div>
          </Card>

          {/* Cycle Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Cycle Length</h3>
              <div className="text-3xl font-bold text-primary mb-1">28 days</div>
              <p className="text-sm text-muted-foreground">Average over last 6 months</p>
            </Card>
            <Card className="p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Regularity</h3>
              <div className="text-3xl font-bold text-success mb-1">Very Regular</div>
              <p className="text-sm text-muted-foreground">±2 days variation</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};