"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="flex flex-col items-center gap-6 p-10 w-full max-w-md shadow-lg">
        <h1 className="text-3xl font-bold text-center">Welcome to Collaborative Todo!</h1>
        <p className="text-center text-lg text-muted-foreground">
          Organize, share, and collaborate on tasks with your team.<br />
          Register or login to get started.
        </p>
        <div className="mt-2 flex gap-4">
          {!isLoggedIn ? (
            <Link href="/login">
              <Button size="lg">Login / Register</Button>
            </Link>
          ) : (
            <>
              <Link href="/todos">
                <Button size="lg">Go to My Todos</Button>
              </Link>
              <Button variant="outline" size="lg" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
        {isLoggedIn && userEmail && (
          <div className="mt-6 p-3 bg-gray-100 rounded-lg text-center w-full">
            <strong>Logged in as:</strong> {userEmail}
          </div>
        )}
        <div className="mt-10 text-center text-gray-400 text-sm">
          • Real-time collaboration<br />
          • Assign tasks to your team<br />
          • Progress tracking and analytics
        </div>
      </Card>
    </main>
  );
}
