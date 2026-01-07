import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cycleReducer from './slices/cycleSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cycle: cycleReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'cycle/addPeriodData', 'cycle/setCycleData'],
        ignoredPaths: ['auth.tokenExpiry', 'cycle.periods', 'cycle.cycleData'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
