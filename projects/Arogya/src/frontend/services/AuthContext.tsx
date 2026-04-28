import React, { createContext, useContext, useEffect, useReducer } from "react";
import { authStorage } from "./storage";
import { API_BASE_URL } from "./config";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "patient" | "doctor";
}

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: User | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

type AuthAction =
  | {
      type: "RESTORE_TOKEN";
      payload: { token: string | null; user: User | null };
    }
  | { type: "SIGN_IN"; payload: { token: string; user: User } }
  | { type: "SIGN_OUT" }
  | { type: "SIGN_UP"; payload: { token: string; user: User } };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        userToken: action.payload.token,
        user: action.payload.user,
        isLoading: false,
      };
    case "SIGN_IN":
      return {
        ...state,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
      };
    case "SIGN_OUT":
      return {
        ...state,
        isSignout: true,
        userToken: null,
        user: null,
      };
    case "SIGN_UP":
      return {
        ...state,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    isLoading: true,
    isSignout: false,
    userToken: null,
    user: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await authStorage.getToken();
        const user = await authStorage.getUserData();

        dispatch({
          type: "RESTORE_TOKEN",
          payload: { token, user },
        });
      } catch (e) {
        console.error("Failed to restore token:", e);
        dispatch({
          type: "RESTORE_TOKEN",
          payload: { token: null, user: null },
        });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext: AuthContextType = {
    state,
    isAuthenticated: !!state.userToken,

    login: async (username: string, password: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.detail || "Login failed");
        }

        const token = data.token || "";
        const user = data.user;

        await authStorage.setToken(token);
        await authStorage.setUserData(user);

        dispatch({
          type: "SIGN_IN",
          payload: { token, user },
        });
      } catch (error) {
        throw error;
      }
    },

    signup: async (userData: any) => {
      try {
        const response = await fetch(`${API_BASE_URL}/accounts/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            first_name: userData.first_name,
            role: userData.role || "patient",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.detail || "Signup failed");
        }

        const token = data.token || "";
        const user = data.user;

        await authStorage.setToken(token);
        await authStorage.setUserData(user);

        dispatch({
          type: "SIGN_UP",
          payload: { token, user },
        });
      } catch (error) {
        throw error;
      }
    },

    logout: async () => {
      try {
        await authStorage.clearAuthData();
        dispatch({ type: "SIGN_OUT" });
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  };

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
