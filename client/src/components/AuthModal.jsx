import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const fieldClass =
  "w-full rounded border border-line bg-white p-3 text-ink";

export default function AuthModal({ onClose }) {
  const { signup, login, authMessage } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "signup") await signup(name, email, password);
      else await login(email, password);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="w-full max-w-sm rounded bg-paper p-6 shadow-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="auth-title" className="text-2xl font-bold">
            {mode === "signup" ? "Create account" : "Sign in"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer text-2xl text-muted">
            &times;
          </button>
        </div>

        {authMessage && <p className="mb-4 text-muted">{authMessage}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div className="flex flex-col gap-1">
              <label htmlFor="auth-name" className="font-bold">Name</label>
              <input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} required className={fieldClass} />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label htmlFor="auth-email" className="font-bold">Email</label>
            <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="auth-password" className="font-bold">Password</label>
            <input id="auth-password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className={fieldClass} />
          </div>

          {error && <p role="alert" className="text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="cursor-pointer rounded bg-accent px-6 py-3 font-bold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? "Please wait..." : mode === "signup" ? "Sign up" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-muted">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }}
            className="cursor-pointer text-accent underline"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}