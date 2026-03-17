import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface PCODInput {
    age: number;
    bmi: number;
    irregular: number;
    testosterone: number;
    follicles: number;
}

export interface PCODResult {
    prediction: string;
    probability: number;
    risk_level: string;
}

export const predictPCOD = async (data: PCODInput): Promise<PCODResult> => {
    const response = await axios.post(`${API_URL}/predict-pcod/`, data);
    return response.data;
};
