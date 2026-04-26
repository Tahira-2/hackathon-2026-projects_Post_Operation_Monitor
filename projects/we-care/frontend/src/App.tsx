import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { getDoctorProfile, RESET_PASSWORD_TOKEN_KEY } from "./lib/auth-api";
import { router } from "./routes";
import { useAuthStore } from "./stores/authStore";
import { useProfileStore } from "./stores/profileStore";

export default function App() {
  useEffect(() => {
    const { token, setToken, setDoctor, setInitialized, clearAuth } =
      useAuthStore.getState();
    const { hydrateFromDoctor, resetProfile } = useProfileStore.getState();

    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", ""),
    );
    const hashToken = hashParams.get("access_token");
    const hashType = hashParams.get("type");

    if (hashToken && hashType === "recovery") {
      sessionStorage.setItem(RESET_PASSWORD_TOKEN_KEY, hashToken);
      clearAuth();
      resetProfile();
      window.history.replaceState({}, "", "/reset-password");
      return;
    }

    if (!token) {
      setInitialized();
      return;
    }

    setToken(token);

    getDoctorProfile()
      .then((doctor) => {
        setDoctor(doctor);
        hydrateFromDoctor(doctor);
        setInitialized();
      })
      .catch(() => {
        clearAuth();
        resetProfile();
      });
  }, []);

  return <RouterProvider router={router} />;
}
