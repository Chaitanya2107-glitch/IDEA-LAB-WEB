// src/pages/Login.tsx

import React, { useState } from "react";
import { ShieldCheck, ArrowRight, Loader2, Mail, Lock } from "lucide-react";
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
    <div className="min-h-screen bg-white flex">
      {/* ... rest of UI ... */}
      {/* --- Left Column: Form --- */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-12">
        <div className="max-w-[440px] w-full mx-auto">

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              {isSignup ? "Create account" : "Welcome back!"}
            </h1>
            <p className="text-slate-500 font-bold">
              {isSignup ? "Join the innovation hub." : "Don't have an account yet?"}{" "}
              <button onClick={() => setIsSignup(!isSignup)} className="text-brand-600 hover:underline">
                {isSignup ? "Log in instead" : "Sign up now"}
              </button>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 flex items-center gap-3 text-red-600 font-bold text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleEmailAuth} className="space-y-1">
            <AnimatePresence>
              {isSignup && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-bold placeholder:text-slate-300"
                    placeholder="Enter your name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-bold placeholder:text-slate-300"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                {!isSignup && (
                  <button type="button" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/5 outline-none transition-all font-bold placeholder:text-slate-300 pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Lock className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center gap-3 ml-1">
                <input type="checkbox" id="rem" className="w-5 h-5 rounded-lg border-slate-300 text-brand-600 focus:ring-brand-600" />
                <label htmlFor="rem" className="text-sm font-bold text-slate-500">Remember me</label>
              </div>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-brand-700 transition shadow-xl shadow-brand-600/20 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignup ? "Create account" : "Log in")}
            </motion.button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-300 bg-white px-4">Or sign in with</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={startGoogleLogin}
                type="button"
                className="w-full py-4 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                className="w-full py-4 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
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

      {/* --- Right Column: Image --- */}
      <div className="hidden lg:block flex-1 bg-slate-950 relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="img/comp/DSC09532.JPG"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Makerspace Laboratory"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>
    </div>
  );
};

export default Login;
