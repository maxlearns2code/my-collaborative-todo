"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setUserEmail(user ? user.email : null);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    setIsLoggedIn(false);
    setUserEmail(null);
  };

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", padding: 24 }}>
      <h1>Welcome to Collaborative Todo!</h1>
      <p>
        Organize, share, and collaborate on tasks with your team. Register or login to get started.
      </p>
      <div style={{ marginTop: 32 }}>
        {!isLoggedIn ? (
          <Link href="/login">
            <button className="btn">Login / Register</button>
          </Link>
        ) : (
          <>
            <Link href="/todos">
              <button className="btn">Go to My Todos</button>
            </Link>
            <button
              onClick={handleLogout}
              className="btn"
            >
              Logout
            </button>
          </>
        )}
      </div>
      {isLoggedIn && userEmail && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#f8f8ff",
            borderRadius: 8,
            fontSize: 16,
            color: "#333",
          }}
        >
          <strong>Logged in as:</strong> {userEmail}
        </div>
      )}
    </main>
  );
}
