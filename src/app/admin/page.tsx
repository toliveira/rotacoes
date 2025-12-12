"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseClientAuth } from "@/lib/firebaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Check if already authenticated
  const { user, loading: authLoading, logout } = useAuth({ 
    redirectOnUnauthenticated: false 
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.replace("/admin/home");
      } else {
        // Optional: auto-logout or just stay here showing error
        // logout(); 
        // For now, let's just set error so they see it
      }
    }
  }, [user, router]);
  
  // ... onSubmit ...
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseClientAuth();
      const creds = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await creds.user.getIdToken();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      console.log("data", data);
      if (!res.ok) throw new Error(data?.message || "Server login failed");
      // Force a hard navigation to ensure cookies are sent and TRPC cache is fresh
      window.location.href = "/admin/home";
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-10 max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4 text-red-600">Access Denied</h1>
        <p className="mb-6">You are logged in as <strong>{user.email}</strong>, but you do not have administrator privileges.</p>
        <Button onClick={() => logout()} variant="outline">Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1 text-sm">Email</label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 text-sm">Password</label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            autoComplete="current-password"
          />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
      </form>
    </div>
  );
}
