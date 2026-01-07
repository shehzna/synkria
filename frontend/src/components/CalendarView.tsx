import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CalendarDay {
  date: number;
  isPeriod: boolean;
  isPredicted: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isToday: boolean;
}

export const CalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: 0,
        isPeriod: false,
        isPredicted: false,
        isFertile: false,
        isOvulation: false,
        isToday: false,
      });
    }
    
    // Add days of the month with mock data
    for (let day = 1; day <= daysInMonth; day++) {
      const today = new Date();
      const isToday = 
        year === today.getFullYear() &&
        month === today.getMonth() &&
        day === today.getDate();
      
      // Mock period data (days 1-5 and predicted 29-33)
      const isPeriod = day >= 1 && day <= 5;
      const isPredicted = day >= 29 && day <= 33;
      const isFertile = day >= 10 && day <= 16;
      const isOvulation = day === 14;
      
      days.push({
        date: day,
        isPeriod,
        isPredicted,
        isFertile,
        isOvulation,
        isToday,
      });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getDayClassName = (day: CalendarDay) => {
    if (day.date === 0) return "";
    
    let className = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ";
    
    if (day.isToday) {
      className += "ring-2 ring-primary ";
    }
    
    if (day.isPeriod) {
      className += "bg-cycle-active text-white ";
    } else if (day.isPredicted) {
      className += "bg-cycle-predicted text-cycle-active border-2 border-cycle-active ";
    } else if (day.isOvulation) {
      className += "bg-cycle-ovulation text-white ";
    } else if (day.isFertile) {
      className += "bg-cycle-fertile/30 text-cycle-fertile ";
    } else {
      className += "hover:bg-muted text-foreground ";
    }
    
    return className;
  };

  return (
    <Card className="p-6 border border-border shadow-card">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="hover:bg-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => (
            <button
              key={index}
              className={getDayClassName(day)}
              disabled={day.date === 0}
            >
              {day.date > 0 && day.date}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cycle-active"></div>
            <span className="text-muted-foreground">Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cycle-predicted border border-cycle-active"></div>
            <span className="text-muted-foreground">Predicted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cycle-fertile/50"></div>
            <span className="text-muted-foreground">Fertile</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cycle-ovulation"></div>
            <span className="text-muted-foreground">Ovulation</span>
          </div>
        </div>
      </div>
    </Card>
  );
};