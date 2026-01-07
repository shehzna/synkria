import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { addPeriodData } from '@/store/slices/cycleSlice';
import { cycleService } from '@/services/cycleService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Check, Droplets, Smile, Meh, Frown, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DataCollectionForm, PeriodData } from '@/types';

const symptoms = [
  { id: 'cramps', label: 'Cramps', icon: '💫' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'fatigue', label: 'Fatigue', icon: '😴' },
  { id: 'bloating', label: 'Bloating', icon: '🎈' },
  { id: 'backpain', label: 'Back Pain', icon: '🔙' },
  { id: 'nausea', label: 'Nausea', icon: '🤢' },
  { id: 'acne', label: 'Acne', icon: '😣' },
  { id: 'cravings', label: 'Cravings', icon: '🍫' },
];

const flowLevels = [
  { id: 'light', label: 'Light', drops: 1 },
  { id: 'medium', label: 'Medium', drops: 2 },
  { id: 'heavy', label: 'Heavy', drops: 3 },
] as const;

const moods = [
  { id: 'good', label: 'Good', icon: Smile, color: 'text-success' },
  { id: 'okay', label: 'Okay', icon: Meh, color: 'text-warning' },
  { id: 'low', label: 'Low', icon: Frown, color: 'text-destructive' },
] as const;

export const DataCollectionPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [flowIntensity, setFlowIntensity] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [mood, setMood] = useState<'good' | 'okay' | 'low'>('okay');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((s) => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSubmit = async () => {
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    setIsSaving(true);
    try {
      const formData: DataCollectionForm = {
        periodStartDate: startDate,
        periodEndDate: endDate,
        symptoms: selectedSymptoms,
        mood,
        flowIntensity,
        notes: notes || undefined,
      };

      const periodData = await cycleService.savePeriodData(formData, user?.id || '');
      dispatch(addPeriodData(periodData));

      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setSelectedSymptoms([]);
      setFlowIntensity('medium');
      setMood('okay');
      setNotes('');

      toast.success('Period data saved successfully!');
    } catch (error) {
      toast.error('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Log Period Data
            </h1>
            <p className="text-muted-foreground">
              Track your cycle to get better predictions
            </p>
          </div>

          <Card className="p-6 border border-border shadow-card space-y-6">
            {/* Date Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Period Dates</Label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                    Start Date *
                  </Label>
                  <Popover open={startOpen} onOpenChange={setStartOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !startDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setStartOpen(false);
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                    End Date (optional)
                  </Label>
                  <Popover open={endOpen} onOpenChange={setEndOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !endDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setEndOpen(false);
                        }}
                        disabled={(date) => date > new Date() || (startDate && date < startDate)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Flow Intensity */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Flow Intensity</Label>
              <div className="grid grid-cols-3 gap-3">
                {flowLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setFlowIntensity(level.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      flowIntensity === level.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex gap-0.5">
                      {[...Array(level.drops)].map((_, i) => (
                        <Droplets
                          key={i}
                          className={cn(
                            'w-4 h-4',
                            flowIntensity === level.id ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        flowIntensity === level.id ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {level.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Symptoms</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all flex items-center gap-2',
                      selectedSymptoms.includes(symptom.id)
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <span>{symptom.icon}</span>
                    <span
                      className={cn(
                        'text-sm font-medium',
                        selectedSymptoms.includes(symptom.id)
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    >
                      {symptom.label}
                    </span>
                    {selectedSymptoms.includes(symptom.id) && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Mood</Label>
              <div className="grid grid-cols-3 gap-3">
                {moods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      mood === m.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <m.icon
                      className={cn(
                        'w-8 h-8',
                        mood === m.id ? m.color : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        mood === m.id ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!startDate || isSaving}
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Period Data'}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};
