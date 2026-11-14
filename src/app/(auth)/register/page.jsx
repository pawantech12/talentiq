"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useFieldArray, useForm } from "react-hook-form";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  CircleHelp,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  LockKeyhole,
  Mail,
  Search,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";

export default function RegistrationPage() {
  const [role, setRole] = useState("student");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const {
    control,
    watch,
    setValue,
    getValues,
    handleSubmit: rhfHandleSubmit,
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      education: "",
      skills: [],
      companyName: "",
      recruiterName: "",
      agree: false,
    },
  });
  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkillAt,
  } = useFieldArray({ control, name: "skills" });
  const form = watch();
  const agree = Boolean(form.agree);
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    education: "",
    skills: "",
    companyName: "",
    recruiterName: "",
    agree: "",
  });

  const updateField = (field, value) => {
    setValue(field, value, { shouldDirty: true, shouldValidate: true });
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setServerError("");
  };

  const passwordRules = useMemo(() => {
    return {
      length: form.password.length >= 8,
      uppercase: /[A-Z]/.test(form.password),
      number: /[0-9]/.test(form.password),
    };
  }, [form.password]);

  /*
    ================================================================
    SKILLS
    ================================================================
  */

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      setErrors((previous) => ({
        ...previous,
        skills: "Please enter a skill.",
      }));
      return;
    }

    const currentSkills = getValues("skills") || [];
    const alreadyExists = currentSkills.some(
      (item) => item.value.toLowerCase() === skill.toLowerCase(),
    );

    if (alreadyExists) {
      setErrors((previous) => ({
        ...previous,
        skills: "This skill has already been added.",
      }));
      return;
    }

    appendSkill({ value: skill });

    setSkillInput("");

    setErrors((previous) => ({
      ...previous,
      skills: "",
    }));
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const removeSkill = (index) => {
    removeSkillAt(index);

    setErrors((previous) => ({
      ...previous,
      skills: "",
    }));
  };

  /*
    ================================================================
    VALIDATION
    ================================================================
  */

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      education: "",
      skills: "",
      companyName: "",
      recruiterName: "",
      agree: "",
    };

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const companyName = form.companyName.trim();
    const recruiterName = form.recruiterName.trim();

    /*
      --------------------------------------------------------------
      FULL NAME
      --------------------------------------------------------------
    */

    if (!fullName) {
      newErrors.fullName = "Please enter your full name.";
    } else if (fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters.";
    } else if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(fullName)) {
      newErrors.fullName = "Please enter a valid full name.";
    }

    /*
      --------------------------------------------------------------
      EMAIL
      --------------------------------------------------------------
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
      --------------------------------------------------------------
      PASSWORD
      --------------------------------------------------------------
    */

    if (!form.password) {
      newErrors.password = "Please create a password.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter.";
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = "Password must contain at least one number.";
    }

    /*
      --------------------------------------------------------------
      CONFIRM PASSWORD
      --------------------------------------------------------------
    */

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    /*
      --------------------------------------------------------------
      STUDENT VALIDATION
      --------------------------------------------------------------
    */

    if (role === "student") {
      if (!form.education) {
        newErrors.education = "Please select your education.";
      }

      if (form.skills.length === 0) {
        newErrors.skills = "Please add at least one skill.";
      }
    }

    /*
      --------------------------------------------------------------
      RECRUITER VALIDATION
      --------------------------------------------------------------
    */

    if (role === "recruiter") {
      if (!companyName) {
        newErrors.companyName = "Please enter your company name.";
      } else if (companyName.length < 2) {
        newErrors.companyName = "Company name must be at least 2 characters.";
      }

      if (!recruiterName) {
        newErrors.recruiterName = "Please enter your name.";
      } else if (recruiterName.length < 2) {
        newErrors.recruiterName =
          "Recruiter name must be at least 2 characters.";
      }
    }

    /*
      --------------------------------------------------------------
      TERMS
      --------------------------------------------------------------
    */

    if (!agree) {
      newErrors.agree =
        "Please agree to the Terms of Service and Privacy Policy.";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(Boolean);
  };

  /*
    ================================================================
    SUBMIT
    ================================================================
  */

  const submitRegistration = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    const payload = {
      role,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      education: role === "student" ? form.education : undefined,
      skills:
        role === "student"
          ? (form.skills || []).map((item) => item.value.trim())
          : [],
      companyName: role === "recruiter" ? form.companyName.trim() : undefined,
      recruiterName:
        role === "recruiter" ? form.recruiterName.trim() : undefined,
      agree: Boolean(form.agree),
    };

    setIsSubmitting(true);
    setServerError("");
    try {
      await axios.post("/api/auth/register", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      window.sessionStorage.setItem("resumeai_pending_email", payload.email);
      router.push(`/verify-email?email=${encodeURIComponent(payload.email)}`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "We couldn't start your registration. Please try again.";
      setServerError(message);
      if (error?.response?.data?.field === "email") {
        setErrors((previous) => ({ ...previous, email: message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
    ================================================================
    ROLE CHANGE
    ================================================================
  */

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setServerError("");

    setErrors({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      education: "",
      skills: "",
      companyName: "",
      recruiterName: "",
      agree: "",
    });
  };

  /*
    ================================================================
    ERROR HELPERS
    ================================================================
  */

  const fieldHasError = (field) => Boolean(errors[field]);

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[47.6%_52.4%]">
        {/* ================================================================
            LEFT SIDE
            ================================================================ */}

        <section className="relative bg-white">
          <div className="mx-auto w-full max-w-[685px] px-5 pb-10 pt-4 sm:px-8 lg:px-0">
            <div className="mx-auto w-full max-w-[469px]">
              {/* ==========================================================
                  HEADER
                  ========================================================== */}

              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/logo.png"
                    alt="ResumeAI Logo"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-36 "
                  />
                </div>

                <button
                  type="button"
                  aria-label="Registration help"
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                >
                  <CircleHelp size={17} strokeWidth={1.8} />
                </button>
              </header>

              {/* ==========================================================
                  PAGE TITLE
                  ========================================================== */}

              <div className="mt-7 lg:mt-6">
                <div className="mb-1 flex items-center gap-2 text-[13px] text-[#64748B]">
                  <span className="text-slate-300">›</span>

                  <span>Create your account</span>
                </div>

                <h1 className="text-[27px] font-bold leading-[1.05] tracking-[-0.8px] text-slate-900 sm:text-[30px]">
                  Create your ResumeAI account
                </h1>

                <p className="mt-2 max-w-[470px] text-[14px] leading-[21px] text-slate-500">
                  {role === "student"
                    ? "Join ResumeAI to discover opportunities, showcase your skills, and improve your career readiness."
                    : "Join ResumeAI to post jobs, screen candidates and find the best talent faster."}
                </p>
              </div>

              {/* ==========================================================
                  FORM
                  ========================================================== */}

              <form
                onSubmit={rhfHandleSubmit(submitRegistration)}
                className="mt-7"
                noValidate
              >
                {/* ========================================================
                    ROLE SELECTOR
                    ======================================================== */}

                <div>
                  <p className="mb-3 text-[14px] font-semibold text-slate-900">
                    I am a...
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* STUDENT */}

                    <button
                      type="button"
                      onClick={() => handleRoleChange("student")}
                      className={`relative min-h-[166px] rounded-[11px] border p-3 text-left transition-all sm:p-3.5 ${
                        role === "student"
                          ? "border-[2px] border-indigo-600 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`mb-2 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] ${
                          role === "student"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <GraduationCap size={19} strokeWidth={1.9} />
                      </div>

                      {role === "student" && (
                        <div className="absolute right-3 top-3 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}

                      <h2 className="text-[14px] font-bold text-slate-900">
                        Student
                      </h2>

                      <p className="mt-2 max-w-[185px] text-[12px] leading-[17px] text-slate-500">
                        Find jobs, analyze your resume, take skill assessments
                        and practice AI interviews.
                      </p>
                    </button>

                    {/* RECRUITER */}

                    <button
                      type="button"
                      onClick={() => handleRoleChange("recruiter")}
                      className={`relative min-h-[166px] rounded-[11px] border p-3 text-left transition-all sm:p-3.5 ${
                        role === "recruiter"
                          ? "border-[2px] border-indigo-600 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`mb-2 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] ${
                          role === "recruiter"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <BriefcaseBusiness size={19} strokeWidth={1.9} />
                      </div>

                      {role === "recruiter" && (
                        <div className="absolute right-3 top-3 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-indigo-600 text-white">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}

                      <h2 className="text-[14px] font-bold text-slate-900">
                        Recruiter
                      </h2>

                      <p className="mt-2 max-w-[185px] text-[12px] leading-[17px] text-slate-500">
                        Post jobs, screen candidates, compare scores and
                        shortlist the best candidates.
                      </p>
                    </button>
                  </div>
                </div>

                {/* ========================================================
                    BASIC DETAILS
                    ======================================================== */}

                <div className="mt-6 space-y-4">
                  {/* FULL NAME */}

                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                    >
                      Full Name
                    </label>

                    <div
                      className={`relative flex h-[48px] items-center rounded-[10px] border bg-white transition-all ${
                        fieldHasError("fullName")
                          ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                          : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
                      }`}
                    >
                      <UserRound
                        size={17}
                        strokeWidth={1.7}
                        className={`pointer-events-none absolute left-3.5 ${
                          fieldHasError("fullName")
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      />

                      <input
                        id="fullName"
                        type="text"
                        value={form.fullName}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        aria-invalid={fieldHasError("fullName")}
                        aria-describedby={
                          fieldHasError("fullName")
                            ? "fullName-error"
                            : undefined
                        }
                        onChange={(event) =>
                          updateField("fullName", event.target.value)
                        }
                        className="h-full w-full rounded-[10px] bg-transparent pl-10 pr-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {fieldHasError("fullName") && (
                      <p
                        id="fullName-error"
                        className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500"
                      >
                        <CircleAlert size={13} />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                    >
                      Email Address
                    </label>

                    <div
                      className={`relative flex h-[48px] items-center rounded-[10px] border bg-white transition-all ${
                        fieldHasError("email")
                          ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                          : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
                      }`}
                    >
                      <Mail
                        size={17}
                        strokeWidth={1.7}
                        className={`pointer-events-none absolute left-3.5 ${
                          fieldHasError("email")
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      />

                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={fieldHasError("email")}
                        aria-describedby={
                          fieldHasError("email") ? "email-error" : undefined
                        }
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        className="h-full w-full rounded-[10px] bg-transparent pl-10 pr-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>

                    {fieldHasError("email") && (
                      <p
                        id="email-error"
                        className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500"
                      >
                        <CircleAlert size={13} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                    >
                      Password
                    </label>

                    <div
                      className={`relative flex h-[48px] items-center rounded-[10px] border bg-white transition-all ${
                        fieldHasError("password")
                          ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                          : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
                      }`}
                    >
                      <LockKeyhole
                        size={17}
                        strokeWidth={1.7}
                        className={`pointer-events-none absolute left-3.5 ${
                          fieldHasError("password")
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        aria-invalid={fieldHasError("password")}
                        aria-describedby={
                          fieldHasError("password")
                            ? "password-error"
                            : undefined
                        }
                        onChange={(event) =>
                          updateField("password", event.target.value)
                        }
                        className="h-full w-full rounded-[10px] bg-transparent pl-10 pr-12 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 flex h-8 w-8 items-center justify-center text-slate-400 transition hover:text-slate-600"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} strokeWidth={1.7} />
                        ) : (
                          <Eye size={17} strokeWidth={1.7} />
                        )}
                      </button>
                    </div>

                    {fieldHasError("password") && (
                      <p
                        id="password-error"
                        className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500"
                      >
                        <CircleAlert size={13} />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* STUDENT PASSWORD RULES */}

                  {form.password && (
                    <div className="-mt-1 rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="mb-1.5 text-[12px] font-semibold text-slate-500">
                        Password must contain:
                      </p>

                      {/* 8 CHARACTERS */}

                      <div
                        className={`flex items-center gap-1.5 text-[12px] leading-[18px] ${
                          passwordRules.length
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`flex h-[12px] w-[12px] items-center justify-center rounded-full border ${
                            passwordRules.length
                              ? "border-green-500"
                              : "border-slate-300"
                          }`}
                        >
                          {passwordRules.length && (
                            <Check size={8} strokeWidth={3} />
                          )}
                        </span>

                        <span>At least 8 characters</span>
                      </div>

                      {/* UPPERCASE */}

                      <div
                        className={`flex items-center gap-1.5 text-[12px] leading-[18px] ${
                          passwordRules.uppercase
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`flex h-[12px] w-[12px] items-center justify-center rounded-full border ${
                            passwordRules.uppercase
                              ? "border-green-500"
                              : "border-slate-300"
                          }`}
                        >
                          {passwordRules.uppercase && (
                            <Check size={8} strokeWidth={3} />
                          )}
                        </span>

                        <span>One uppercase letter</span>
                      </div>

                      {/* NUMBER */}

                      <div
                        className={`flex items-center gap-1.5 text-[12px] leading-[18px] ${
                          passwordRules.number
                            ? "text-green-600"
                            : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`flex h-[12px] w-[12px] items-center justify-center rounded-full border ${
                            passwordRules.number
                              ? "border-green-500"
                              : "border-slate-300"
                          }`}
                        >
                          {passwordRules.number && (
                            <Check size={8} strokeWidth={3} />
                          )}
                        </span>

                        <span>One number</span>
                      </div>
                    </div>
                  )}

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                    >
                      Confirm Password
                    </label>

                    <div
                      className={`relative flex h-[48px] items-center rounded-[10px] border bg-white transition-all ${
                        fieldHasError("confirmPassword")
                          ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                          : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
                      }`}
                    >
                      <LockKeyhole
                        size={17}
                        strokeWidth={1.7}
                        className={`pointer-events-none absolute left-3.5 ${
                          fieldHasError("confirmPassword")
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      />

                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        aria-invalid={fieldHasError("confirmPassword")}
                        aria-describedby={
                          fieldHasError("confirmPassword")
                            ? "confirm-password-error"
                            : undefined
                        }
                        onChange={(event) =>
                          updateField("confirmPassword", event.target.value)
                        }
                        className="h-full w-full rounded-[10px] bg-transparent pl-10 pr-12 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        className="absolute right-3 flex h-8 w-8 items-center justify-center text-slate-400 transition hover:text-slate-600"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} strokeWidth={1.7} />
                        ) : (
                          <Eye size={17} strokeWidth={1.7} />
                        )}
                      </button>
                    </div>

                    {fieldHasError("confirmPassword") && (
                      <p
                        id="confirm-password-error"
                        className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500"
                      >
                        <CircleAlert size={13} />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* ========================================================
                    STUDENT PROFILE
                    ======================================================== */}

                {role === "student" && (
                  <div className="mt-6 rounded-[11px] border border-indigo-100 bg-[#F5F3FF] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles
                        size={16}
                        className="text-indigo-600"
                        strokeWidth={1.8}
                      />

                      <span className="text-[13px] font-bold text-indigo-600">
                        Student Profile
                      </span>
                    </div>

                    {/* EDUCATION */}

                    <div>
                      <label
                        htmlFor="education"
                        className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                      >
                        Education
                      </label>

                      <div className="relative">
                        <select
                          id="education"
                          value={form.education}
                          aria-invalid={fieldHasError("education")}
                          aria-describedby={
                            fieldHasError("education")
                              ? "education-error"
                              : undefined
                          }
                          onChange={(event) =>
                            updateField("education", event.target.value)
                          }
                          className={`h-[48px] w-full appearance-none rounded-[10px] border bg-white px-3.5 pr-10 text-[14px] outline-none transition ${
                            fieldHasError("education")
                              ? "border-red-400 text-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                              : form.education
                                ? "border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                : "border-slate-200 text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                          }`}
                        >
                          <option value="">Select your education</option>
                          <option value="B.A.">B.A.</option>
                          <option value="B.Com">B.Com</option>
                          <option value="B.Sc">B.Sc</option>
                          <option value="B.Tech">B.Tech</option>
                          <option value="M.A.">M.A.</option>
                          <option value="M.Com">M.Com</option>
                          <option value="M.Tech">M.Tech</option>
                        </select>

                        <ChevronDown
                          size={17}
                          className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
                            fieldHasError("education")
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        />
                      </div>

                      {fieldHasError("education") && (
                        <p
                          id="education-error"
                          className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500"
                        >
                          <CircleAlert size={13} />
                          {errors.education}
                        </p>
                      )}
                    </div>

                    {/* PRIMARY SKILLS */}

                    <div className="mt-4">
                      <label
                        htmlFor="skill-input"
                        className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                      >
                        Primary Skills
                      </label>

                      <div
                        className={`min-h-[48px] rounded-[10px] border bg-white px-2.5 py-2 transition-all ${
                          fieldHasError("skills")
                            ? "border-red-400"
                            : "border-slate-200"
                        } focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {skillFields.map((skill, index) => (
                            <span
                              key={skill.id}
                              className="inline-flex h-[25px] items-center gap-1 rounded-full bg-indigo-50 px-2.5 text-[11px] font-medium text-indigo-600"
                            >
                              {skill.value}

                              <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                aria-label={`Remove ${skill.value}`}
                                className="text-indigo-400 transition hover:text-indigo-700"
                              >
                                <X size={11} strokeWidth={2} />
                              </button>
                            </span>
                          ))}

                          {/* DIRECT SKILL INPUT */}

                          <input
                            id="skill-input"
                            type="text"
                            value={skillInput}
                            onChange={(event) => {
                              setSkillInput(event.target.value);

                              if (errors.skills) {
                                setErrors((previous) => ({
                                  ...previous,
                                  skills: "",
                                }));
                              }
                            }}
                            onKeyDown={handleSkillKeyDown}
                            placeholder={
                              form.skills.length
                                ? "Add skill..."
                                : "Type a skill..."
                            }
                            aria-describedby={
                              fieldHasError("skills")
                                ? "skills-error"
                                : "skills-help"
                            }
                            className="h-[25px] min-w-[100px] flex-1 bg-transparent px-1 text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </div>

                      <p
                        id="skills-help"
                        className="mt-1.5 text-[11px] text-slate-400"
                      >
                        Type a skill and press Enter to add it.
                      </p>

                      {fieldHasError("skills") && (
                        <p
                          id="skills-error"
                          className="mt-1 flex items-center gap-1.5 text-[12px] text-red-500"
                        >
                          <CircleAlert size={13} />
                          {errors.skills}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================
                    RECRUITER PROFILE
                    ======================================================== */}

                {role === "recruiter" && (
                  <div className="mt-6 rounded-[11px] border border-indigo-200 bg-[#EEF2FF] p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <BriefcaseBusiness
                        size={16}
                        className="text-indigo-600"
                        strokeWidth={1.8}
                      />

                      <span className="text-[13px] font-bold text-indigo-600">
                        Recruiter Profile
                      </span>
                    </div>

                    {/* COMPANY NAME */}

                    <div>
                      <label
                        htmlFor="companyName"
                        className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                      >
                        Company Name
                      </label>

                      <div
                        className={`relative flex h-[48px] items-center rounded-[10px] border bg-white transition-all ${
                          fieldHasError("companyName")
                            ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                            : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
                        }`}
                      >
                        <Building2
                          size={17}
                          strokeWidth={1.7}
                          className={`pointer-events-none absolute left-3.5 ${
                            fieldHasError("companyName")
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        />

                        <input
                          id="companyName"
                          type="text"
                          value={form.companyName}
                          placeholder="Enter company name"
                          autoComplete="organization"
                          aria-invalid={fieldHasError("companyName")}
                          aria-describedby={
                            fieldHasError("companyName")
                              ? "company-error"
                              : undefined
                          }
                          onChange={(event) =>
                            updateField("companyName", event.target.value)
                          }
                          className="h-full w-full rounded-[10px] bg-transparent pl-10 pr-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {fieldHasError("companyName") && (
                        <p
                          id="company-error"
                          className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500"
                        >
                          <CircleAlert size={13} />
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    {/* RECRUITER NAME */}

                    <div className="mt-4">
                      <label
                        htmlFor="recruiterName"
                        className="mb-2 block text-[14px] font-semibold leading-5 text-slate-800"
                      >
                        Recruiter Name
                      </label>

                      <div
                        className={`relative flex h-[48px] items-center rounded-[10px] border bg-white transition-all ${
                          fieldHasError("recruiterName")
                            ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                            : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
                        }`}
                      >
                        <UserRound
                          size={17}
                          strokeWidth={1.7}
                          className={`pointer-events-none absolute left-3.5 ${
                            fieldHasError("recruiterName")
                              ? "text-red-500"
                              : "text-slate-400"
                          }`}
                        />

                        <input
                          id="recruiterName"
                          type="text"
                          value={form.recruiterName}
                          placeholder="Enter recruiter name"
                          autoComplete="name"
                          aria-invalid={fieldHasError("recruiterName")}
                          aria-describedby={
                            fieldHasError("recruiterName")
                              ? "recruiter-name-error"
                              : undefined
                          }
                          onChange={(event) =>
                            updateField("recruiterName", event.target.value)
                          }
                          className="h-full w-full rounded-[10px] bg-transparent pl-10 pr-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {fieldHasError("recruiterName") && (
                        <p
                          id="recruiter-name-error"
                          className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500"
                        >
                          <CircleAlert size={13} />
                          {errors.recruiterName}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================
                    TERMS
                    ======================================================== */}

                <div className="mt-6">
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(event) => {
                        updateField("agree", event.target.checked);

                        setErrors((previous) => ({
                          ...previous,
                          agree: "",
                        }));
                      }}
                      className="sr-only"
                    />

                    <span
                      className={`mt-[1px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition ${
                        errors.agree
                          ? "border-red-400 bg-red-50"
                          : agree
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 bg-white"
                      }`}
                    >
                      {agree && <Check size={13} strokeWidth={3} />}
                    </span>

                    <span className="text-[13px] leading-[19px] text-slate-500">
                      I agree to the Terms of Service and Privacy Policy.
                    </span>
                  </label>

                  {errors.agree && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-red-500">
                      <CircleAlert size={13} />
                      {errors.agree}
                    </p>
                  )}
                </div>

                {/* ========================================================
                    CREATE ACCOUNT
                    ======================================================== */}

                {serverError && (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600"
                  >
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-indigo-600 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(79,70,229,0.18)] transition hover:bg-indigo-700 active:scale-[0.99]"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                  <ArrowRight size={19} strokeWidth={2.2} />
                </button>

                {/* LOGIN */}

                <p className="mt-4 text-center text-[13px] text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* ================================================================
            RIGHT DESKTOP PANEL
            ================================================================ */}

        <aside
          className={`hidden min-h-screen lg:block ${
            role === "student" ? "bg-[#F5F3FF]" : "bg-[#EEF2FF]"
          }`}
        >
          <div className="sticky top-0 flex min-h-screen items-start justify-center px-14 py-16">
            <div className="w-full max-w-[690px]">
              {/* ==========================================================
                  STUDENT DESKTOP PANEL
                  ========================================================== */}

              {role === "student" && (
                <div className="flex flex-col items-center">
                  {/* RESUME CARD */}

                  <div className="w-full max-w-[460px] rounded-[15px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] bg-indigo-50 text-indigo-600">
                        <FileText size={18} strokeWidth={1.8} />
                      </div>

                      <div>
                        <h3 className="text-[14px] font-bold text-slate-800">
                          Resume.pdf
                        </h3>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          Last updated today
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-[11px] font-medium text-slate-500">
                      Detected Skills
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {["React", "JavaScript", "Node.js", "MongoDB"].map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-600"
                          >
                            {skill}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  {/* AI ANALYZING */}

                  <div className="my-8 flex items-center gap-3">
                    <div className="h-px w-[85px] bg-indigo-100" />

                    <div className="rounded-full bg-white px-5 py-2 text-[12px] font-semibold text-indigo-500 shadow-sm">
                      <span className="mr-1.5">✦</span>
                      AI Analyzing...
                    </div>

                    <div className="h-px w-[85px] bg-indigo-100" />
                  </div>

                  {/* AI RESUME ANALYSIS */}

                  <div className="w-full max-w-[460px] rounded-[15px] border-2 border-indigo-600 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={17}
                          className="text-indigo-600"
                          strokeWidth={1.8}
                        />

                        <span className="text-[13px] font-bold text-slate-800">
                          AI Resume Analysis
                        </span>
                      </div>

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-semibold text-indigo-500">
                        Live
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-[100px_1fr] gap-4">
                      <div>
                        <div className="text-[46px] font-bold leading-none text-indigo-600">
                          86%
                        </div>

                        <p className="mt-1 text-center text-[11px] text-slate-500">
                          Match Score
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* SKILLS */}

                        <div>
                          <div className="mb-1 flex justify-between text-[10px]">
                            <span className="text-slate-600">Skills</span>

                            <span className="font-semibold text-indigo-600">
                              85%
                            </span>
                          </div>

                          <div className="h-[5px] overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-[85%] rounded-full bg-indigo-600" />
                          </div>
                        </div>

                        {/* EXPERIENCE */}

                        <div>
                          <div className="mb-1 flex justify-between text-[10px]">
                            <span className="text-slate-600">Experience</span>

                            <span className="font-semibold text-green-500">
                              100%
                            </span>
                          </div>

                          <div className="h-[5px] overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-full rounded-full bg-green-500" />
                          </div>
                        </div>

                        {/* EDUCATION */}

                        <div>
                          <div className="mb-1 flex justify-between text-[10px]">
                            <span className="text-slate-600">Education</span>

                            <span className="font-semibold text-green-500">
                              100%
                            </span>
                          </div>

                          <div className="h-[5px] overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full w-full rounded-full bg-green-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MATCHED SKILLS */}

                    <div className="mt-5">
                      <p className="text-[11px] font-medium text-slate-500">
                        Matched Skills
                      </p>

                      <div className="mt-2 space-y-1.5">
                        {["React", "JavaScript", "Node.js"].map((skill) => (
                          <div
                            key={skill}
                            className="flex items-center gap-2 text-[12px] font-semibold text-slate-800"
                          >
                            <Check
                              size={15}
                              className="text-green-500"
                              strokeWidth={2.5}
                            />

                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* STUDENT HEADING */}

                  <div className="mt-8 text-center">
                    <h2 className="text-[29px] font-bold tracking-[-0.7px] text-slate-900">
                      Build your career with AI
                    </h2>

                    <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-[22px] text-slate-500">
                      Analyze your skills, discover better opportunities and
                      prepare for interviews with personalized AI-powered
                      insights.
                    </p>
                  </div>

                  {/* STUDENT FEATURES */}

                  <div className="mt-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] text-indigo-600">
                        <FileText size={16} />
                      </span>

                      <span className="text-[13px] font-semibold text-slate-800">
                        AI Resume Analysis
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] text-indigo-600">
                        <Target size={16} />
                      </span>

                      <span className="text-[13px] font-semibold text-slate-800">
                        Job Matching
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-green-100 text-green-600">
                        <ClipboardCheck size={16} />
                      </span>

                      <span className="text-[13px] font-semibold text-slate-800">
                        Career Assessment
                      </span>
                    </div>
                  </div>

                  {/* CAREER FOOTER CARD */}

                  <div className="mt-6 w-full max-w-[460px] rounded-[11px] border border-slate-200 bg-white px-5 py-3 text-center">
                    <p className="text-[13px] font-semibold text-slate-800">
                      Your career journey starts here.
                    </p>

                    <p className="mt-0.5 text-[12px] text-slate-400">
                      Create your free ResumeAI account.
                    </p>
                  </div>
                </div>
              )}

              {/* ==========================================================
                  RECRUITER DESKTOP PANEL
                  ========================================================== */}

              {role === "recruiter" && (
                <div>
                  {/* RECRUITER STATS */}

                  <div className="rounded-[15px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] bg-indigo-50 text-indigo-600">
                          <BriefcaseBusiness size={17} />
                        </div>

                        <div>
                          <h3 className="text-[13px] font-bold text-slate-800">
                            Senior Developer Role
                          </h3>

                          <p className="text-[10px] text-slate-400">
                            Posted 2 hours ago
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-semibold text-green-600">
                        Active
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200">
                      <div className="text-center">
                        <p className="text-[23px] font-bold text-slate-900">
                          24
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                          Applicants
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[23px] font-bold text-indigo-600">
                          8
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                          Shortlisted
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-[23px] font-bold text-amber-500">
                          3
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-500">
                          Under Review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CANDIDATE RANKING */}

                  <div className="mt-5 rounded-[15px] border-2 border-indigo-600 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy
                          size={17}
                          className="text-amber-500"
                          strokeWidth={1.8}
                        />

                        <span className="text-[13px] font-bold text-slate-800">
                          Candidate Ranking
                        </span>
                      </div>

                      <span className="rounded-full bg-purple-50 px-3 py-1 text-[10px] font-semibold text-purple-600">
                        ✨ AI Ranked
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {/* RAHUL */}

                      <div className="flex items-center justify-between rounded-[9px] bg-indigo-50 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
                            #1
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-bold text-slate-800">
                              Rahul Sharma
                            </p>

                            <p className="truncate text-[10px] text-slate-400">
                              Full Stack Dev
                            </p>
                          </div>
                        </div>

                        <span className="ml-2 shrink-0 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white">
                          91.2%
                        </span>
                      </div>

                      {/* PRIYA */}

                      <div className="flex items-center justify-between rounded-[9px] bg-slate-50 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-500">
                            #2
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-bold text-slate-800">
                              Priya Mehta
                            </p>

                            <p className="truncate text-[10px] text-slate-400">
                              React Developer
                            </p>
                          </div>
                        </div>

                        <span className="ml-2 shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600">
                          86.5%
                        </span>
                      </div>

                      {/* ARJUN */}

                      <div className="flex items-center justify-between rounded-[9px] bg-slate-50 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-[25px] w-[25px] shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-500">
                            #3
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-bold text-slate-800">
                              Arjun Verma
                            </p>

                            <p className="truncate text-[10px] text-slate-400">
                              Backend Developer
                            </p>
                          </div>
                        </div>

                        <span className="ml-2 shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600">
                          79.8%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RECRUITER HEADING */}

                  <div className="mt-9 text-center">
                    <h2 className="text-[30px] font-bold tracking-[-0.8px] text-slate-900">
                      Find Better Candidates. Faster.
                    </h2>

                    <p className="mx-auto mt-3 max-w-[490px] text-[14px] leading-[22px] text-slate-500">
                      Post jobs, screen applications, compare candidate scores
                      and identify your best applicants using AI-assisted
                      ranking.
                    </p>
                  </div>

                  {/* RECRUITER FEATURES */}

                  <div className="mx-auto mt-5 w-fit space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] text-indigo-600">
                        <Search size={16} />
                      </span>

                      <span className="text-[13px] font-semibold text-slate-800">
                        AI Resume Screening
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] text-indigo-600">
                        <Trophy size={16} />
                      </span>

                      <span className="text-[13px] font-semibold text-slate-800">
                        Candidate Ranking
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-green-100 text-green-600">
                        <UsersRound size={16} />
                      </span>

                      <span className="text-[13px] font-semibold text-slate-800">
                        Smart Shortlisting
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
