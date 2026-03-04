import { configureStore } from "@reduxjs/toolkit";
import { services } from "@/app/providers";

import authReducer from "@/features/auth/authSlice";
import journalReducer from "@/features/journal/journalSlice";
import reportReducer from "@/features/reports/reportSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    journal: journalReducer,
    reports: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: services,
      },
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
