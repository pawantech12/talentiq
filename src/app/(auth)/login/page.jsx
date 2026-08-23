"use client";

import { useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  CircleAlert,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Field-specific errors
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Clear only the error for the field being edited
    if (errors[field]) {
      setErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);

    // Clear validation errors when changing role
    setErrors({
      email: "",
      password: "",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const email = form.email.trim();
    const password = form.password.trim();

    const newErrors = {
      email: "",
      password: "",
    };

    /*
      ------------------------------------------------------------
      EMAIL VALIDATION
      ------------------------------------------------------------
    */

    if (!email) {
      newErrors.email = "Please enter your email address.";
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    /*
      ------------------------------------------------------------
      PASSWORD VALIDATION
      ------------------------------------------------------------
    */

    if (!password) {
      newErrors.password = "Please enter your password.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    /*
      ------------------------------------------------------------
      SET VALIDATION ERRORS
      ------------------------------------------------------------
    */

    setErrors(newErrors);

    // Stop submission if there are validation errors
    if (newErrors.email || newErrors.password) {
      return;
    }

    /*
      ------------------------------------------------------------
      AUTHENTICATION / API
      ------------------------------------------------------------

      Replace this section with your actual login API.

      Example:

      const response = await loginUser({
        role,
        email,
        password,
        rememberMe,
      });

      if (!response.success) {
        setErrors({
          email: "",
          password: "Invalid email or password. Please try again.",
        });
        return;
      }

      // Redirect to student/recruiter dashboard
    */

    console.log({
      role,
      email,
      password,
      rememberMe,
    });
  };

  const emailHasError = Boolean(errors.email);
  const passwordHasError = Boolean(errors.password);

  return (
    <main className="min-h-screen bg-slate-50 lg:bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[45%_55%]">
        {/* ================================================================
            LEFT DESKTOP HERO
            ================================================================ */}

        <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#37319A] via-[#4840D7] to-[#4E45F4] lg:block">
          {/* Decorative circles */}

          <div className="absolute -left-[80px] -top-[85px] h-[260px] w-[260px] rounded-full bg-white/[0.06]" />

          <div className="absolute -bottom-[100px] right-[-50px] h-[270px] w-[270px] rounded-full bg-white/[0.035]" />

          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[648px] flex-col px-12 py-12">
            {/* LOGO */}

            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ResumeAI Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="w-36 rounded-lg"
              />
            </div>

            {/* HERO TITLE */}

            <div className="mt-10">
              <h2 className="max-w-[500px] text-[40px] font-bold leading-[1.08] tracking-[-1.2px] text-white">
                Smarter Hiring.
                <br />
                Better Careers.
              </h2>

              <p className="mt-4 max-w-[510px] text-[15px] leading-[24px] text-indigo-100">
                AI-powered resume screening, candidate ranking, skill assessment
                and interview preparation — all in one platform.
              </p>
            </div>

            {/* CANDIDATE AI CARD */}

            <div className="mt-9 rounded-[17px] bg-white p-5 shadow-[0_20px_45px_rgba(22,18,100,0.25)]">
              {/* Candidate header */}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-[13px] font-bold text-purple-600">
                    RS
                  </div>

                  <div>
                    <p className="text-[13px] font-bold text-slate-800">
                      Rahul Sharma
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Full Stack Developer
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1.5 text-[11px] font-bold text-green-600">
                  86% Match
                </span>
              </div>

              {/* AI completed strip */}

              <div className="mt-4 flex items-center justify-between rounded-[8px] bg-purple-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={14}
                    className="text-purple-600"
                    strokeWidth={2}
                  />

                  <span className="text-[11px] font-medium text-purple-600">
                    AI Analysis complete — 3 key skills matched
                  </span>
                </div>

                <span className="h-2 w-2 rounded-full bg-purple-500" />
              </div>

              {/* Skills */}

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Skills Matched
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600">
                    <CheckCircle2 size={11} />
                    React
                  </span>

                  <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600">
                    <CheckCircle2 size={11} />
                    Node.js
                  </span>

                  <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-indigo-600">
                    <CheckCircle2 size={11} />
                    MongoDB
                  </span>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                    Python
                  </span>
                </div>
              </div>

              {/* Match score */}

              <div className="mt-4 flex items-center gap-3">
                <span className="shrink-0 text-[11px] text-slate-500">
                  Match Score
                </span>

                <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[86%] rounded-full bg-indigo-600" />
                </div>

                <span className="text-[11px] font-bold text-green-600">
                  86%
                </span>
              </div>
            </div>

            {/* FEATURE LIST */}

            <div className="mt-9 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-[27px] w-[27px] items-center justify-center rounded-[6px] border border-white/30 bg-white/15">
                  <Sparkles size={14} className="text-white" />
                </div>

                <div className="h-[7px] w-[7px] rounded-full bg-emerald-400" />

                <span className="text-[14px] font-medium text-white">
                  AI Resume Analysis
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-[7px] w-[7px] rounded-full bg-emerald-400" />

                <span className="text-[14px] font-medium text-white">
                  Smart Candidate Ranking
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-[7px] w-[7px] rounded-full bg-emerald-400" />

                <span className="text-[14px] font-medium text-white">
                  Personalized Interview Preparation
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            RIGHT LOGIN SECTION
            ================================================================ */}

        <section className="flex items-start justify-center bg-slate-50  sm:px-8 lg:bg-white px-20 py-[60px] max-sm:px-5 max-sm:py-10">
          <div className="w-full max-w-[420px] ">
            {/* MOBILE LOGO */}

            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Image
                src="/logo.png"
                alt="ResumeAI Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="w-36 rounded-lg"
              />
            </div>

            {/* TITLE */}

            <div>
              <h2 className="text-[26px] font-bold leading-tight tracking-[-0.8px] text-slate-900 lg:text-[30px]">
                Welcome back
              </h2>

              <p className="mt-1.5 text-[15px] leading-[21px] text-slate-500">
                Sign in to your ResumeAI account.
              </p>
            </div>

            {/* ROLE TABS */}

            <div className="mt-5 grid h-[48px] grid-cols-2 rounded-[8px] border border-slate-200 bg-slate-50 p-[3px]">
              <button
                type="button"
                onClick={() => handleRoleChange("student")}
                className={`rounded-[6px] text-[14px] font-semibold transition-all ${
                  role === "student"
                    ? "bg-indigo-600 text-white shadow-[0_2px_5px_rgba(79,70,229,0.25)]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("recruiter")}
                className={`rounded-[6px] text-[14px] font-medium transition-all ${
                  role === "recruiter"
                    ? "bg-indigo-600 font-semibold text-white shadow-[0_2px_5px_rgba(79,70,229,0.25)]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Recruiter
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="mt-6">
              {/* ============================================================
                  EMAIL
                  ============================================================ */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[13px] font-semibold text-slate-900"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={1.7}
                    className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                      emailHasError ? "text-red-500" : "text-slate-400"
                    }`}
                  />

                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="Enter your email address"
                    aria-invalid={emailHasError}
                    aria-describedby={emailHasError ? "email-error" : undefined}
                    className={`h-[50px] w-full rounded-[8px] border pl-11 pr-4 text-[14px] outline-none transition ${
                      emailHasError
                        ? "border-red-400 bg-red-50 text-slate-800 placeholder:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                </div>

                {/* EMAIL ERROR */}

                {emailHasError && (
                  <div
                    id="email-error"
                    className="mt-1.5 flex min-h-[36px] items-center gap-2 rounded-[5px] bg-red-100 px-3 py-2 text-[12px] text-red-500"
                  >
                    <CircleAlert
                      size={14}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* ============================================================
                  PASSWORD
                  ============================================================ */}

              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="mb-2 block text-[13px] font-semibold text-slate-900"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.7}
                    className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
                      passwordHasError ? "text-red-500" : "text-slate-400"
                    }`}
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Enter your password"
                    aria-invalid={passwordHasError}
                    aria-describedby={
                      passwordHasError ? "password-error" : undefined
                    }
                    className={`h-[50px] w-full rounded-[8px] border pl-11 pr-12 text-[14px] outline-none transition ${
                      passwordHasError
                        ? "border-red-400 bg-red-50 text-slate-800 placeholder:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.7} />
                    ) : (
                      <Eye size={18} strokeWidth={1.7} />
                    )}
                  </button>
                </div>

                {/* PASSWORD ERROR */}

                {passwordHasError && (
                  <div
                    id="password-error"
                    className="mt-1.5 flex min-h-[36px] items-center gap-2 rounded-[5px] bg-red-100 px-3 py-2 text-[12px] text-red-500"
                  >
                    <CircleAlert
                      size={14}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* ============================================================
                  REMEMBER / FORGOT
                  ============================================================ */}

              <div className="mt-4 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="peer sr-only"
                  />

                  <span
                    className={`flex h-[16px] w-[16px] items-center justify-center rounded-[3px] border transition ${
                      rememberMe
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {rememberMe && <CheckCircle2 size={13} strokeWidth={3} />}
                  </span>

                  <span className="text-[13px] text-slate-500">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              </div>

              {/* ============================================================
                  SIGN IN
                  ============================================================ */}

              <button
                type="submit"
                className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[9px] bg-indigo-600 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.20)] transition hover:bg-indigo-700 active:scale-[0.99]"
              >
                Sign In
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>

              {/* ============================================================
                  DIVIDER
                  ============================================================ */}

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[11px] font-medium text-slate-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* ============================================================
                  GOOGLE
                  ============================================================ */}

              <button
                type="button"
                className="flex h-[50px] w-full items-center justify-center gap-3 rounded-[8px] border border-slate-200 bg-white text-[14px] font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <span className="text-[19px] font-bold leading-none">
                  <span className="text-[#4285F4]">G</span>
                </span>

                <span>Continue with Google</span>
              </button>

              {/* ============================================================
                  CREATE ACCOUNT
                  ============================================================ */}

              <p className="mt-6 text-center text-[13px] text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Create an account
                </Link>
              </p>

              {/* ============================================================
                  SECURITY
                  ============================================================ */}

              <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-slate-500">
                <ShieldCheck size={14} strokeWidth={1.7} />

                <span>Your information is securely protected.</span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
