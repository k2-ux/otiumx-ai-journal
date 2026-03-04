import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { JournalPage } from "@/features/journal/JournalPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "@/app/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <JournalPage />,
      },
      {
        path: "/reports",
        element: <ReportsPage />,
      },
    ],
  },
]);
