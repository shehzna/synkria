import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { notificationService } from '@/services/notificationService';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotificationBanner = () => {
    const { isAuthenticated, token } = useAppSelector((state) => state.auth);
    const [notification, setNotification] = useState<{
        message: string;
        predicted_date: string;
        days_until: number;
        is_imminent: boolean;
    } | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const checkNotification = async () => {
            if (isAuthenticated && token) {
                try {
                    const result = await notificationService.checkImminentPrediction(token);
                    setNotification(result);
                } catch (error) {
                    console.error('Failed to check imminent prediction:', error);
                }
            }
        };

        checkNotification();
    }, [isAuthenticated, token]);

    if (!notification || !notification.is_imminent || isDismissed) {
        return null;
    }

    return (
        <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium text-yellow-800 dark:text-yellow-200">
                                {notification.message}
                            </span>
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">
                                Predicted: {notification.predicted_date}
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDismissed(true)}
                        className="text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
