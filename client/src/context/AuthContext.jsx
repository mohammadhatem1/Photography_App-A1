import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign-in modal state lives here so any component (Header, Gallery) can open it.
  const [authOpen, setAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // On first load (including every refresh) ask the server who is signed in.
  useEffect(() => {
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function openAuth(message = "") {
    setAuthMessage(message);
    setAuthOpen(true);
  }

  function closeAuth() {
    setAuthOpen(false);
    setAuthMessage("");
  }

  async function signup(name, email, password) {
    const data = await api("/auth/signup", { method: "POST", body: { name, email, password } });
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await api("/auth/login", { method: "POST", body: { email, password } });
    setUser(data.user);
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, authOpen, authMessage, openAuth, closeAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}