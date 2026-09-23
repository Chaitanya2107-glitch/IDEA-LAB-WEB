// src/pages/OnboardingPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "../../types";
import { supabase } from "../services/supabase";
import { authService } from "../services/api";
import { ChevronRight, ArrowLeft, CheckCircle, Loader2, ChevronDown } from "lucide-react";

interface OnboardingPageProps {
  user: User;
  onComplete: (updated: User) => void;
}

/* ── Data ── */
const DEGREES = ["B.Tech", "M.Tech", "MBA", "PhD", "B.Sc", "M.Sc", "Faculty", "Other"];

const PROGRAMS: Record<string, string[]> = {
  "B.Tech": ["Computer Science & Engineering", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Information Technology", "AI & Machine Learning", "Data Science", "Biotechnology"],
  "M.Tech": ["Computer Science", "VLSI Design", "Structural Engineering", "Power Systems", "Robotics & Automation", "AI & Machine Learning", "Signal Processing"],
  "MBA":    ["Finance", "Marketing", "Operations Management", "Human Resources", "Business Analytics", "Entrepreneurship"],
  "PhD":    ["Computer Science", "Electronics", "Mechanical", "Management Studies", "Physics", "Chemistry"],
  "B.Sc":   ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "Statistics"],
  "M.Sc":   ["Physics", "Chemistry", "Mathematics", "Computer Science", "Data Science"],
  "Faculty":["Computer Science", "Electronics", "Mathematics", "Physics", "Management", "Mechanical"],
  "Other":  ["Not Applicable"],
};

const SEMESTERS = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"];
const NO_SEMESTER_ROLES = ["Faculty", "PhD", "Other"];

/* ── Custom Select ── */
const Select: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}> = ({ label, value, onChange, options, placeholder = "Select an option" }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-white/70 tracking-wide">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white/10 border border-white/20 text-white rounded-2xl px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all cursor-pointer"
      >
        <option value="" disabled className="bg-slate-800 text-slate-300">{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o} className="bg-slate-800 text-white">{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
    </div>
  </div>
);

/* ── Step progress bar ── */
const ProgressBar: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div className="flex gap-2 mb-10">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-white/20">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: i < step ? "100%" : i === step - 1 ? "100%" : "0%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    ))}
  </div>
);

/* ═══════════ MAIN PAGE ═══════════ */
const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [degree, setDegree] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [saving, setSaving] = useState(false);

  const hasSemester = degree && !NO_SEMESTER_ROLES.includes(degree);
  const totalSteps = hasSemester ? 3 : 2;

  const valid = () => {
    if (step === 1) return !!degree;
    if (step === 2) return !!program;
    if (step === 3) return !!semester;
    return true;
  };

  const programs = degree ? PROGRAMS[degree] ?? [] : [];

  const handleNext = () => {
    if (step === 1) { setProgram(""); setDegree(degree); }
    if (step < totalSteps) { setStep(s => s + 1); return; }
    handleFinish();
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await supabase.from("profiles").upsert({
        user_id: user.id,
        degree,
        program,
        semester: hasSemester ? semester : null,
        is_profile_complete: true,
      }, { onConflict: "user_id" });

      await authService.updateProfile({ ...user, degree, program, isProfileComplete: true }).catch(() => {});
    } catch { /* non-fatal */ }

    onComplete({ ...user, degree, program, isProfileComplete: true });
    navigate("/dashboard", { replace: true });
  };

  const stepVariants = {
    enter:  { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit:   { opacity: 0, y: -10 },
  };

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* --- Left Column: Onboarding Form --- */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12">
        <div className="max-w-[480px] w-full mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center lg:text-left"
          >
            <span className="text-xs font-black text-brand-600 uppercase tracking-[0.3em] mb-3 block">Step {step} of {totalSteps}</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              {step === 1 && `Welcome, ${firstName}`}
              {step === 2 && "Specialization"}
              {step === 3 && "Semester Status"}
            </h1>
            <p className="text-slate-500 font-bold">
              {step === 1 && "Start by identifying your academic path."}
              {step === 2 && `Choose your specific major in ${degree}.`}
              {step === 3 && "Help us personalize your dashboard schedule."}
            </p>
          </motion.div>

          {/* Form Area */}
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 shadow-sm">
            <ProgressBar step={step} total={totalSteps} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {step === 1 && (
                  <Select
                    label="Academic Background"
                    value={degree}
                    onChange={setDegree}
                    options={DEGREES}
                    placeholder="Choose your path"
                  />
                )}

                {step === 2 && (
                  <Select
                    label="Departmental Program"
                    value={program}
                    onChange={setProgram}
                    options={programs}
                    placeholder="Choose your program"
                  />
                )}

                {step === 3 && (
                  <Select
                    label="Current Academic Year"
                    value={semester}
                    onChange={setSemester}
                    options={SEMESTERS}
                    placeholder="Select current semester"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-3 mt-10">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="p-4 rounded-2xl border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!valid() || saving}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 disabled:opacity-30"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step < totalSteps ? (
                  <>Next Step <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Finalize Profile</>
                )}
              </motion.button>
            </div>

            <button
              onClick={() => {
                onComplete({ ...user, isProfileComplete: true });
                navigate("/dashboard", { replace: true });
              }}
              className="w-full text-center mt-6 text-xs font-black uppercase tracking-widest text-slate-300 hover:text-brand-600 transition"
            >
              Skip setup for now
            </button>
          </div>
        </div>
      </div>

      {/* --- Right Column: Image --- */}
      <div className="hidden lg:block flex-1 bg-slate-950 relative overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="file:///C:/Users/FRIDAY/.gemini/antigravity/brain/9cf919c2-1a5f-4608-b614-b049e3a0a050/login_side_panel_image_1773395654800.png"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Innovation Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>
    </div>
  );
};

export default OnboardingPage;
