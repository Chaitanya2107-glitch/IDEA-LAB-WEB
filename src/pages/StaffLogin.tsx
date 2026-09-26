import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";
import { authService } from "../services/api";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { StaffUser } from "../../types";

interface StaffLoginProps {
  onLogin?: (staff: StaffUser) => void;
}

const StaffLogin: React.FC<StaffLoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email.trim(), password);
      let staffData: StaffUser | null = null;
      try {
        const syncPromise = authService.loginStaffService(firebaseUser.uid, email.trim());
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Sync timeout")), 8000)
        );
        staffData = await Promise.race([syncPromise, timeout]);
      } catch (e: any) { 
        console.error("Staff sync error:", e);
        setError(e.message || "Failed to synchronize backend profile.");
        setLoading(false);
        return;
      }

      if (staffData) {
        if (onLogin) onLogin(staffData);
        navigate("/staff-dashboard", { replace: true });
      } else {
        setError("Staff record found in Firebase, but profile missing in database.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const startMicrosoftLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: authError } = await authService.signInWithMicrosoft();
      if (authError) throw authError;

      // Note: Redirection happens here. Session restoration in App.tsx.
    } catch (err: any) {
      setError(err.message || "Microsoft Authorization failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Staff Access Only
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sign in with your staff credentials to access the laboratory control center.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                role="alert"
                className={`mb-6 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
                  error.includes("approval") || error.includes("verified")
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="staff-email" className="mb-1.5 block text-sm font-medium text-slate-700">Staff Email</label>
              <input
                id="staff-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="staff@reva.edu.in"
              />
            </div>

            <div>
              <label htmlFor="staff-password" className="mb-1.5 block text-sm font-medium text-slate-700">Security Key</label>
              <div className="relative">
                <input
                  id="staff-password"
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
                  {showPassword ? <Eye className="h-4 w-4" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize Access"}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-500">OR</span>
              </div>
            </div>

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
              Login with Outlook
            </button>
          </form>
        </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            AICTE IDEA Lab &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
