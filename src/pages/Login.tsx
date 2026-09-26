// src/pages/Login.tsx

import React, { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { User } from "../../types";
import { auth } from "../services/firebase";
import { supabase } from "../services/supabase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
} from "firebase/auth";
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ... (auth handlers remain same for logic, but UI will change)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let firebaseUser;
      if (isSignup) {
        if (!name) throw new Error("Name is required");
        const res = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = res.user;
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = res.user;
      }
      
      const user = await authService.syncUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: isSignup ? name : firebaseUser.displayName || "User",
        avatar: firebaseUser.photoURL,
        role: "USER"
      });

      onLogin(user);
      navigate(isSignup && !user.isProfileComplete ? "/onboarding" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const startGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      // Note: The redirection will happen here. 
      // Session restoration will be handled in App.tsx on return.
    } catch (err: any) {
      setError(err.message || "Google Login failed.");
      setLoading(false);
    }
  };

  const startMicrosoftLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email',
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Microsoft Login failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isSignup ? "Create account" : "Welcome back!"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isSignup ? "Join the innovation hub." : "Don't have an account yet?"}{" "}
              <button onClick={() => setIsSignup(!isSignup)} className="font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline underline-offset-4">
                {isSignup ? "Log in instead" : "Sign up now"}
              </button>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="alert"
                className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence>
              {isSignup && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                  <label htmlFor="login-name" className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    id="login-name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Enter your name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">Password</label>
                {!isSignup && (
                  <button type="button" className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 hover:underline underline-offset-4">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:text-slate-700"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rem" className="h-4 w-4 accent-brand-600" />
                <label htmlFor="rem" className="text-sm text-slate-700">Remember me</label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isSignup ? "Create account" : "Log in")}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-500">Or sign in with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startGoogleLogin}
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>

              <button
                onClick={startMicrosoftLogin}
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden="true">
                  <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
                  <rect x="12" y="1" width="10" height="10" fill="#7fbb00"/>
                  <rect x="1" y="12" width="10" height="10" fill="#00a1f1"/>
                  <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
                </svg>
                Outlook
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
