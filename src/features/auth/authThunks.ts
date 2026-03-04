import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppUser } from "@/types/user";

interface ThunkConfig {
  extra: {
    authService: any;
  };
}

// LOGIN
export const loginThunk = createAsyncThunk<
  AppUser,
  { email: string; password: string },
  ThunkConfig
>("auth/login", async ({ email, password }, { extra }) => {
  const user = await extra.authService.login(email, password);

  return {
    uid: user.uid,
    email: user.email,
  };
});

// REGISTER
export const registerThunk = createAsyncThunk<
  AppUser,
  { email: string; password: string },
  ThunkConfig
>("auth/register", async ({ email, password }, { extra }) => {
  const user = await extra.authService.register(email, password);

  return {
    uid: user.uid,
    email: user.email,
  };
});

// LOGOUT
export const logoutThunk = createAsyncThunk<void, void, ThunkConfig>(
  "auth/logout",
  async (_, { extra }) => {
    await extra.authService.logout();
  },
);
