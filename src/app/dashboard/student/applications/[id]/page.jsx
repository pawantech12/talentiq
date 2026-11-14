"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Download,
  Eye,
  FileText,
  MapPin,
  Play,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const jobId = params?.id || "1";

  const application = {
    id: jobId,
    initials: "AT",
    title: "Full Stack Developer",
    company: "ABC Technologies",
    location: "Mumbai",
    employmentType: "Full-time",
    experience: "1–3 Years",
    employment: "Full-time",
    appliedDate: "12 Aug 2026",
    appId: "APP-2026-00124",
    status: "Shortlisted",

    resumeMatch: 86,
    assessment: 82,
    overallCompatibility: 89,

    requiredSkills: ["React", "JavaScript", "Node.js", "MongoDB"],

    progress: [
      {
        title: "Applied",
        date: "12 Aug 2026",
        completed: true,
      },
      {
        title: "AI Analysis",
        date: "12 Aug 2026",
        completed: true,
      },
      {
        title: "Skill Assessment",
        date: "12 Aug 2026",
        completed: true,
      },
      {
        title: "App Reviewed",
        date: "13 Aug 2026",
        completed: true,
      },
      {
        title: "Shortlisted",
        date: "13 Aug 2026",
        completed: true,
        active: true,
      },
    ],

    scoreBreakdown: [
      {
        label: "Skill Match",
        value: 85,
        color: "bg-[#5146e5]",
        textColor: "text-[#5146e5]",
      },
      {
        label: "Semantic Match",
        value: 80,
        color: "bg-[#5146e5]",
        textColor: "text-[#5146e5]",
      },
      {
        label: "Experience Match",
        value: 100,
        color: "bg-[#16a34a]",
        textColor: "text-[#16a34a]",
      },
      {
        label: "Education Match",
        value: 100,
        color: "bg-[#16a34a]",
        textColor: "text-[#16a34a]",
      },
      {
        label: "Profile Relevance",
        value: 80,
        color: "bg-[#5146e5]",
        textColor: "text-[#5146e5]",
      },
    ],

    matchedSkills: ["React", "JavaScript", "Node.js", "MongoDB"],

    skillGaps: ["Express.js"],

    feedback:
      "Your profile is a strong match for this role. You performed particularly well in React and JavaScript, demonstrating solid frontend capabilities. Consider improving your Express.js and MongoDB concepts to strengthen your backend skills and become a more well-rounded Full Stack Developer.",
  };

  const goToJob = () => {
    router.push(`/dashboard/student/jobs/${jobId}`);
  };

  const goToResume = () => {
    router.push("/dashboard/student/resume");
  };

  const goToAssessmentResult = () => {
    router.push(`/dashboard/student/jobs/${jobId}/assessment/result`);
  };

  const goToInterview = () => {
    router.push("/dashboard/student/interview");
  };

  const goToJobs = () => {
    router.push("/dashboard/student/jobs");
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1 overflow-hidden whitespace-nowrap text-[10px] text-[#7b8ba3] sm:text-[11px] lg:mb-4 lg:text-[12px]">
          <button
            type="button"
            onClick={() => router.push("/dashboard/student/applications")}
            className="transition hover:text-indigo-600"
          >
            My Applications
          </button>

          <ChevronRight size={12} strokeWidth={1.5} className="shrink-0" />

          <button
            type="button"
            onClick={goToJob}
            className="transition hover:text-indigo-600"
          >
            Full Stack Developer
          </button>

          <ChevronRight size={12} strokeWidth={1.5} className="shrink-0" />

          <span className="font-medium text-[#5146e5]">
            Application Details
          </span>
        </div>

        {/* Top Job Summary */}
        <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:px-5 lg:py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[9px] bg-indigo-50 text-[13px] font-bold text-[#5146e5] sm:h-11 sm:w-11 lg:h-12 lg:w-12 lg:text-[15px]">
                {application.initials}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[16px] font-bold leading-5 text-[#172033] sm:text-[18px] lg:text-[20px]">
                    {application.title}
                  </h1>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-semibold text-emerald-700 sm:text-[13px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {application.status}
                  </span>
                </div>

                <p className="mt-0.5 text-xs font-medium text-[#475569] sm:text-sm">
                  {application.company}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] sm:text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} strokeWidth={1.6} />
                    {application.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <BriefcaseBusiness size={11} strokeWidth={1.6} />
                    {application.employmentType}
                  </span>

                  <span className="hidden items-center gap-1 sm:flex">
                    App ID:{" "}
                    <span className="text-[#475569] font-medium">
                      {application.appId}
                    </span>
                  </span>

                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} strokeWidth={1.6} />
                    Applied {application.appliedDate}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={goToJob}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] px-4 text-[11px] font-semibold text-white transition hover:bg-[#453bcf] sm:w-auto sm:text-[12px]"
            >
              <Eye size={14} strokeWidth={1.8} />
              View Job
            </button>
          </div>
        </section>

        {/* Application Progress */}
        <section className="mt-2.5 rounded-[10px] border border-[#dce4ef] bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:mt-3 sm:p-4 lg:mt-4 lg:px-5 lg:py-4">
          <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px] lg:text-[14px]">
            Application Progress
          </h2>

          <div className="relative mt-4 lg:mt-5">
            {/* Desktop connecting line */}
            <div className="absolute left-[10%] right-[10%] top-[11px] hidden h-[2px] bg-[#16a34a] lg:block" />

            <div className="grid grid-cols-1 gap-2 lg:grid-cols-5 lg:gap-0">
              {application.progress.map((step, index) => (
                <div
                  key={step.title}
                  className="relative flex items-start gap-2.5 lg:flex-col lg:items-center lg:text-center"
                >
                  <div
                    className={`relative z-10 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full ${
                      step.active
                        ? "bg-[#5146e5] text-white"
                        : "bg-[#16a34a] text-white"
                    }`}
                  >
                    <Check size={12} strokeWidth={2.5} />
                  </div>

                  <div className="min-w-0 lg:mt-1.5">
                    <div
                      className={`text-[10px] font-semibold leading-3 sm:text-[11px] ${
                        step.active ? "text-[#5146e5]" : "text-[#16a34a]"
                      }`}
                    >
                      {step.title}
                    </div>

                    <div className="text-[9px] leading-3 text-[#8291a7] sm:text-[10px]">
                      {step.date}
                    </div>
                  </div>

                  {/* Mobile connecting line */}
                  {index < application.progress.length - 1 && (
                    <div className="absolute left-[9px] top-[20px] h-[18px] w-[2px] bg-[#16a34a] lg:hidden" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_285px] lg:gap-4">
          {/* LEFT COLUMN */}
          <div className="min-w-0 space-y-3">
            {/* Job Information */}
            <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <BriefcaseBusiness size={14} strokeWidth={1.7} />
                </div>

                <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                  Job Information
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-[#e7edf4] pb-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-5">
                <div>
                  <p className="text-[9px] text-[#94a3b8] sm:text-[10px]">
                    Job Title
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {application.title}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-[#94a3b8] sm:text-[10px]">
                    Company
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {application.company}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-[#94a3b8] sm:text-[10px]">
                    Location
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {application.location}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-[#94a3b8] sm:text-[10px]">
                    Employment Type
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {application.employmentType}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-[#94a3b8] sm:text-[10px]">
                    Experience
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {application.experience}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] text-[#94a3b8] sm:text-[10px]">
                    Employment
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {application.employment}
                  </p>
                </div>
              </div>

              <div className="pt-3">
                <p className="mb-2 text-[9px] text-[#94a3b8] sm:text-[10px]">
                  Required Skills
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {application.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-[5px] bg-indigo-50 px-2 py-1 text-[9px] font-medium text-[#5146e5] sm:text-[10px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* AI Resume Analysis */}
            <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-violet-50 text-[#7c3aed]">
                    <Sparkles size={14} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                      AI Resume Analysis
                    </h2>

                    <p className="text-[8px] text-[#7c3aed] sm:text-[9px]">
                      Powered by ResumeAI
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
                  Strong Match
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center lg:gap-7">
                {/* Match Circle */}
                <div className="relative mx-auto h-[76px] w-[76px] shrink-0 sm:mx-0">
                  <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="#eef2ff"
                      strokeWidth="7"
                    />

                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="#5146e5"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${
                        (application.resumeMatch / 100) * 201
                      } 201`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[14px] font-bold text-[#172033]">
                      {application.resumeMatch}%
                    </span>

                    <span className="text-[8px] text-[#71829a]">Match</span>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-[10px] font-semibold text-[#172033]">
                    Score Breakdown
                  </h3>

                  <div className="space-y-2">
                    {application.scoreBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[9px] text-[#71829a] sm:text-[10px]">
                            {item.label}
                          </span>

                          <span
                            className={`text-[9px] font-semibold sm:text-[10px] ${item.textColor}`}
                          >
                            {item.value}%
                          </span>
                        </div>

                        <div className="h-[4px] overflow-hidden rounded-full bg-[#eef2ff]">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{
                              width: `${item.value}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="my-4 h-px bg-[#e7edf4]" />

              {/* Matched Skills / Gaps */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-[#172033]">
                    <CircleCheck size={13} className="text-emerald-500" />
                    Matched Skills
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {application.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-[6px] bg-emerald-100 px-2.5 py-1 text-[9px] font-medium text-emerald-700"
                      >
                        <Check size={9} strokeWidth={2.5} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold text-[#172033]">
                    <span className="text-amber-500">⚠</span>
                    Skill Gaps
                  </div>

                  <div className="rounded-[8px] border border-amber-400 bg-amber-50 p-2.5">
                    {application.skillGaps.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-1 text-[9px] font-semibold text-amber-700"
                      >
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-amber-500 text-[8px]">
                          !
                        </span>
                        {skill}
                      </div>
                    ))}

                    <p className="mt-1 text-[8px] leading-3 text-amber-700">
                      This skill was not clearly identified in your resume.
                      Consider adding relevant experience.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="min-w-0 space-y-3">
            {/* Submitted Resume */}
            <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <FileText size={14} strokeWidth={1.7} />
                </div>

                <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                  Submitted Resume
                </h2>
              </div>

              <div className="flex items-center gap-2 rounded-[8px] border border-[#dce4ef] bg-[#f8fafc] p-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-red-100 text-red-500">
                  <FileText size={15} strokeWidth={1.7} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-semibold text-[#334155]">
                    ResumeAI_Resume_Rahul.pdf
                  </p>

                  <p className="text-[8px] text-[#94a3b8]">
                    PDF &nbsp; Uploaded 12 Aug 2026
                  </p>
                </div>

                <button
                  type="button"
                  onClick={goToResume}
                  className="text-[#7b8ba3] transition hover:text-indigo-600"
                  aria-label="Download resume"
                >
                  <Download size={14} strokeWidth={1.6} />
                </button>
              </div>

              <button
                type="button"
                onClick={goToResume}
                className="mt-2.5 flex h-8 w-full items-center justify-center gap-2 rounded-[7px] border border-[#dce4ef] bg-white text-[10px] font-semibold text-[#5146e5] transition hover:bg-indigo-50"
              >
                <Eye size={13} strokeWidth={1.7} />
                View Resume
              </button>
            </section>

            {/* Application Summary */}
            <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <TrendingUp size={14} strokeWidth={1.7} />
                </div>

                <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                  Application Summary
                </h2>
              </div>

              <div className="divide-y divide-[#e7edf4]">
                <div className="flex items-center justify-between py-2 first:pt-0">
                  <span className="text-[9px] text-[#71829a]">Status</span>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-medium text-emerald-600">
                    {application.status}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-[9px] text-[#71829a]">
                    Resume Match
                  </span>

                  <span className="text-[10px] font-semibold text-[#5146e5]">
                    {application.resumeMatch}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-[9px] text-[#71829a]">Assessment</span>

                  <span className="text-[10px] font-semibold text-[#5146e5]">
                    {application.assessment}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-[9px] text-[#71829a]">
                    Overall Compatibility
                  </span>

                  <span className="text-[10px] font-semibold text-emerald-600">
                    {application.overallCompatibility}%
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 pb-0">
                  <span className="text-[9px] text-[#71829a]">Applied</span>

                  <span className="text-[9px] font-semibold text-[#334155]">
                    {application.appliedDate}
                  </span>
                </div>
              </div>
            </section>

            {/* Skill Assessment */}
            <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                    <CheckCircle2 size={14} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                    Skill Assessment
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
                  Completed
                </span>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <div className="relative h-[64px] w-[64px]">
                  <svg viewBox="0 0 70 70" className="h-full w-full -rotate-90">
                    <circle
                      cx="35"
                      cy="35"
                      r="27"
                      fill="none"
                      stroke="#eef2ff"
                      strokeWidth="6"
                    />

                    <circle
                      cx="35"
                      cy="35"
                      r="27"
                      fill="none"
                      stroke="#5146e5"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${
                        (application.assessment / 100) * 169.6
                      } 169.6`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[13px] font-bold text-[#172033]">
                      {application.assessment}%
                    </span>

                    <span className="text-[7px] text-[#71829a]">Score</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 text-center">
                <div>
                  <p className="text-[14px] font-bold text-[#172033]">8 / 10</p>
                  <p className="text-[8px] text-[#94a3b8]">Correct</p>
                </div>

                <div>
                  <p className="text-[14px] font-bold text-amber-500">11 min</p>
                  <p className="text-[8px] text-[#94a3b8]">Time Taken</p>
                </div>
              </div>

              <button
                type="button"
                onClick={goToAssessmentResult}
                className="mt-3 flex h-8 w-full items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] text-[10px] font-semibold text-white transition hover:bg-[#453bcf]"
              >
                <TrendingUp size={12} strokeWidth={1.8} />
                View Assessment Result
              </button>
            </section>

            {/* Overall Compatibility */}
            <section className="rounded-[10px] border border-[#5146e5] bg-white p-3.5 shadow-[0_2px_5px_rgba(79,70,229,0.08)] sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                    <Target size={14} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                    Overall Job Compatibility
                  </h2>
                </div>

                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-semibold text-emerald-600">
                  Strong Match
                </span>
              </div>

              <div className="mt-4 flex justify-center">
                <div className="relative h-[68px] w-[68px]">
                  <svg viewBox="0 0 74 74" className="h-full w-full -rotate-90">
                    <circle
                      cx="37"
                      cy="37"
                      r="29"
                      fill="none"
                      stroke="#dcfce7"
                      strokeWidth="6"
                    />

                    <circle
                      cx="37"
                      cy="37"
                      r="29"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${
                        (application.overallCompatibility / 100) * 182.2
                      } 182.2`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[14px] font-bold text-[#172033]">
                      {application.overallCompatibility}%
                    </span>

                    <span className="text-[7px] text-[#71829a]">Overall</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[8px] text-[#71829a]">
                      <FileText size={10} />
                      Resume Match
                    </span>

                    <span className="text-[9px] font-semibold text-[#5146e5]">
                      {application.resumeMatch}%
                    </span>
                  </div>

                  <div className="h-[4px] overflow-hidden rounded-full bg-[#eef2ff]">
                    <div
                      className="h-full rounded-full bg-[#5146e5]"
                      style={{
                        width: `${application.resumeMatch}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[8px] text-[#71829a]">
                      <CheckCircle2 size={10} />
                      Skill Assessment
                    </span>

                    <span className="text-[9px] font-semibold text-[#5146e5]">
                      {application.assessment}%
                    </span>
                  </div>

                  <div className="h-[4px] overflow-hidden rounded-full bg-[#eef2ff]">
                    <div
                      className="h-full rounded-full bg-[#5146e5]"
                      style={{
                        width: `${application.assessment}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[9px] leading-3.5 text-[#71829a]">
                Your resume analysis and assessment indicate a strong overall
                match for this role.
              </p>
            </section>
          </div>
        </div>

        {/* AI Feedback */}
        <section className="mt-3 rounded-[10px] border border-[#e4defd] bg-[#f5f2ff] p-3.5 sm:p-4 lg:mt-4 lg:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#ede9fe] text-[#7c3aed]">
                <Sparkles size={14} strokeWidth={1.7} />
              </div>

              <div>
                <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                  AI Feedback
                </h2>

                <p className="text-[8px] text-[#7c3aed] sm:text-[9px]">
                  Generated by ResumeAI
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#ede9fe] px-2.5 py-1 text-[8px] font-semibold text-[#7c3aed]">
              ✨ AI Powered
            </span>
          </div>

          <p className="mt-4 text-[9px] leading-[1.55] text-[#64748b] sm:text-[10px] lg:text-[11px]">
            {application.feedback}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-medium text-emerald-600">
              ✓ Strong in React & JavaScript
            </span>

            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[9px] font-medium text-amber-600">
              ↗ Improve Express.js
            </span>
          </div>
        </section>

        {/* What's Next */}
        <section className="mt-3 rounded-[10px] border border-[#dce4ef] bg-white px-4 py-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7 lg:mt-4 lg:px-8 lg:py-8">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-[8px] bg-indigo-50 text-[#5146e5]">
            <Rocket size={17} strokeWidth={1.7} />
          </div>

          <h2 className="mt-2 text-[15px] font-bold text-[#172033] sm:text-[16px]">
            What's Next?
          </h2>

          <p className="mx-auto mt-1 max-w-[580px] text-[9px] leading-4 text-[#71829a] sm:text-[10px]">
            Continue improving your skills and prepare for the next stage of
            your job search journey.
          </p>

          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={goToInterview}
              className="flex h-8 items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] px-5 text-[10px] font-semibold text-white transition hover:bg-[#453bcf] sm:h-9 sm:text-[11px]"
            >
              <Play size={12} fill="currentColor" strokeWidth={0} />
              Prepare for Interview
            </button>

            <button
              type="button"
              onClick={goToJobs}
              className="flex h-8 items-center justify-center gap-2 rounded-[7px] border border-[#dce4ef] bg-white px-5 text-[10px] font-semibold text-[#475569] transition hover:bg-slate-50 sm:h-9 sm:text-[11px]"
            >
              <SearchIcon />
              Find More Jobs
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
  Inline Lucide-style search icon.
  Kept inside the same page file as requested.
*/
function SearchIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
