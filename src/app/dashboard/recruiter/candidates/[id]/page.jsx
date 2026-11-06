"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  School,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

export default function CandidateDetailsPage() {
  const [candidateStatus, setCandidateStatus] = useState("Shortlisted");
  const [toast, setToast] = useState("");
  const [showResume, setShowResume] = useState(false);

  const candidate = {
    name: "Rahul Sharma",
    initials: "RS",
    role: "Full Stack Developer",
    experience: "2 Years Experience",
    location: "Mumbai, Maharashtra",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    appliedDate: "14 Aug 2026",

    aiMatch: 89,
    skillsMatch: 94,
    experienceMatch: 85,
    educationMatch: 90,

    assessmentScore: 84,

    skills: [
      {
        name: "JavaScript",
        required: true,
      },
      {
        name: "React",
        required: true,
      },
      {
        name: "Next.js",
        required: true,
      },
      {
        name: "Node.js",
        required: true,
      },
      {
        name: "Express.js",
        required: false,
      },
      {
        name: "MongoDB",
        required: true,
      },
      {
        name: "REST APIs",
        required: false,
      },
      {
        name: "Git",
        required: false,
      },
    ],

    experienceHistory: [
      {
        title: "Full Stack Developer",
        company: "TechNova Solutions",
        duration: "2024 – Present",
        period: "2 Years",
        description:
          "Developed web applications using React, Node.js and MongoDB. Worked on REST APIs and frontend integrations.",
      },
    ],

    education: [
      {
        degree: "Master of Computer Applications",
        field: "Computer Science",
        duration: "2024 – 2026",
        current: true,
      },
      {
        degree: "Bachelor of Science in Computer Science",
        field: "Computer Science",
        duration: "2021 – 2024",
        current: false,
      },
    ],

    assessment: [
      {
        name: "JavaScript",
        score: 88,
      },
      {
        name: "React",
        score: 86,
      },
      {
        name: "Node.js",
        score: 82,
      },
      {
        name: "MongoDB",
        score: 80,
      },
    ],
  };

  const showToast = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const handleShortlist = () => {
    setCandidateStatus("Shortlisted");
    showToast("Candidate shortlisted successfully.");
  };

  const handleReject = () => {
    setCandidateStatus("Rejected");
    showToast("Candidate rejected.");
  };

  const handleDownloadResume = () => {
    const resumeContent = `
Rahul Sharma
Full Stack Developer

Email: rahul.sharma@example.com
Phone: +91 98765 43210
Location: Mumbai, Maharashtra

EXPERIENCE
Full Stack Developer
TechNova Solutions
2024 – Present

Developed web applications using React, Node.js and MongoDB.
Worked on REST APIs and frontend integrations.

EDUCATION
Master of Computer Applications
Computer Science
2024 – 2026

Bachelor of Science in Computer Science
Computer Science
2021 – 2024

SKILLS
JavaScript, React, Next.js, Node.js, Express.js,
MongoDB, REST APIs, Git
`;

    const blob = new Blob([resumeContent], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "Rahul_Sharma_Resume.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    showToast("Resume download started.");
  };

  const handleViewResume = () => {
    setShowResume(true);
  };

  const handleAssessmentResult = () => {
    showToast("Opening assessment result...");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[100] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4f46e5]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Resume Modal */}
      {showResume && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#172033]">
                  Rahul_Sharma_Resume.pdf
                </h2>
                <p className="mt-0.5 text-xs text-[#71809a]">
                  Uploaded · 14 Aug 2026
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResume(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-8">
              <div className="mx-auto max-w-xl">
                <div className="mb-7">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Rahul Sharma
                  </h1>
                  <p className="mt-1 text-sm font-medium text-[#4f46e5]">
                    Full Stack Developer
                  </p>
                </div>

                <div className="mb-7 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    rahul.sharma@example.com
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    +91 98765 43210
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Mumbai, Maharashtra
                  </div>
                </div>

                <div className="mb-7">
                  <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold text-gray-900">
                    Skills
                  </h3>

                  <p className="text-sm leading-6 text-gray-600">
                    JavaScript, React, Next.js, Node.js, Express.js, MongoDB,
                    REST APIs and Git.
                  </p>
                </div>

                <div className="mb-7">
                  <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold text-gray-900">
                    Experience
                  </h3>

                  <p className="text-sm font-semibold text-gray-900">
                    Full Stack Developer
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    TechNova Solutions · 2024 – Present
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Developed web applications using React, Node.js and MongoDB.
                    Worked on REST APIs and frontend integrations.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-bold text-gray-900">
                    Education
                  </h3>

                  <p className="text-sm font-semibold text-gray-900">
                    Master of Computer Applications
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Computer Science · 2024 – 2026
                  </p>

                  <p className="mt-4 text-sm font-semibold text-gray-900">
                    Bachelor of Science in Computer Science
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Computer Science · 2021 – 2024
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowResume(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleDownloadResume}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4338ca]"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content only — no sidebar/header */}
      <main className="mx-auto w-full px-4 py-5 sm:px-6  lg:py-6">
        {/* Breadcrumb / Back */}
        <div className="mb-4">
          <div className="hidden items-center gap-2 text-xs text-[#71809a] lg:flex">
            <button
              type="button"
              onClick={() => showToast("Returning to applicants...")}
              className="transition hover:text-[#4f46e5]"
            >
              Jobs
            </button>

            <ChevronRight className="h-3.5 w-3.5" />

            <button
              type="button"
              onClick={() => showToast("Opening Full Stack Developer...")}
              className="transition hover:text-[#4f46e5]"
            >
              Full Stack Developer
            </button>

            <ChevronRight className="h-3.5 w-3.5" />

            <button
              type="button"
              onClick={() => showToast("Opening applicants...")}
              className="transition hover:text-[#4f46e5]"
            >
              Applicants
            </button>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="font-semibold text-[#4f46e5]">Rahul Sharma</span>
          </div>

          <button
            type="button"
            onClick={() => showToast("Returning to applicants...")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4f46e5] transition hover:text-[#4338ca] lg:mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applicants
          </button>

          <h1 className="mt-1 text-xl font-bold tracking-[-0.02em] text-[#172033] lg:hidden">
            Candidate Details
          </h1>
        </div>

        {/* Candidate Header Card */}
        <section className="rounded-xl border border-[#dce3ee] bg-white px-4 py-4 sm:px-5 lg:px-5 lg:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Candidate info */}
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5046e5] text-lg font-semibold text-white sm:h-14 sm:w-14">
                {candidate.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-[-0.02em] text-[#172033] sm:text-xl">
                    {candidate.name}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      candidateStatus === "Rejected"
                        ? "bg-red-50 text-red-600"
                        : "bg-[#dcfce7] text-[#16a34a]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        candidateStatus === "Rejected"
                          ? "bg-red-500"
                          : "bg-[#22c55e]"
                      }`}
                    />
                    {candidateStatus}
                  </span>
                </div>

                <p className="mt-0.5 text-sm font-medium text-[#4f46e5]">
                  {candidate.role}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#71809a]">
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {candidate.experience}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {candidate.location}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {candidate.email}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {candidate.phone}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Applied {candidate.appliedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={handleDownloadResume}
                className="inline-flex items-center gap-2 rounded-lg border border-[#dce3ee] bg-white px-4 py-2.5 text-sm font-medium text-[#52617a] transition hover:bg-[#f8fafc]"
              >
                <Download className="h-4 w-4" />
                Download Resume
              </button>

              <button
                type="button"
                onClick={handleReject}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                  candidateStatus === "Rejected"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-[#ff4d5a] bg-white text-[#ff3b45] hover:bg-red-50"
                }`}
              >
                <X className="hidden h-4 w-4" />
                Reject
              </button>

              <button
                type="button"
                onClick={handleShortlist}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5046e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#453bd4]"
              >
                <Check className="h-4 w-4" />
                Shortlisted
              </button>
            </div>
          </div>

          {/* Mobile actions */}
          <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2 border-t border-[#edf0f5] pt-4 lg:hidden">
            <button
              type="button"
              onClick={handleShortlist}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#5046e5] px-3 text-sm font-semibold text-white transition hover:bg-[#453bd4]"
            >
              <Check className="h-4 w-4" />
              Shortlisted
            </button>

            <button
              type="button"
              onClick={handleReject}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#ff4d5a] bg-white px-4 text-sm font-medium text-[#ff3b45] transition hover:bg-red-50"
            >
              Reject
            </button>

            <button
              type="button"
              onClick={handleDownloadResume}
              aria-label="Download resume"
              className="flex min-h-10 w-11 items-center justify-center rounded-lg border border-[#dce3ee] bg-white text-[#52617a] transition hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* AI Candidate Match */}
        <section className="mt-4 rounded-xl border border-[#d9d2ff] bg-[#f5f3ff] px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_335px] lg:items-center">
            {/* Match title */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ede9fe]">
                <Sparkles className="h-[18px] w-[18px] text-[#7c3aed]" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  AI Candidate Match
                </h2>

                <p className="mt-0.5 text-[11px] font-medium text-[#7c3aed]">
                  Powered by ResumeAI Resume Screening
                </p>
              </div>
            </div>

            {/* Score + metrics */}
            <div className="grid grid-cols-[auto_1fr] items-center gap-5 lg:grid-cols-[78px_1fr]">
              <div className="text-center lg:text-right">
                <div className="text-4xl font-bold leading-none tracking-[-0.04em] text-[#5046e5]">
                  {candidate.aiMatch}%
                </div>

                <span className="mt-1 inline-flex rounded-full bg-[#5046e5] px-2.5 py-1 text-[10px] font-semibold text-white">
                  Strong Match
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Skills */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[#52617a]">
                    <span>
                      Skills Match
                      <span className="font-bold text-[#5046e5]">
                        {candidate.skillsMatch}%
                      </span>
                    </span>
                  </div>

                  <div className="h-[5px] overflow-hidden rounded-full bg-[#dcd7ff]">
                    <div
                      className="h-full rounded-full bg-[#5046e5]"
                      style={{
                        width: `${candidate.skillsMatch}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[#52617a]">
                    <span>
                      Experience Match
                      <span className="font-bold text-[#5046e5]">
                        {candidate.experienceMatch}%
                      </span>
                    </span>
                  </div>

                  <div className="h-[5px] overflow-hidden rounded-full bg-[#dcd7ff]">
                    <div
                      className="h-full rounded-full bg-[#5046e5]"
                      style={{
                        width: `${candidate.experienceMatch}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[#52617a]">
                    <span>
                      Education Match
                      <span className="font-bold text-[#5046e5]">
                        {candidate.educationMatch}%
                      </span>
                    </span>
                  </div>

                  <div className="h-[5px] overflow-hidden rounded-full bg-[#dcd7ff]">
                    <div
                      className="h-full rounded-full bg-[#5046e5]"
                      style={{
                        width: `${candidate.educationMatch}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why candidate matches */}
          <div className="mt-4 border-t border-[#d9d2ff] pt-4">
            <h3 className="text-xs font-bold text-[#172033]">
              Why this candidate matches
            </h3>

            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-2 text-xs text-[#52617a]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                  <Check className="h-2.5 w-2.5 text-[#16a34a]" />
                </span>
                <span>Strong React and Node.js experience</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#52617a]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                  <Check className="h-2.5 w-2.5 text-[#16a34a]" />
                </span>
                <span>Required JavaScript and MongoDB skills found</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#52617a]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                  <Check className="h-2.5 w-2.5 text-[#16a34a]" />
                </span>
                <span>Relevant 2 years of development experience</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-[#52617a]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                  <Check className="h-2.5 w-2.5 text-[#16a34a]" />
                </span>
                <span>Education requirement matched</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main two-column content */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_365px]">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Skills */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Skills
                </h2>

                <p className="mt-1 text-xs text-[#71809a]">
                  Skills extracted from the candidate&apos;s resume.
                </p>
              </div>

              <div className="pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#71809a]">
                    Required Skills
                  </span>

                  <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-medium text-[#4f46e5]">
                    Job Requirement
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                        skill.required
                          ? "bg-[#eef2ff] text-[#4f46e5]"
                          : "bg-[#f1f5f9] text-[#52617a]"
                      }`}
                    >
                      {skill.required && (
                        <span className="h-1 w-1 rounded-full bg-[#4f46e5]" />
                      )}
                      {skill.name}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-[#71809a]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5]" />
                    Required
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
                    Additional
                  </span>
                </div>
              </div>
            </section>

            {/* Experience */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Experience
                </h2>
              </div>

              <div className="pt-4">
                {candidate.experienceHistory.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="relative flex gap-3"
                  >
                    {/* Timeline */}
                    <div className="relative flex w-4 shrink-0 justify-center">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#5046e5]" />

                      {index !== candidate.experienceHistory.length - 1 && (
                        <span className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-[#dce3ee]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pb-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-sm font-bold text-[#172033]">
                          {item.title}
                        </h3>

                        <span className="w-fit rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold text-[#4f46e5]">
                          {item.period}
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#52617a]">
                        <Building2 className="h-3.5 w-3.5" />
                        {item.company}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71809a]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {item.duration}
                      </p>

                      <p className="mt-1.5 max-w-3xl text-xs leading-5 text-[#52617a]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Education
                </h2>
              </div>

              <div className="divide-y divide-[#edf0f5]">
                {candidate.education.map((item, index) => (
                  <div
                    key={`${item.degree}-${index}`}
                    className="flex gap-3 py-4 first:pt-4 last:pb-1"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        item.current ? "bg-[#eef2ff]" : "bg-[#f1f5f9]"
                      }`}
                    >
                      <GraduationCap
                        className={`h-[18px] w-[18px] ${
                          item.current ? "text-[#4f46e5]" : "text-[#64748b]"
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#172033]">
                        {item.degree}
                      </h3>

                      <p className="mt-0.5 text-xs text-[#52617a]">
                        {item.field}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71809a]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {item.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Assessment */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Job-Specific Skill Assessment
                </h2>

                <span className="shrink-0 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-semibold text-[#16a34a]">
                  Completed
                </span>
              </div>

              <div className="mt-3 flex items-center gap-4 rounded-lg border border-[#dce3ee] bg-[#f8fafc] p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-base font-bold text-[#5046e5]">
                  {candidate.assessmentScore}%
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#172033]">
                    Assessment Score
                  </p>

                  <p className="mt-1 text-xs text-[#71809a]">
                    Job-specific skill evaluation completed
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                {candidate.assessment.map((item) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[#52617a]">
                      <span>{item.name}</span>

                      <span className="font-bold text-[#4f46e5]">
                        {item.score}%
                      </span>
                    </div>

                    <div className="h-[5px] overflow-hidden rounded-full bg-[#dce3ee]">
                      <div
                        className="relative h-full rounded-full bg-[#dce3ee]"
                        style={{
                          width: "100%",
                        }}
                      >
                        <span
                          className="absolute left-0 top-0 h-full rounded-full bg-[#5046e5]"
                          style={{
                            width: `${item.score}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAssessmentResult}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#5046e5] bg-white px-4 py-2.5 text-xs font-semibold text-[#5046e5] transition hover:bg-[#f5f3ff]"
              >
                <ArrowUpRight className="h-4 w-4" />
                View Assessment Result
              </button>
            </section>

            {/* Resume */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Resume
                </h2>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#dce3ee] bg-[#f8fafc] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fee2e2]">
                  <FileText className="h-5 w-5 text-[#ef4444]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#172033]">
                    Rahul_Sharma_Resume.pdf
                  </p>

                  <p className="mt-1 text-[10px] text-[#71809a]">
                    <span className="font-semibold text-[#ef4444]">PDF</span>
                    <span className="mx-1">·</span>
                    Uploaded · 14 Aug 2026
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleViewResume}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5046e5] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#453bd4]"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Resume
                </button>

                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#dce3ee] bg-white px-3 py-2.5 text-xs font-semibold text-[#52617a] transition hover:bg-[#f8fafc]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </section>

            {/* Application Summary */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Application Summary
                </h2>
              </div>

              <div className="mt-2 divide-y divide-[#edf0f5]">
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Applied For</span>

                  <span className="text-right text-xs font-semibold text-[#172033]">
                    Full Stack Developer
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Applied</span>

                  <span className="text-right text-xs font-semibold text-[#172033]">
                    14 Aug 2026
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">AI Match</span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4f46e5]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5046e5]" />
                    89% Strong Match
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Assessment</span>

                  <span className="text-xs font-semibold text-[#172033]">
                    84%
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Status</span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      candidateStatus === "Rejected"
                        ? "bg-red-50 text-red-600"
                        : "bg-[#dcfce7] text-[#16a34a]"
                    }`}
                  >
                    {candidateStatus}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
