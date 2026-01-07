import { CycleCard } from '@/components/CycleCard';
import { SymptomsCard } from '@/components/SymptomsCard';
import { Navbar } from '@/components/Navbar';
import { useAppSelector } from '@/store/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, TrendingUp, Target, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';

const cycleTrendData = [
  { month: 'Aug', cycleLength: 27, periodLength: 5 },
  { month: 'Sep', cycleLength: 29, periodLength: 5 },
  { month: 'Oct', cycleLength: 28, periodLength: 4 },
  { month: 'Nov', cycleLength: 28, periodLength: 5 },
  { month: 'Dec', cycleLength: 27, periodLength: 5 },
  { month: 'Jan', cycleLength: 28, periodLength: 5 },
];

const symptomData = [
  { name: 'Cramps', value: 75 },
  { name: 'Fatigue', value: 60 },
  { name: 'Headache', value: 45 },
  { name: 'Bloating', value: 55 },
];

const moodData = [
  { day: 'Day 1', mood: 2 },
  { day: 'Day 5', mood: 3 },
  { day: 'Day 10', mood: 4 },
  { day: 'Day 14', mood: 5 },
  { day: 'Day 20', mood: 4 },
  { day: 'Day 25', mood: 3 },
  { day: 'Day 28', mood: 2 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0.6)', 'hsl(var(--primary) / 0.4)'];

export const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { cycleData, periods } = useAppSelector((state) => state.cycle);

  const nextPeriodDate = cycleData?.nextPeriodPredicted 
    ? format(new Date(cycleData.nextPeriodPredicted), 'MMM d, yyyy')
    : 'Calculating...';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Hello, {user?.name || 'there'}! 👋</h1>
              <p className="text-muted-foreground">Here's your cycle overview and analytics</p>
            </div>
            <Link to="/log">
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Log Period
              </Button>
            </Link>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Next Period</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{nextPeriodDate}</div>
              <p className="text-sm text-muted-foreground mt-1">In {cycleData?.daysUntilNext || 0} days</p>
            </Card>

            <Card className="p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Cycle Length</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{user?.cycleLength || 28} days</div>
              <p className="text-sm text-muted-foreground mt-1">Your average</p>
            </Card>

            <Card className="p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Period Length</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{cycleData?.periodLength || 5} days</div>
              <p className="text-sm text-muted-foreground mt-1">Your average</p>
            </Card>

            <Card className="p-6 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Current Day</span>
              </div>
              <div className="text-2xl font-bold text-foreground">Day {cycleData?.currentDay || 1}</div>
              <p className="text-sm text-muted-foreground mt-1">Of your cycle</p>
            </Card>
          </div>

          {/* Cycle & Symptoms Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CycleCard 
              currentDay={cycleData?.currentDay || 8} 
              cycleLength={user?.cycleLength || 28} 
              periodLength={cycleData?.periodLength || 5} 
              daysUntilNext={cycleData?.daysUntilNext || 20} 
              onLogPeriod={() => {}} 
            />
            <SymptomsCard />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground mb-6">Cycle Length Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={cycleTrendData}>
                  <defs>
                    <linearGradient id="colorCycle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[24, 32]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="cycleLength" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorCycle)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground mb-6">Period Length History</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cycleTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[0, 8]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="periodLength" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground mb-6">Common Symptoms</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={symptomData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {symptomData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {symptomData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border border-border shadow-card">
              <h3 className="font-semibold text-foreground mb-6">Mood Pattern</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => {
                      const labels = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];
                      return labels[value - 1];
                    }}
                  />
                  <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
