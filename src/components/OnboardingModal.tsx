import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "../../types";
import { supabase } from "../services/supabase";
import {
  GraduationCap, BookOpen, Calendar, ChevronRight,
  CheckCircle, Loader2, Sparkles, ArrowLeft
} from "lucide-react";

interface OnboardingModalProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

/* ─── Data ─── */
const DEGREES = [
  { label: "B.Tech",   value: "B.Tech",   icon: "🎓" },
  { label: "M.Tech",   value: "M.Tech",   icon: "📚" },
  { label: "MBA",      value: "MBA",      icon: "💼" },
  { label: "PhD",      value: "PhD",      icon: "🔬" },
  { label: "B.Sc",     value: "B.Sc",     icon: "⚗️" },
  { label: "M.Sc",     value: "M.Sc",     icon: "🧪" },
  { label: "Faculty",  value: "Faculty",  icon: "🏫" },
  { label: "Other",    value: "Other",    icon: "📋" },
];

const PROGRAMS: Record<string, string[]> = {
  "B.Tech": ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "IT", "AI & ML", "Data Science"],
  "M.Tech": ["Computer Science", "VLSI", "Structural", "Power Systems", "Robotics", "AI & ML"],
  "MBA":    ["Finance", "Marketing", "Operations", "HR", "Business Analytics"],
  "PhD":    ["Computer Science", "Electronics", "Mechanical", "Management", "Sciences"],
  "B.Sc":   ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
  "M.Sc":   ["Physics", "Chemistry", "Mathematics", "Computer Science"],
  "Faculty":["Computer Science", "Electronics", "Mathematics", "Physics", "Management"],
  "Other":  ["Other"],
};

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

/* ─── Step indicator ─── */
const StepDots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full transition-all duration-500 ${
          i < current ? "bg-brand-600 w-6" : i === current ? "bg-brand-500 w-8" : "bg-slate-200 w-4"
        }`}
      />
    ))}
  </div>
);

/* ═══════════════ MAIN COMPONENT ═══════════════ */
const OnboardingModal: React.FC<OnboardingModalProps> = ({ user, onComplete }) => {
  const [step, setStep]       = useState(0);
  const [degree, setDegree]   = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState<number | null>(null);
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);

  const programs = degree ? PROGRAMS[degree] ?? [] : [];
  const showSemester = !["Faculty", "PhD", "Other"].includes(degree);

  const totalSteps = showSemester ? 3 : 2;

  const canNext = () => {
    if (step === 0) return !!degree;
    if (step === 1) return !!program;
    if (step === 2) return !!semester;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert into Supabase profiles table
      await supabase.from("profiles").upsert({
        user_id: user.id,
        degree,
        program,
        semester: showSemester ? semester : null,
        is_profile_complete: true,
      }, { onConflict: "user_id" });
    } catch {/* non-fatal, proceed even if Supabase is unavailable */}


    // Mark done locally
    setDone(true);
    setTimeout(() => {
      const updated: User = {
        ...user,
        degree,
        program,
        isProfileComplete: true,
      };
      onComplete(updated);
    }, 1000);
    setSaving(false);
  };

  const next = () => {
    if (step === 0) { setProgram(""); }
    if (!showSemester && step === 1) { handleSave(); return; }
    if (step === totalSteps - 1) { handleSave(); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => Math.max(0, s - 1));

  /* ── Slide animation ── */
  const variants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400 px-8 pt-8 pb-10 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
          
          {done ? (
            <div className="text-center py-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.6 }}
              >
                <CheckCircle className="w-14 h-14 mx-auto mb-3" />
              </motion.div>
              <p className="text-xl font-bold">You're all set, {firstName}!</p>
              <p className="text-white/80 text-sm mt-1">Taking you to your dashboard…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/70 font-medium uppercase tracking-widest">Setup</span>
              </div>
              <h2 className="text-2xl font-bold leading-tight">
                {step === 0 && `Welcome, ${firstName}! 👋`}
                {step === 1 && "Your Program"}
                {step === 2 && "Your Semester"}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {step === 0 && "Let's get your profile ready — it takes 30 seconds."}
                {step === 1 && `What are you studying in ${degree}?`}
                {step === 2 && "Which semester are you in right now?"}
              </p>
            </>
          )}
        </div>

        {/* Body */}
        {!done && (
          <div className="p-6 sm:p-8">
            <StepDots current={step} total={totalSteps} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {/* Step 0 — Degree */}
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {DEGREES.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDegree(d.value)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left font-semibold text-sm transition-all ${
                          degree === d.value
                            ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-100"
                            : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl">{d.icon}</span>
                        <span>{d.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 1 — Program */}
                {step === 1 && (
                  <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {programs.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setProgram(p)}
                        className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 text-sm font-semibold transition-all ${
                          program === p
                            ? "border-brand-500 bg-brand-50 text-brand-700 shadow-sm"
                            : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          {p}
                        </span>
                        {program === p && <CheckCircle className="w-4 h-4 text-brand-500" />}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2 — Semester */}
                {step === 2 && (
                  <div className="grid grid-cols-4 gap-3">
                    {SEMESTERS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSemester(s)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 font-bold text-sm transition-all ${
                          semester === s
                            ? "border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-200"
                            : "border-slate-100 bg-slate-50 text-slate-700 hover:border-brand-300"
                        }`}
                      >
                        <Calendar className="w-4 h-4 mb-0.5 opacity-60" />
                        <span>Sem {s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-8">
              {step > 0 && (
                <button
                  onClick={back}
                  className="p-3 rounded-xl border-2 border-slate-200 text-slate-500 hover:bg-slate-50 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={next}
                disabled={!canNext() || saving}
                className="flex-1 py-3.5 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-200"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : step === totalSteps - 1 ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Finish Setup
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Skip link */}
            <p className="text-center text-xs text-slate-400 mt-4">
              <button
                onClick={() => onComplete({ ...user, isProfileComplete: true })}
                className="hover:text-brand-500 transition"
              >
                Skip for now
              </button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
