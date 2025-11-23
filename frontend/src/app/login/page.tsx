"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FirebaseError } from "firebase/app";
import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "../../lib/firebase";

// ---- EMAIL VALIDATION FUNCTION ----
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ---- EMAIL VALIDATION PRIOR TO SUBMIT ----
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      let userCredential: UserCredential;
      if (registerMode) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          pass
        );
        await updateProfile(userCredential.user, {
          displayName: name,
          photoURL: avatarUrl,
        });
        await userCredential.user.getIdToken(true);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, pass);
      }
      router.push("/todos");
    } catch (err: unknown) {
      let message = "Authentication failed.";
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case "auth/invalid-email":
            message = "Invalid email address. Please check and try again.";
            break;
          case "auth/email-already-in-use":
            message =
              "This email is already registered. Try logging in instead.";
            break;
          case "auth/weak-password":
            message = "Password should be at least 6 characters.";
            break;
          case "auth/user-not-found":
            message = "No account found for this email.";
            break;
          case "auth/wrong-password":
            message = "Incorrect password.";
            break;
          default:
            message = err.message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 w-full max-w-sm shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">
          {registerMode ? "Register" : "Login"}
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
          />

          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            type="password"
            placeholder="Password"
            required
          />

          {registerMode && (
            <>
              <Label htmlFor="register-name">Full name</Label>
              <Input
                id="register-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Full name"
                required
              />
              <Label htmlFor="register-avatar">Avatar URL (optional)</Label>
              <Input
                id="register-avatar"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                type="text"
                placeholder="Avatar URL (optional)"
              />
            </>
          )}
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
