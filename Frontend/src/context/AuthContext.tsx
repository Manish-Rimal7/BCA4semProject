import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { API_BASE_URL as API_URL } from "@/config/api";

export type User = {
  id: string;
  name?: string;
  username?: string;
  mail: string;
  address?: string;
  age?: number;
  role?: string;
};

type AuthValue = {
  user: User | null;
  ready: boolean;
  login: (mail: string, password: string) => Promise<void>;
  register: (
    username: string,
    address: string,
    age: number,
    mail: string,
    password: string,
  ) => Promise<void>;
  updateUser: (updatedUser: User) => void;
  toggleAdminRole: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);
const STORAGE_KEY = "Re-Nest.user";
const TOKEN_KEY = "Re-Nest.token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const syncUserFromBackend = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    try {
      // 1. Try /getMe
      let res = await fetch(`${API_URL}/getMe`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = await res.json().catch(() => null);

      let freshUser = null;
      if (res.ok && data?.responseData?.user) {
        freshUser = data.responseData.user;
      } else {
        // 2. Fallback to /dashboard/dashboard which returns { user, ... }
        res = await fetch(`${API_URL}/dashboard/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await res.json().catch(() => null);
        if (res.ok && data?.responseData?.user) {
          freshUser = data.responseData.user;
        }
      }

      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshUser));
      } else if (res && (res.status === 401 || res.status === 404)) {
        persist(null);
      }
    } catch (err) {
      console.warn("Could not sync user profile:", err);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore */
    }

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      syncUserFromBackend().finally(() => setReady(true));
    } else {
      setReady(true);
    }

    const handleFocus = () => {
      syncUserFromBackend();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, []);

  const persist = (next: User | null, token?: string) => {
    setUser(next);
    if (next && token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      login: async (mail: string, password: string) => {
        let response: Response;
        let data: any;
        try {
          response = await fetch(`${API_URL}/userLogin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mail, password }),
          });
          data = await response.json();
        } catch (error) {
          console.error("Network error during login", error);
          throw new Error("Network error during login. Please try again.");
        }

        console.log("Login API Response:", data);

        const isSuccess = response.ok && (data.responseCode === 200 || data.responseCode === 201 || !data.responseCode);
        if (isSuccess) {
          const resData = data.responseData || data;
          const loggedInUser = resData.user || resData.existingUser || resData;
          const token = resData.token;
          persist(loggedInUser, token);
        } else {
          const errorMessage =
            data.responseMessage ||
            data.message ||
            data.msg ||
            "Invalid credentials or login failed";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      },
      register: async (
        username: string,
        address: string,
        age: number,
        mail: string,
        password: string,
      ) => {
        let response: Response;
        let data: any;
        try {
          response = await fetch(`${API_URL}/userRegister`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, address, age, mail, password }),
          });
          data = await response.json();
        } catch (error) {
          console.error("Network error during registration", error);
          throw new Error("Network error during registration. Please try again.");
        }

        const isSuccess = response.ok && (data.responseCode === 200 || data.responseCode === 201 || !data.responseCode);
        if (!isSuccess) {
          let errorMessage = data.responseMessage || data.message || data.msg;
          if (errorMessage === "validation error") {
            errorMessage =
              "Validation error: Display name must contain only letters, and password must be at least 8 characters with at least one uppercase letter.";
          }
          errorMessage = errorMessage || "Registration failed";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      },
      updateUser: (updatedUser: User) => {
        setUser((prev) => {
          const next = { ...(prev || {}), ...updatedUser } as User;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
      toggleAdminRole: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) throw new Error("Not authenticated");
        const response = await fetch(`${API_URL}/toggleAdminRole`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.responseData?.user) {
          const updated = data.responseData.user;
          setUser(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } else {
          throw new Error(data.responseMessage || "Failed to update role");
        }
      },
      logout: () => persist(null),
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
