import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
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
    <div className="min-h-screen bg-white flex">
      {/* --- Right Column: Image --- */}
      <div className="hidden lg:block flex-1 bg-slate-950 relative overflow-hidden order-last">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="img/comp/DSC09551.JPG"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Makerspace Management"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 lg:px-12">
        <div className="max-w-[440px] w-full mx-auto">

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              Staff Access Only
            </h1>
            <p className="text-slate-400 font-bold">
              Sign in with your staff credentials to access the laboratory control center.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border p-4 rounded-2xl mb-8 flex items-center gap-3 font-bold text-sm ${
                  error.includes("approval") || error.includes("verified") 
                  ? "bg-amber-50 border-amber-100 text-amber-600" 
                  : "bg-red-50 border-red-100 text-red-600"
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Staff Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-bold placeholder:text-slate-300"
                placeholder="staff@reva.edu.in"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-bold placeholder:text-slate-300 pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Access"}
            </motion.button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-300 bg-white px-4">OR</div>
            </div>

            <button
              onClick={startMicrosoftLogin}
              type="button"
              className="w-full py-4 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[13px] text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
                <rect x="12" y="1" width="10" height="10" fill="#7fbb00"/>
                <rect x="1" y="12" width="10" height="10" fill="#00a1f1"/>
                <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
              </svg>
              Login with Outlook
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
            AICTE IDEA Lab &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
