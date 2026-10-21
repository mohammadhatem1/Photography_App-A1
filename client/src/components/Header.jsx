import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import AuthModal from "./AuthModal.jsx";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Book a shoot" },
];

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4">
        <a href="#top" className="text-xl font-bold no-underline">
          Mohammad Eltegani
        </a>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-muted no-underline hover:text-accent hover:underline"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {!loading &&
            (user ? (
              <div className="flex items-center gap-3">
                <span className="text-muted">Hi, {user.name}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="cursor-pointer rounded border border-accent px-3 py-1 text-accent hover:bg-accent hover:text-white"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="cursor-pointer rounded bg-accent px-3 py-1 text-white hover:bg-accent-dark"
              >
                Sign in
              </button>
            ))}
        </nav>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </header>
  );
}