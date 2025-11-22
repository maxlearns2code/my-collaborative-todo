"use client";

import { FirebaseError } from "firebase/app";
import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "../../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userCredential: UserCredential;
      if (registerMode) {
        userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, pass);
      }
      await userCredential.user.getIdToken(); // For debugging: remove token display for production
      router.push("/todos");
    } catch (err: unknown) {
      let message = "Authentication failed.";
      if (err instanceof FirebaseError) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 w-full max-w-sm shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">
          {registerMode ? "Register" : "Login"}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
          />
          <Input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading
              ? registerMode
                ? "Registering..."
                : "Logging in..."
              : registerMode
              ? "Register"
              : "Login"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setRegisterMode((m) => !m)}
            className="w-full"
          >
            {registerMode
              ? "Already have an account? Log In"
              : "Don't have an account? Register"}
          </Button>
        </form>
        {error && (
          <div className="text-red-600 text-center text-sm mt-4">{error}</div>
        )}
      </Card>
    </main>
  );
}
