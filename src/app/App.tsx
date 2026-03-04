import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/auth/authSlice";
import { services } from "./providers";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";

export const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = services.authService.observeAuthState((user) => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
          }),
        );
      } else {
        dispatch(setUser(null));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <RouterProvider router={router} />;
};
