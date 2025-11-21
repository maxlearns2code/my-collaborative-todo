"use client";

import { FirebaseError } from "firebase/app";
import { UserCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userCredential: UserCredential;
      if (registerMode) {
        // Registration flow
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          pass
        );
      } else {
        // Login flow
        userCredential = await signInWithEmailAndPassword(auth, email, pass);
      }
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
    } catch (err: unknown) {
      let message = "Authentication failed.";
      if (err instanceof FirebaseError) {
        message = err.message;
      }
      setError(message);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24 }}>
      <h2>{registerMode ? "Register" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          type="password"
          placeholder="Password"
          required
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 8 }}
        >
          {loading
            ? registerMode
              ? "Registering..."
              : "Logging in..."
            : registerMode
            ? "Register"
            : "Login"}
        </button>
        <button
          type="button"
          onClick={() => setRegisterMode(!registerMode)}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 8,
            background: "#eee",
            border: "none",
            cursor: "pointer",
          }}
        >
          {registerMode
            ? "Already have an account? Log In"
            : "Don't have an account? Register"}
        </button>
        {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        {token && (
          <div style={{ marginTop: 10, wordBreak: "break-all" }}>
            <strong>ID Token:</strong>
            <br />
            <span>{token}</span>
          </div>
        )}
      </form>
    </div>
  );
}
