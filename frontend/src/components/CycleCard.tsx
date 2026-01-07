import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Droplets } from "lucide-react";

interface CycleCardProps {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  daysUntilNext: number;
  onLogPeriod: () => void;
}

export const CycleCard = ({ 
  currentDay, 
  cycleLength, 
  periodLength, 
  daysUntilNext, 
  onLogPeriod 
}: CycleCardProps) => {
  const progressPercentage = (currentDay / cycleLength) * 100;
  
  return (
    <Card className="p-6 border border-border shadow-card">
      <div className="text-center space-y-4">
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
            />
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray={`${progressPercentage}, 100`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-primary">Day</span>
            <span className="text-3xl font-bold text-foreground">{currentDay}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Current Cycle</h2>
          <p className="text-muted-foreground">
            {daysUntilNext > 0 
              ? `${daysUntilNext} days until next period`
              : "Period predicted to start today"
            }
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <Droplets className="w-5 h-5 mx-auto mb-1 text-cycle-active" />
            <p className="text-sm text-muted-foreground">Period</p>
            <p className="font-semibold">{periodLength}d</p>
          </div>
          <div className="text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm text-muted-foreground">Cycle</p>
            <p className="font-semibold">{cycleLength}d</p>
          </div>
          <div className="text-center">
            <Heart className="w-5 h-5 mx-auto mb-1 text-cycle-fertile" />
            <p className="text-sm text-muted-foreground">Fertile</p>
            <p className="font-semibold">5d</p>
          </div>
        </div>

        <Button 
          onClick={onLogPeriod}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          Log Period
        </Button>
      </div>
    </Card>
  );
};