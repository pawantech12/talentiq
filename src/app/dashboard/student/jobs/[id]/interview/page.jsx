"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  MessageSquare,
  Play,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const QUESTION_COUNT = 8;
const DURATION_MINUTES = 10;

const evaluationAreas = [
  {
    title: "Technical Knowledge",
    description:
      "Understanding of required technologies and concepts required for the selected role.",
    icon: Code2,
    iconBg: "bg-indigo-50",
    iconColor: "text-[#5146e5]",
  },
  {
    title: "Problem Solving",
    description:
      "How you approach technical and practical challenges in real-world scenarios.",
    icon: Sparkles,
    iconBg: "bg-violet-50",
    iconColor: "text-[#7c3aed]",
  },
  {
    title: "Communication",
    description:
      "Clarity, structure and confidence in how you present your answers.",
    icon: MessageSquare,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    title: "Role Understanding",
    description:
      "Understanding of job responsibilities and expectations related to the job.",
    icon: BriefcaseBusiness,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
];

const howItWorks = [
  {
    number: "01",
    title: "Answer",
    description:
      "Respond to AI-generated interview questions based on your target role.",
    mobileDescription: "AI questions",
    bg: "bg-[#5146e5]",
  },
  {
    number: "02",
    title: "AI Evaluation",
    description:
      "Your answers are analyzed by AI based on the role requirements and expected standards.",
    mobileDescription: "By AI model",
    bg: "bg-[#7c3aed]",
  },
  {
    number: "03",
    title: "Personalized Feedback",
    description:
      "Receive detailed AI feedback and improvement suggestions after the interview.",
    mobileDescription: "Personalized",
    bg: "bg-[#16a34a]",
  },
];

const checklist = [
  "Find a quiet place to focus without distractions",
  "Read each question carefully before answering",
  "Answer naturally and clearly in your own words",
  "Take your time before responding to each question",
];

function getCompanyName(job) {
  return (
    job?.company ||
    job?.recruiter?.profile?.recruiter?.companyName ||
    job?.recruiter?.name ||
    job?.recruiter?.fullName ||
    "Company"
  );
}

function getInitials(name = "Company") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AIMockInterviewStartPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params?.id;

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const company = useMemo(() => getCompanyName(job), [job]);

  const initials = useMemo(() => getInitials(company), [company]);

  const skills = useMemo(() => {
    const required = Array.isArray(job?.requiredSkills)
      ? job.requiredSkills
      : [];

    const preferred = Array.isArray(job?.preferredSkills)
      ? job.preferredSkills
      : [];

    return [...new Set([...required, ...preferred].filter(Boolean))];
  }, [job]);

  // Fetch the selected job from your database.
  // This does NOT create an interview or start its timer.
  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function loadJob() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/student/jobs/${jobId}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.job) {
          throw new Error(data.message || "Unable to load job details.");
        }

        if (!cancelled) {
          setJob(data.job);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load job details.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  // Start or resume the interview only after the user clicks Start.
  const handleStartInterview = async () => {
    if (isStarting || !jobId || !job) return;

    try {
      setIsStarting(true);
      setError("");

      const response = await fetch(`/api/student/jobs/${jobId}/interview`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to start the interview.");
      }

      const interview = data.interview;

      if (!interview) {
        throw new Error("Interview session could not be created.");
      }

      // If the interview has already been completed or expired,
      // take the student directly to the saved result.
      if (
        interview.status === "submitted" ||
        interview.status === "expired" ||
        data.result
      ) {
        router.push(`/dashboard/student/jobs/${jobId}/interview/result`);
        return;
      }

      router.push(`/dashboard/student/jobs/${jobId}/interview/session`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsStarting(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/student");
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1 overflow-hidden whitespace-nowrap text-[11px] font-medium text-[#71829a] sm:text-[12px] lg:mb-4 lg:text-[13px]">
          <button
            type="button"
            onClick={handleBack}
            className="transition hover:text-[#5146e5]"
          >
            AI Mock Interview
          </button>

          <ChevronRight size={13} strokeWidth={1.7} className="shrink-0" />

          <span className="font-semibold text-[#5146e5]">Start</span>
        </div>

        {/* Page Heading */}
        <section className="mb-3 lg:mb-4">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#ede9fe] px-2.5 py-1 text-[10px] font-semibold text-[#7c3aed] sm:text-[11px]">
            <Sparkles size={12} strokeWidth={1.8} />
            AI Powered
          </div>

          <h1 className="text-[21px] font-bold leading-7 tracking-[-0.3px] text-[#172033] sm:text-[24px] lg:text-[26px]">
            AI Mock Interview
          </h1>

          <p className="mt-1 max-w-[760px] text-[12px] font-normal leading-5 text-[#71829a] sm:text-[13px] lg:text-[14px]">
            Practice job-specific interview questions with your personal AI
            interview coach.
          </p>
        </section>

        {/* Loading and error messages */}
        {isLoading && (
          <div className="mb-3 flex items-center gap-3 rounded-[10px] border border-[#dce4ef] bg-white p-4 text-[12px] text-[#64748b]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-[#5146e5]" />
            Loading job details...
          </div>
        )}

        {!isLoading && error && !job && (
          <div className="mb-3 rounded-[10px] border border-red-200 bg-red-50 p-4 text-[12px] text-red-600">
            {error}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="ml-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[12px] bg-gradient-to-r from-[#39328f] to-[#5146e5] px-5 py-6 text-white shadow-[0_4px_12px_rgba(79,70,229,0.12)] sm:px-6 sm:py-7 lg:px-7 lg:py-8">
          <div className="relative z-10 max-w-[680px]">
            <div className="mb-3 hidden h-[11px] w-[98px] bg-white/70 lg:block" />

            <h2 className="text-[21px] font-bold leading-7 sm:text-[23px] lg:text-[24px]">
              Ready for your mock interview?
            </h2>

            <p className="mt-2 max-w-[600px] text-[11px] font-normal leading-5 text-indigo-100 sm:text-[12px] lg:text-[13px]">
              Practice answering realistic interview questions based on the role
              you&apos;re applying for and receive personalized AI feedback
              after the session.
            </p>

            {/* Desktop Hero Stats */}
            <div className="mt-3 hidden items-center gap-3 text-[11px] font-medium text-indigo-100 sm:text-[12px] lg:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {QUESTION_COUNT} Questions Ready
              </span>

              <span className="h-3 w-px bg-white/30" />

              <span className="flex items-center gap-1.5">
                <Clock3 size={13} strokeWidth={1.7} />
                {DURATION_MINUTES} Minutes
              </span>
            </div>
          </div>

          {/* Mobile Hero Stats */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/20 text-center sm:hidden">
            <div>
              <div className="text-[20px] font-bold leading-6">
                {QUESTION_COUNT}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-indigo-100">
                Questions
              </div>
            </div>

            <div>
              <div className="text-[20px] font-bold leading-6">
                {DURATION_MINUTES} min
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-indigo-100">
                Duration
              </div>
            </div>

            <div>
              <div className="text-[20px] font-bold leading-6">AI</div>
              <div className="mt-0.5 text-[10px] font-medium text-indigo-100">
                Powered
              </div>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative flex h-[114px] w-[130px] items-center justify-center rounded-[15px] bg-white/10">
              <div className="absolute inset-[14px] rounded-[13px] border border-white/10 bg-white/5" />

              <div className="relative flex h-[54px] w-[54px] items-center justify-center rounded-[17px] bg-white/10">
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/15">
                  <Check size={20} strokeWidth={2.2} />
                </div>
              </div>

              <div className="absolute bottom-4 left-[28px] flex gap-2">
                <span className="h-1.5 w-5 rounded-full bg-white/30" />
                <span className="h-1.5 w-5 rounded-full bg-white/20" />
                <span className="h-1.5 w-5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Interview + Overview */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:mt-4 lg:grid-cols-[1.02fr_1fr]">
          {/* Interview For */}
          <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <BriefcaseBusiness size={15} strokeWidth={1.7} />
                </div>

                <h2 className="text-[13px] font-semibold text-[#172033] sm:text-[14px]">
                  Interview For
                </h2>
              </div>

              <span className="rounded-full bg-[#ede9fe] px-2.5 py-1 text-[9px] font-semibold text-[#7c3aed] sm:text-[10px]">
                Selected Job
              </span>
            </div>

            {/* Selected Job */}
            <div className="flex items-center gap-3 rounded-[8px] border border-[#dce4ef] bg-[#f8fafc] p-2.5 sm:p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-indigo-50 text-[13px] font-bold text-[#5146e5]">
                {isLoading ? "..." : initials}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-[13px] font-bold text-[#172033] sm:text-[14px]">
                  {isLoading
                    ? "Loading job..."
                    : job?.title || "Job title unavailable"}
                </h3>

                <p className="mt-0.5 text-[11px] font-medium text-[#61738e] sm:text-[12px]">
                  {isLoading ? "Please wait..." : company}
                </p>

                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[9px] font-normal text-[#8493a8] sm:text-[10px]">
                  <span>{job?.location || "Location not specified"}</span>
                  <span>•</span>
                  <span>
                    {job?.employmentType || "Employment type not specified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-medium text-[#94a3b8] sm:text-[11px]">
                Required Skills
              </p>

              <div className="flex flex-wrap gap-1.5">
                {isLoading ? (
                  <span className="text-[10px] text-[#94a3b8]">
                    Loading skills...
                  </span>
                ) : skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-[5px] bg-indigo-50 px-2.5 py-1 text-[10px] font-medium text-[#5146e5] sm:text-[11px]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-[#94a3b8]">
                    No skills specified for this job.
                  </span>
                )}
              </div>
            </div>

            <p className="mt-3 hidden items-center gap-1.5 text-[9px] font-medium text-[#9aa8ba] lg:flex">
              <Target size={11} />
              Based on your selected job and profile
            </p>
          </section>

          {/* Interview Overview */}
          <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                <Timer size={15} strokeWidth={1.7} />
              </div>

              <h2 className="text-[13px] font-semibold text-[#172033] sm:text-[14px]">
                Interview Overview
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {/* Questions */}
              <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[9px] border border-[#dce4ef] bg-[#f8fafc] px-2 text-center sm:min-h-[104px]">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <span className="text-[14px] font-semibold">?</span>
                </div>

                <div className="text-[21px] font-bold leading-6 text-[#172033]">
                  {QUESTION_COUNT}
                </div>

                <div className="mt-1 text-[9px] font-medium text-[#71829a] sm:text-[10px]">
                  Questions
                </div>
              </div>

              {/* Duration */}
              <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[9px] border border-[#dce4ef] bg-[#f8fafc] px-2 text-center sm:min-h-[104px]">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <Clock3 size={16} strokeWidth={1.7} />
                </div>

                <div className="text-[20px] font-bold leading-6 text-[#172033]">
                  {DURATION_MINUTES}
                </div>

                <div className="mt-1 text-[9px] font-medium text-[#71829a] sm:text-[10px]">
                  Minutes
                </div>
              </div>

              {/* AI */}
              <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[9px] border border-[#e8defd] bg-[#f6f2ff] px-2 text-center sm:min-h-[104px]">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#ede9fe] text-[#7c3aed]">
                  <Sparkles size={16} strokeWidth={1.7} />
                </div>

                <div className="text-[21px] font-bold leading-6 text-[#172033]">
                  AI
                </div>

                <div className="mt-1 text-[9px] font-medium text-[#7c3aed] sm:text-[10px]">
                  Mock Interview
                </div>
              </div>

              {/* Job */}
              <div className="flex min-h-[96px] flex-col items-center justify-center rounded-[9px] border border-[#dce4ef] bg-[#f8fafc] px-2 text-center sm:min-h-[104px]">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <Target size={16} strokeWidth={1.7} />
                </div>

                <div className="text-[21px] font-bold leading-6 text-[#172033]">
                  Job
                </div>

                <div className="mt-1 text-[9px] font-medium text-[#71829a] sm:text-[10px]">
                  Based
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* What Will Be Evaluated */}
        <section className="mt-3 rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:mt-4 lg:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[13px] font-semibold text-[#172033] sm:text-[14px]">
                What will be evaluated?
              </h2>

              <p className="mt-0.5 text-[10px] font-normal text-[#8a99ad] sm:text-[11px]">
                The AI will assess you across these key interview dimensions.
              </p>
            </div>

            <span className="hidden rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-[#5146e5] sm:inline-flex">
              4 Areas
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3">
            {evaluationAreas.map((area) => {
              const Icon = area.icon;

              return (
                <div
                  key={area.title}
                  className="flex min-h-[74px] items-start gap-2.5 rounded-[8px] border border-[#dce4ef] bg-[#f8fafc] p-2.5 sm:min-h-[104px] sm:p-3 lg:block lg:p-3.5"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] ${area.iconBg} ${area.iconColor} lg:mb-2`}
                  >
                    <Icon size={16} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h3 className="text-[11px] font-semibold text-[#172033] sm:text-[12px]">
                      {area.title}
                    </h3>

                    <p className="mt-0.5 text-[9px] font-normal leading-4 text-[#71829a] sm:text-[10px] sm:leading-4">
                      {area.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-3 rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:mt-4 lg:p-5">
          <div className="mb-3">
            <h2 className="text-[13px] font-semibold text-[#172033] sm:text-[14px]">
              How it works
            </h2>

            <p className="mt-0.5 text-[10px] font-normal text-[#8a99ad] sm:text-[11px]">
              Three simple steps to complete your AI mock interview.
            </p>
          </div>

          <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
            <div className="absolute left-[29%] right-[29%] top-[43px] hidden h-px bg-[#cbd5e1] lg:block" />

            {howItWorks.map((step, index) => (
              <div
                key={step.number}
                className={`relative z-10 flex min-h-[96px] flex-col items-center justify-start rounded-[8px] border border-[#dce4ef] bg-[#f8fafc] px-2 py-3 text-center sm:min-h-[120px] sm:px-3 sm:py-4 ${
                  index === 1 ? "lg:border-[#e8defd] lg:bg-[#f6f2ff]" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-[11px] font-bold text-white shadow-sm ${step.bg} sm:h-9 sm:w-9 sm:text-[12px]`}
                >
                  {step.number}
                </div>

                <h3 className="mt-2 text-[10px] font-semibold text-[#172033] sm:text-[11px] lg:text-[12px]">
                  {step.title}
                </h3>

                <p className="mt-0.5 hidden max-w-[210px] text-[9px] font-normal leading-4 text-[#8190a5] sm:block sm:text-[10px] sm:leading-4">
                  {step.description}
                </p>

                <p className="mt-0.5 text-[8px] font-medium text-[#8190a5] sm:hidden">
                  {step.mobileDescription}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Coach + Before Start */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:mt-4 lg:grid-cols-2">
          {/* AI Coach */}
          <section className="rounded-[10px] border border-[#e5defd] bg-[#f6f2ff] p-3.5 sm:p-4 lg:p-5">
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#ede9fe] text-[#7c3aed]">
                <Sparkles size={15} strokeWidth={1.7} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                    Your AI Interview Coach
                  </h2>

                  <span className="rounded-full bg-[#ede9fe] px-2 py-1 text-[9px] font-semibold text-[#7c3aed]">
                    ⚡
                  </span>
                </div>

                <p className="mt-0.5 text-[9px] font-medium text-[#7c3aed] sm:text-[10px]">
                  ⚡ ResumeAI
                </p>
              </div>
            </div>

            <div className="my-3 h-px bg-[#e7defc]" />

            <p className="text-[10px] font-normal leading-4.5 text-[#64748b] sm:text-[11px] sm:leading-5">
              The AI will generate questions specifically based on your selected
              job, its responsibilities and required skills. Your answers will
              be evaluated and you will receive personalized feedback after the
              interview.
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-[6px] bg-[#ede9fe] px-2.5 py-1 text-[9px] font-medium text-[#7c3aed]">
                ✓ Role-specific questions
              </span>

              <span className="rounded-[6px] bg-[#ede9fe] px-2.5 py-1 text-[9px] font-medium text-[#7c3aed]">
                ✓ Personalized feedback
              </span>

              <span className="rounded-[6px] bg-[#ede9fe] px-2.5 py-1 text-[9px] font-medium text-[#7c3aed]">
                ✓ Skill-based evaluation
              </span>
            </div>
          </section>

          {/* Before You Start */}
          <section className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-emerald-50 text-emerald-500">
                <CheckCircle2 size={15} strokeWidth={1.7} />
              </div>

              <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                Before you start
              </h2>
            </div>

            <div className="mt-3 space-y-2">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                    <Check size={11} strokeWidth={2.5} />
                  </span>

                  <span className="text-[10px] font-normal leading-4 text-[#64748b] sm:text-[11px]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Start Interview */}
        <section className="mt-3 rounded-[10px] border border-[#dce4ef] bg-white px-4 py-6 text-center shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7 lg:mt-4 lg:px-8 lg:py-8">
          <div className="mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-[11px] bg-gradient-to-br from-[#5146e5] to-[#3d35ae] text-white shadow-[0_5px_15px_rgba(79,70,229,0.28)] sm:h-[45px] sm:w-[45px]">
            <MessageSquare size={21} strokeWidth={1.8} />
          </div>

          <h2 className="mt-3 text-[16px] font-bold text-[#172033] sm:text-[17px] lg:text-[18px]">
            <span className="sm:hidden">Start Mock Interview</span>
            <span className="hidden sm:inline">
              Start your AI mock interview
            </span>
          </h2>

          <p className="mt-1 text-[10px] font-medium text-[#71829a] sm:text-[11px]">
            {DURATION_MINUTES} minutes · {QUESTION_COUNT} questions · AI-powered
            feedback
          </p>

          {error && job && (
            <p className="mx-auto mt-3 max-w-lg rounded-md bg-red-50 px-3 py-2 text-left text-[11px] text-red-600">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleBack}
              disabled={isStarting}
              className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#dce4ef] bg-white px-5 text-[11px] font-semibold text-[#64748b] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[12px]"
            >
              <ArrowLeft size={14} strokeWidth={1.8} />
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={isStarting || isLoading || !job}
              className="flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] px-6 text-[11px] font-semibold text-white shadow-[0_5px_12px_rgba(79,70,229,0.2)] transition hover:bg-[#453bcf] disabled:cursor-not-allowed disabled:opacity-70 sm:text-[12px]"
            >
              {isStarting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play size={13} fill="currentColor" strokeWidth={0} />
                  Start Mock Interview
                </>
              )}
            </button>
          </div>

          <p className="mt-3 hidden items-center justify-center gap-1 text-[9px] font-medium text-[#a0adbd] sm:flex">
            <CheckCircle2 size={10} strokeWidth={1.6} />
            Your responses are private and only used for feedback
          </p>

          {/* Mobile Back */}
          <button
            type="button"
            onClick={handleBack}
            disabled={isStarting}
            className="mt-3 text-[11px] font-medium text-[#71829a] sm:hidden"
          >
            Back to Dashboard
          </button>
        </section>
      </div>
    </main>
  );
}
