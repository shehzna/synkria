
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PeriodInput {
    start: string;
    end: string;
}

import { Navbar } from "@/components/Navbar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { parseISO } from "date-fns";

export function PredictionPage() {
    const { toast } = useToast();
    const [periods, setPeriods] = useState<PeriodInput[]>([
        { start: "", end: "" },
        { start: "", end: "" },
        { start: "", end: "" },
    ]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ next_start: string; length: number } | null>(null);

    const handleInputChange = (index: number, field: "start" | "end", value: string) => {
        const newPeriods = [...periods];
        newPeriods[index][field] = value;
        setPeriods(newPeriods);
    };

    const handlePredict = async () => {
        // Basic validation
        for (const p of periods) {
            if (!p.start || !p.end) {
                toast({
                    title: "Missing fields",
                    description: "Please fill in all start and end dates.",
                    variant: "destructive",
                });
                return;
            }
        }

        setLoading(true);
        setResult(null);

        try {
            // Get token from local storage
            const storedAuth = localStorage.getItem('synkria_auth');
            let token = null;

            if (storedAuth) {
                try {
                    const parsedAuth = JSON.parse(storedAuth);
                    token = parsedAuth.token;
                } catch (e) {
                    console.error("Failed to parse auth token", e);
                }
            }

            if (!token) {
                toast({
                    title: "Authentication Required",
                    description: "Please log in to use this feature.",
                    variant: "destructive",
                });
                return;
            }

            const response = await fetch("http://localhost:8000/api/predict/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ periods }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Prediction failed");
            }

            setResult({
                next_start: data.next_period_start,
                length: data.predicted_value,
            });

            toast({
                title: "Prediction Successful",
                description: "Your next period has been calculated and saved.",
            });

            if (data.notification) {
                toast({
                    title: "Cycle Alert",
                    description: data.notification.message,
                    variant: "destructive", // highlighting warning
                    duration: 6000,
                });
            }

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto p-6 max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-primary">Cycle Prediction</h1>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Enter Your Last 3 Periods
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm font-medium text-muted-foreground mb-2">
                            <div>Start Date</div>
                            <div>End Date</div>
                        </div>

                        {periods.map((period, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4 items-center">
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={period.start}
                                        onChange={(e) => handleInputChange(index, "start", e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Input
                                        type="date"
                                        value={period.end}
                                        onChange={(e) => handleInputChange(index, "end", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handlePredict} disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing Cycle...
                                </>
                            ) : (
                                <>
                                    Predict Next Cycle <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {result && (
                    <Card className="bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-4">
                        <CardHeader>
                            <CardTitle className="text-primary">Prediction Result</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex justify-between items-center p-4 bg-background rounded-lg border shadow-sm">
                                <span className="text-muted-foreground">Next Period Start</span>
                                <span className="text-xl font-bold">{result.next_start}</span>
                            </div>
                            <div className="flex justify-center p-4 bg-background rounded-lg border shadow-sm">
                                <CalendarComponent
                                    mode="single"
                                    selected={parseISO(result.next_start)}
                                    month={parseISO(result.next_start)}
                                    className="rounded-md border"
                                />
                            </div>
                            <div className="flex justify-between items-center p-4 bg-background rounded-lg border shadow-sm">
                                <span className="text-muted-foreground">Estimated Cycle Gap</span>
                                <span className="text-xl font-bold">{result.length} Days</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
