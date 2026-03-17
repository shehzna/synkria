import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { predictPCOD, PCODInput, PCODResult } from '@/services/pcodService';
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';

export const PCODPredictionPage = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<PCODInput>();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PCODResult | null>(null);

    const onSubmit = async (data: PCODInput) => {
        setLoading(true);
        setResult(null);
        try {
            const prediction = await predictPCOD({
                ...data,
                age: Number(data.age),
                bmi: Number(data.bmi),
                testosterone: Number(data.testosterone),
                follicles: Number(data.follicles),
                irregular: Number(data.irregular)
            });
            setResult(prediction);
            toast.success("Prediction complete");
        } catch (error) {
            console.error(error);
            toast.error("Failed to get prediction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container max-w-4xl py-8 space-y-8 animate-fade-in">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">PCOD Risk Assessment</h1>
                    <p className="text-muted-foreground">
                        Enter your health metrics to assess the risk of Polycystic Ovary Syndrome (PCOS/PCOD) using our AI model.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Health Metrics</CardTitle>
                            <CardDescription>Please provide accurate information for the best results.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        placeholder="e.g., 26"
                                        {...register('age', { required: 'Age is required', min: 10, max: 100 })}
                                    />
                                    {errors.age && <span className="text-sm text-destructive">{errors.age.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bmi">BMI (Body Mass Index)</Label>
                                    <Input
                                        id="bmi"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g., 29.5"
                                        {...register('bmi', { required: 'BMI is required', min: 10, max: 50 })}
                                    />
                                    {errors.bmi && <span className="text-sm text-destructive">{errors.bmi.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="irregular">Menstrual Irregularity</Label>
                                    <Select onValueChange={(val) => setValue('irregular', Number(val))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">No (Regular Cycles)</SelectItem>
                                            <SelectItem value="1">Yes (Irregular Cycles)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <input type="hidden" {...register('irregular', { required: 'This field is required' })} />
                                    {errors.irregular && <span className="text-sm text-destructive">{errors.irregular.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="testosterone">Testosterone Level (ng/dL)</Label>
                                    <Input
                                        id="testosterone"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g., 68.2"
                                        {...register('testosterone', { required: 'Testosterone level is required' })}
                                    />
                                    {errors.testosterone && <span className="text-sm text-destructive">{errors.testosterone.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="follicles">Antral Follicle Count</Label>
                                    <Input
                                        id="follicles"
                                        type="number"
                                        placeholder="e.g., 18"
                                        {...register('follicles', { required: 'Follicle count is required' })}
                                    />
                                    {errors.follicles && <span className="text-sm text-destructive">{errors.follicles.message}</span>}
                                </div>

                                <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : 'Analyze Risk'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="h-full border-2 border-dashed border-muted bg-muted/20 flex flex-col justify-center items-center p-6 text-center">
                            {!result ? (
                                <div className="text-muted-foreground">
                                    <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-medium mb-2">Ready to Analyze</h3>
                                    <p>Fill out the form to see your AI-generated PCOD risk assessment.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 w-full animate-in zoom-in-95 duration-300">
                                    <div className={`p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center ${result.prediction === 'Positive' ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-600'}`}>
                                        {result.prediction === 'Positive' ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle className="w-10 h-10" />}
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold">{result.prediction === 'Positive' ? 'Potential Risk Detected' : 'Low Risk Detected'}</h2>
                                        <p className="text-muted-foreground">Based on your metrics, the model predicts a <strong>{result.prediction}</strong> result.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                        <div className="p-4 bg-background rounded-lg border border-border">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Probability</p>
                                            <p className="text-2xl font-bold text-primary">{result.probability}%</p>
                                        </div>
                                        <div className="p-4 bg-background rounded-lg border border-border">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Level</p>
                                            <p className={`text-2xl font-bold ${result.risk_level === 'High Risk' ? 'text-destructive' : result.risk_level === 'Medium Risk' ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {result.risk_level}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground pt-4">
                                        * This AI tool is for informational purposes only and is not a substitute for professional medical advice.
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
