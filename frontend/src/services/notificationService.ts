const API_BASE_URL = "http://127.0.0.1:8000";

interface NotificationData {
    message: string;
    type: string;
    days_until: number;
    predicted_date: string;
    is_imminent: boolean;
}

interface NotificationResponse {
    notification: NotificationData | null;
}

export const notificationService = {
    async checkImminentPrediction(token: string): Promise<NotificationData | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/check-imminent-prediction/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error("Failed to check imminent prediction");
            }

            const data: NotificationResponse = await response.json();
            return data.notification;
        } catch (error) {
            console.error("Error checking imminent prediction:", error);
            return null;
        }
    },

    shouldShowNotificationToday(): boolean {
        const lastShown = localStorage.getItem('last_notification_date');
        const today = new Date().toDateString();

        // Always show if not shown today
        return lastShown !== today;
    },

    markNotificationShown(): void {
        const today = new Date().toDateString();
        localStorage.setItem('last_notification_date', today);
    }
};
