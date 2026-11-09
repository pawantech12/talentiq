"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setServerError("");
    clearErrors();
  };

  const onSubmit = async (formData) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role,
          rememberMe,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data?.success) {
        const loggedInRole = response.data.user?.role;

        if (loggedInRole === "student") {
          router.replace("/dashboard/student");
        } else if (loggedInRole === "recruiter") {
          router.replace("/dashboard/recruiter");
        } else {
          setServerError("Unable to identify your account type.");
        }
      }
    } catch (error) {
      const response = error.response;
      const message =
        response?.data?.message || "Unable to log in. Please try again.";

      if (response?.data?.field === "role") {
        setServerError(message);
      } else if (response?.data?.code === "EMAIL_NOT_VERIFIED") {
        setError("email", {
          type: "server",
          message,
        });
      } else if (response?.status === 401) {
        setError("password", {
          type: "server",
          message,
        });
      } else {
        setServerError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailHasError = Boolean(errors.email);
  const passwordHasError = Boolean(errors.password);

  return (
    <main className="min-h-screen bg-slate-50 lg:bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[45%_55%]">
        {/* LEFT DESKTOP HERO */}

        <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-[#37319A] via-[#4840D7] to-[#4E45F4] lg:block">
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

        {/* RIGHT LOGIN SECTION */}

        <section className="flex items-start justify-center bg-slate-50 sm:px-8 lg:bg-white px-20 py-[60px] max-sm:px-5 max-sm:py-10">
          <div className="w-full max-w-[420px]">
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

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6" noValidate>
              {/* EMAIL */}

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
                    autoComplete="email"
                    placeholder="Enter your email address"
                    aria-invalid={emailHasError}
                    aria-describedby={emailHasError ? "email-error" : undefined}
                    {...register("email", {
                      required: "Please enter your email address.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email address.",
                      },
                      maxLength: {
                        value: 254,
                        message: "Email address is too long.",
                      },
                    })}
                    className={`h-[50px] w-full rounded-[8px] border pl-11 pr-4 text-[14px] outline-none transition ${
                      emailHasError
                        ? "border-red-400 bg-red-50 text-slate-800 placeholder:text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    }`}
                  />
                </div>

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

                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>

              {/* PASSWORD */}

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
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={passwordHasError}
                    aria-describedby={
                      passwordHasError ? "password-error" : undefined
                    }
                    {...register("password", {
                      required: "Please enter your password.",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters.",
                      },
                      maxLength: {
                        value: 72,
                        message: "Password cannot exceed 72 characters.",
                      },
                    })}
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

                    <span>{errors.password.message}</span>
                  </div>
                )}
              </div>

              {/* SERVER ERROR */}

              {serverError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-[6px] bg-red-100 px-3 py-2.5 text-[12px] leading-5 text-red-600"
                >
                  <CircleAlert size={15} className="mt-0.5 shrink-0" />

                  <span>{serverError}</span>
                </div>
              )}

              {/* REMEMBER / FORGOT */}

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

                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>

              {/* SIGN IN */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[9px] bg-indigo-600 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.20)] transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} strokeWidth={2.2} />
                  </>
                )}
              </button>

              {/* DIVIDER */}

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-[11px] font-medium text-slate-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* GOOGLE */}

              <button
                type="button"
                disabled
                title="Google sign-in is not configured yet."
                className="flex h-[50px] w-full cursor-not-allowed items-center justify-center gap-3 rounded-[8px] border border-slate-200 bg-white text-[14px] font-medium text-slate-400 opacity-70"
              >
                <span className="text-[19px] font-bold leading-none">
                  <span className="text-[#4285F4]">G</span>
                </span>

                <span>Continue with Google</span>
              </button>

              {/* CREATE ACCOUNT */}

              <p className="mt-6 text-center text-[13px] text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Create an account
                </Link>
              </p>

              {/* SECURITY */}

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
