import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Smile, Meh, Frown } from "lucide-react";
import { useState } from "react";

interface Symptom {
  id: string;
  name: string;
  category: 'physical' | 'emotional' | 'other';
}

const commonSymptoms: Symptom[] = [
  { id: 'cramps', name: 'Cramps', category: 'physical' },
  { id: 'bloating', name: 'Bloating', category: 'physical' },
  { id: 'headache', name: 'Headache', category: 'physical' },
  { id: 'tender-breasts', name: 'Tender Breasts', category: 'physical' },
  { id: 'fatigue', name: 'Fatigue', category: 'physical' },
  { id: 'mood-swings', name: 'Mood Swings', category: 'emotional' },
  { id: 'irritable', name: 'Irritable', category: 'emotional' },
  { id: 'anxious', name: 'Anxious', category: 'emotional' },
];

const moodOptions = [
  { icon: Smile, label: 'Good', value: 'good', color: 'text-green-500' },
  { icon: Meh, label: 'Okay', value: 'okay', color: 'text-yellow-500' },
  { icon: Frown, label: 'Low', value: 'low', color: 'text-red-500' },
];

export const SymptomsCard = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  return (
    <Card className="p-6 border border-border shadow-card">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">How are you feeling today?</h3>
          <p className="text-muted-foreground">Track your symptoms and mood</p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3">Mood</h4>
            <div className="flex gap-3 justify-center">
              {moodOptions.map((mood) => {
                const Icon = mood.icon;
                return (
                  <Button
                    key={mood.value}
                    variant={selectedMood === mood.value ? "default" : "outline"}
                    className={`flex flex-col gap-1 h-auto py-3 px-4 ${
                      selectedMood === mood.value 
                        ? "bg-gradient-primary" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedMood(mood.value)}
                  >
                    <Icon className={`w-6 h-6 ${
                      selectedMood === mood.value ? "text-white" : mood.color
                    }`} />
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-3">Symptoms</h4>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Badge
                  key={symptom.id}
                  variant={selectedSymptoms.includes(symptom.id) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedSymptoms.includes(symptom.id)
                      ? "bg-gradient-primary hover:opacity-90"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => toggleSymptom(symptom.id)}
                >
                  {symptom.name}
                </Badge>
              ))}
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-muted text-muted-foreground"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add custom
              </Badge>
            </div>
          </div>
        </div>

        <Button 
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          disabled={!selectedMood && selectedSymptoms.length === 0}
        >
          Save Today's Data
        </Button>
      </div>
    </Card>
  );
};