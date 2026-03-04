import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: Props) => {
  const { user, initialized } = useSelector(selectAuth);

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
