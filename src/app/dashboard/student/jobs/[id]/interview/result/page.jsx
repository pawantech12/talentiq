"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Clock3,
  Code2,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const RESULT_API_URL = (jobId) =>
  `/api/student/jobs/${encodeURIComponent(jobId)}/interview/result`;

const EXPECTED_AREAS = [
  {
    name: "Technical Knowledge",
    icon: Code2,
    color: "green",
  },
  {
    name: "Problem Solving",
    icon: Sparkles,
    color: "orange",
  },
  {
    name: "Communication",
    icon: MessageSquare,
    color: "green",
  },
  {
    name: "Role Understanding",
    icon: Target,
    color: "orange",
  },
];

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getScoreLabel(score) {
  if (score >= 90) return "Excellent Performance";
  if (score >= 80) return "Strong Performance";
  if (score >= 70) return "Good Performance";
  return "Needs Improvement";
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes === 0) return `${remainingSeconds} sec`;

  if (remainingSeconds === 0) return `${minutes} min`;

  return `${minutes} min ${remainingSeconds} sec`;
}

function getInitials(name) {
  if (!name) return "CO";

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function BriefcaseIcon() {
  return <BriefcaseBusiness size={11} strokeWidth={1.8} aria-hidden="true" />;
}

function TimerIcon() {
  return (
    <Clock3 size={15} strokeWidth={1.7} className="mb-1 text-indigo-100" />
  );
}

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-sm rounded-[12px] border border-[#dce4ef] bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef0ff] text-[#5146e5]">
          <RefreshCw size={21} className="animate-spin" />
        </div>

        <h2 className="mt-4 text-[16px] font-bold text-[#172033]">
          Loading Interview Result
        </h2>

        <p className="mt-2 text-[12px] text-[#8190a5]">
          Please wait while we retrieve your interview evaluation.
        </p>
      </div>
    </main>
  );
}

function ErrorState({ message, onRetry, onDashboard }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-md rounded-[12px] border border-[#dce4ef] bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fef3c7] text-[#b45309]">
          <Lightbulb size={22} />
        </div>

        <h2 className="mt-4 text-[17px] font-bold text-[#172033]">
          Unable to Load Interview Result
        </h2>

        <p className="mt-2 text-[12px] leading-5 text-[#71829a]">{message}</p>

        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] px-4 text-[11px] font-semibold text-white hover:bg-[#453bcf]"
          >
            <RefreshCw size={13} />
            Try Again
          </button>

          <button
            type="button"
            onClick={onDashboard}
            className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#dce4ef] px-4 text-[11px] font-semibold text-[#53627a] hover:bg-[#f8fafc]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AIMockInterviewResultPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params?.id;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResult = useCallback(async () => {
    if (!jobId) {
      setError(
        "Job ID is missing. Please open the interview result from your jobs page.",
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(RESULT_API_URL(jobId), {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.result) {
        throw new Error(
          data.message || "No completed interview result was found.",
        );
      }

      setResult(data.result);
    } catch (err) {
      console.error("Interview result fetch error:", err);

      setError(
        err.message ||
          "Something went wrong while loading your interview result.",
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const handleTryAgain = () => {
    router.push(`/dashboard/student/jobs/${jobId}/interview`);
  };

  const handleDashboard = () => {
    router.push("/dashboard/student");
  };

  const handleJobs = () => {
    router.push("/dashboard/student/jobs");
  };

  const handleBack = () => {
    router.back();
  };

  const score = useMemo(() => clampScore(result?.score), [result?.score]);

  const scoreLabel = useMemo(
    () => result?.performanceLabel || getScoreLabel(score),
    [result?.performanceLabel, score],
  );

  const skills = useMemo(() => {
    const areas = Array.isArray(result?.areas) ? result.areas : [];

    return EXPECTED_AREAS.map((expected) => {
      const matched = areas.find(
        (area) =>
          String(area.name || "").toLowerCase() === expected.name.toLowerCase(),
      );

      return {
        ...expected,
        score: clampScore(matched?.score),
        feedback: matched?.feedback || "Continue practicing this area.",
      };
    });
  }, [result?.areas]);

  const strongestArea = useMemo(() => {
    if (!skills.length) return null;

    return [...skills].sort((a, b) => b.score - a.score)[0];
  }, [skills]);

  const weakestArea = useMemo(() => {
    if (!skills.length) return null;

    return [...skills].sort((a, b) => a.score - b.score)[0];
  }, [skills]);

  const strengths = useMemo(
    () =>
      Array.isArray(result?.strengths) ? result.strengths.filter(Boolean) : [],
    [result?.strengths],
  );

  const improvements = useMemo(
    () =>
      Array.isArray(result?.improvements)
        ? result.improvements.filter(Boolean)
        : [],
    [result?.improvements],
  );

  const recommendations = useMemo(
    () =>
      Array.isArray(result?.recommendations)
        ? result.recommendations.filter(Boolean)
        : [],
    [result?.recommendations],
  );

  const totalQuestions = Math.max(
    0,
    Number(result?.totalQuestions ?? result?.questions) || 0,
  );

  const answeredQuestions = Math.min(
    totalQuestions,
    Math.max(0, Number(result?.answeredQuestions) || 0),
  );

  const unansweredQuestions = Math.max(0, totalQuestions - answeredQuestions);

  const answeredPercentage =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const duration = formatDuration(result?.timeTaken ?? result?.durationSeconds);

  const interviewDate = formatDate(result?.date);

  const jobTitle = result?.jobTitle || "Mock Interview";

  const company = result?.company || "Company";

  const isExpired = result?.status === "expired";

  const isFallback = result?.evaluationMode === "fallback";

  if (loading) {
    return <LoadingState />;
  }

  if (error || !result) {
    return (
      <ErrorState
        message={error || "Interview result is not available."}
        onRetry={fetchResult}
        onDashboard={handleDashboard}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto w-full max-w-[1250px] px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1.5 text-[11px] font-medium text-[#71829a] sm:text-[12px] lg:mb-5 lg:text-[13px]">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 transition hover:text-[#5146e5]"
          >
            <ArrowLeft size={14} strokeWidth={1.8} />
            AI Mock Interview
          </button>

          <ChevronRight
            size={13}
            strokeWidth={1.6}
            className="text-[#a6b2c2]"
          />

          <span className="font-semibold text-[#5146e5]">Interview Result</span>
        </div>

        {/* Page Heading */}
        <section className="mb-4 flex flex-col gap-3 sm:mb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1.5 text-[10px] font-semibold text-[#16a34a] sm:text-[11px]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isExpired ? "bg-[#f59e0b]" : "bg-[#16a34a]"
                }`}
              />
              {isExpired ? "Interview Time Expired" : "Interview Completed"}
            </div>

            <h1 className="text-[23px] font-bold leading-7 tracking-[-0.35px] text-[#172033] sm:text-[26px] sm:leading-8 lg:text-[28px]">
              Interview Result
            </h1>

            <p className="mt-1 text-[12px] leading-5 text-[#71829a] sm:text-[13px] lg:text-[14px]">
              Here&apos;s how you performed in your AI mock interview.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTryAgain}
            className="hidden h-9 items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] px-4 text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#453bcf] sm:flex"
          >
            <RefreshCw size={13} strokeWidth={1.8} />
            Try Another Interview
          </button>
        </section>

        {/* Result Hero */}
        <section className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-[#4037b8] via-[#5146e5] to-[#4439bd] px-5 py-5 text-white shadow-[0_5px_16px_rgba(79,70,229,0.16)] sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] bg-white/15 text-[14px] font-bold text-white sm:h-12 sm:w-12 sm:text-[15px]">
                  {getInitials(company)}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-bold sm:text-[16px] lg:text-[17px]">
                    {jobTitle}
                  </h2>

                  <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-indigo-100 sm:text-[11px] lg:text-[12px]">
                    <BriefcaseIcon />
                    {company}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[31px] font-bold leading-8 tracking-[-1px] sm:text-[36px] sm:leading-9 lg:text-[39px]">
                  {score}%
                </div>

                <div className="mt-0.5 text-[9px] font-medium text-indigo-100 sm:text-[10px]">
                  Overall
                </div>
              </div>
            </div>

            <div className="my-4 h-px bg-white/20" />

            {/* Hero Stats */}
            <div className="grid grid-cols-3 divide-x divide-white/20">
              <div className="flex flex-col items-center justify-center px-2 text-center">
                <Clock3
                  size={15}
                  strokeWidth={1.7}
                  className="mb-1 text-indigo-100"
                />

                <span className="text-[10px] font-semibold sm:text-[11px] lg:text-[12px]">
                  {interviewDate}
                </span>

                <span className="mt-0.5 text-[8px] text-indigo-100 sm:text-[9px]">
                  Completed
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-2 text-center">
                <CheckCircle2
                  size={15}
                  strokeWidth={1.7}
                  className="mb-1 text-indigo-100"
                />

                <span className="text-[11px] font-semibold sm:text-[12px] lg:text-[13px]">
                  {answeredQuestions} / {totalQuestions}
                </span>

                <span className="mt-0.5 text-[8px] text-indigo-100 sm:text-[9px]">
                  Answered
                </span>
              </div>

              <div className="flex flex-col items-center justify-center px-2 text-center">
                <TimerIcon />

                <span className="text-[11px] font-semibold sm:text-[12px] lg:text-[13px]">
                  {duration}
                </span>

                <span className="mt-0.5 text-[8px] text-indigo-100 sm:text-[9px]">
                  Duration
                </span>
              </div>
            </div>
          </div>

          {/* Desktop performance label */}
          <div className="absolute right-7 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white">
              <Trophy size={13} strokeWidth={1.8} />
              {scoreLabel}
            </div>
          </div>
        </section>

        {/* Main Results Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
          {/* Overall Performance */}
          <section className="rounded-[11px] border border-[#dce4ef] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px] lg:text-[16px]">
                  Overall Performance
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-[#8190a5] sm:text-[11px] lg:text-[12px]">
                  Based on {totalQuestions} interview questions
                </p>
              </div>

              <span className="rounded-full bg-[#dcfce7] px-2.5 py-1.5 text-[9px] font-semibold text-[#16a34a] sm:text-[10px]">
                {scoreLabel}
              </span>
            </div>

            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8 lg:mt-6">
              {/* Score Ring */}
              <div className="relative flex h-[118px] w-[118px] shrink-0 items-center justify-center sm:h-[126px] sm:w-[126px]">
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 h-full w-full -rotate-90"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#e9effb"
                    strokeWidth="9"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#5146e5"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="263.9"
                    strokeDashoffset={263.9 - (263.9 * score) / 100}
                  />
                </svg>

                <div className="relative text-center">
                  <div className="text-[25px] font-bold leading-7 text-[#172033] sm:text-[27px]">
                    {score}%
                  </div>

                  <div className="mt-0.5 text-[9px] font-medium leading-3 text-[#8190a5] sm:text-[10px]">
                    Interview
                    <br />
                    Score
                  </div>
                </div>
              </div>

              <div className="max-w-[245px]">
                <h3 className="text-[13px] font-bold text-[#172033] sm:text-[14px]">
                  {scoreLabel}
                </h3>

                <p className="mt-1 text-[10px] font-medium text-[#8190a5] sm:text-[11px]">
                  Your overall interview evaluation
                </p>

                <div className="mt-3 space-y-2">
                  {strongestArea && (
                    <div className="flex items-center gap-2 text-[10px] text-[#71829a] sm:text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                      <span>
                        Best: {strongestArea.name} {strongestArea.score}%
                      </span>
                    </div>
                  )}

                  {weakestArea && (
                    <div className="flex items-center gap-2 text-[10px] text-[#71829a] sm:text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                      <span>
                        Focus: {weakestArea.name} {weakestArea.score}%
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-[10px] leading-4 text-[#71829a] sm:text-[11px] sm:leading-5">
                  {result.feedback ||
                    "Review your performance breakdown and continue practicing your interview skills."}
                </p>
              </div>
            </div>
          </section>

          {/* Performance Breakdown */}
          <section className="rounded-[11px] border border-[#dce4ef] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5 lg:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eef0ff] text-[#5146e5]">
                  <BarChart3 size={15} strokeWidth={1.7} />
                </div>

                <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                  Performance Breakdown
                </h2>
              </div>

              <span className="text-[10px] font-medium text-[#8190a5] sm:text-[11px]">
                {skills.length} Areas
              </span>
            </div>

            <div className="space-y-4">
              {skills.map((skill) => {
                const Icon = skill.icon;

                return (
                  <div key={skill.name}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] ${
                          skill.color === "green"
                            ? "bg-[#dcfce7] text-[#16a34a]"
                            : "bg-[#f3e8ff] text-[#7c3aed]"
                        }`}
                      >
                        <Icon size={13} strokeWidth={1.7} />
                      </div>

                      <span className="min-w-0 flex-1 text-[10px] font-medium text-[#46566f] sm:text-[11px] lg:text-[12px]">
                        {skill.name}
                      </span>

                      <span className="text-[11px] font-bold text-[#172033] sm:text-[12px]">
                        {skill.score}%
                      </span>

                      {strongestArea?.name === skill.name && (
                        <span className="rounded-[5px] bg-[#dcfce7] px-1.5 py-0.5 text-[8px] font-semibold text-[#16a34a]">
                          Best
                        </span>
                      )}

                      {weakestArea?.name === skill.name &&
                        strongestArea?.name !== skill.name && (
                          <span className="rounded-[5px] bg-[#fef3c7] px-1.5 py-0.5 text-[8px] font-semibold text-[#b45309]">
                            Improve
                          </span>
                        )}
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#eaf0fb]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          skill.color === "green"
                            ? "bg-[#16a34a]"
                            : "bg-[#7c3aed]"
                        }`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Highlight Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Strongest */}
          <section className="relative overflow-hidden rounded-[10px] border border-[#bbf7d0] border-l-[3px] border-l-[#16a34a] bg-[#dcfce7] p-4 sm:p-4.5">
            <div className="flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-white/70 text-[#16a34a]">
                <ArrowUpRight size={15} strokeWidth={2} />
              </div>

              <span className="text-[9px] font-semibold text-[#15803d] sm:text-[10px]">
                Strongest Area
              </span>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-[#172033] sm:text-[12px]">
              {strongestArea?.name || "Not available"}
            </p>

            <div className="mt-1 flex items-end gap-2">
              <span className="text-[23px] font-bold leading-7 text-[#16a34a] sm:text-[25px]">
                {strongestArea?.score ?? 0}%
              </span>

              <span className="pb-0.5 text-[9px] font-medium text-[#15803d]">
                Top Score
              </span>
            </div>
          </section>

          {/* Improve */}
          <section className="relative overflow-hidden rounded-[10px] border border-[#fde68a] border-l-[3px] border-l-[#f59e0b] bg-[#fef3c7] p-4 sm:p-4.5">
            <div className="flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-white/70 text-[#f59e0b]">
                <Target size={15} strokeWidth={1.8} />
              </div>

              <span className="text-[9px] font-semibold text-[#b45309] sm:text-[10px]">
                Needs Improvement
              </span>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-[#172033] sm:text-[12px]">
              {weakestArea?.name || "Not available"}
            </p>

            <div className="mt-1 flex items-end gap-2">
              <span className="text-[23px] font-bold leading-7 text-[#f59e0b] sm:text-[25px]">
                {weakestArea?.score ?? 0}%
              </span>

              <span className="pb-0.5 text-[9px] font-medium text-[#b45309]">
                Focus Area
              </span>
            </div>
          </section>

          {/* Overall */}
          <section className="relative overflow-hidden rounded-[10px] border border-[#c7d2fe] border-l-[3px] border-l-[#5146e5] bg-[#eef0ff] p-4 sm:p-4.5">
            <div className="flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-white/70 text-[#5146e5]">
                <Trophy size={15} strokeWidth={1.8} />
              </div>

              <span className="text-[9px] font-semibold text-[#5146e5] sm:text-[10px]">
                Overall Score
              </span>
            </div>

            <p className="mt-2 text-[11px] font-semibold text-[#172033] sm:text-[12px]">
              {scoreLabel}
            </p>

            <div className="mt-1 flex items-end gap-2">
              <span className="text-[23px] font-bold leading-7 text-[#5146e5] sm:text-[25px]">
                {score}%
              </span>

              <span className="pb-0.5 text-[9px] font-medium text-[#5146e5]">
                Overall
              </span>
            </div>
          </section>
        </div>

        {/* AI Feedback */}
        <section className="mt-4 rounded-[11px] border border-[#e5defd] bg-[#f6f2ff] p-4 sm:p-5 lg:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#ede9fe] text-[#7c3aed]">
              <Sparkles size={17} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                    AI Feedback
                  </h2>

                  <p className="mt-0.5 text-[9px] font-medium text-[#7c3aed] sm:text-[10px]">
                    Personalized by ResumeAI
                  </p>
                </div>

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-[#7c3aed]">
                  <Zap size={13} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </div>

          <div className="my-4 h-px bg-[#e6ddfc]" />

          <p className="text-[11px] leading-5 text-[#53627a] sm:text-[12px] sm:leading-6 lg:text-[13px]">
            {result.feedback ||
              "Continue practicing and reviewing your answers to improve your interview performance."}
          </p>

          {isFallback && (
            <div className="mt-3 rounded-[7px] border border-[#fde68a] bg-[#fef3c7] px-3 py-2 text-[10px] leading-4 text-[#92400e]">
              This result uses the completion-based fallback evaluation because
              the detailed AI evaluation was unavailable. Your score may not
              represent a full assessment of answer quality.
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {strengths.slice(0, 2).map((item, index) => (
              <span
                key={`strength-tag-${index}`}
                className="rounded-[6px] bg-[#dcfce7] px-2.5 py-1.5 text-[9px] font-semibold text-[#15803d] sm:text-[10px]"
              >
                ✓ {item}
              </span>
            ))}

            {improvements.slice(0, 2).map((item, index) => (
              <span
                key={`improvement-tag-${index}`}
                className="rounded-[6px] bg-[#fef3c7] px-2.5 py-1.5 text-[9px] font-semibold text-[#b45309] sm:text-[10px]"
              >
                ↗ {item}
              </span>
            ))}
          </div>
        </section>

        {/* Strengths + Improvements */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Strengths */}
          <section className="rounded-[11px] border border-[#dce4ef] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#dcfce7] text-[#16a34a]">
                  <CircleCheck size={16} strokeWidth={1.8} />
                </div>

                <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                  Your Strengths
                </h2>
              </div>

              <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[9px] font-semibold text-[#16a34a] sm:text-[10px]">
                {strengths.length} Identified
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {strengths.length > 0 ? (
                strengths.map((strength, index) => (
                  <div
                    key={`strength-${index}`}
                    className="flex items-center gap-2.5 rounded-[7px] bg-[#dcfce7] px-3 py-2.5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-white">
                      <Check size={13} strokeWidth={2.4} />
                    </span>

                    <span className="text-[10px] font-medium leading-4 text-[#166534] sm:text-[11px]">
                      {strength}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-[7px] bg-[#f8fafc] px-3 py-3 text-[11px] text-[#8190a5]">
                  No specific strengths were returned for this interview.
                </p>
              )}
            </div>
          </section>

          {/* Improvements */}
          <section className="rounded-[11px] border border-[#dce4ef] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#fef3c7] text-[#f59e0b]">
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                </div>

                <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                  Areas to Improve
                </h2>
              </div>

              <span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-[9px] font-semibold text-[#b45309] sm:text-[10px]">
                {improvements.length} Focus Areas
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {improvements.length > 0 ? (
                improvements.map((item, index) => (
                  <div
                    key={`improvement-${index}`}
                    className="flex items-center gap-2.5 rounded-[7px] bg-[#fef3c7] px-3 py-2.5"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f59e0b] text-white">
                      <ArrowRight size={13} strokeWidth={2.2} />
                    </span>

                    <span className="text-[10px] font-medium leading-4 text-[#92400e] sm:text-[11px]">
                      {item}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-[7px] bg-[#f8fafc] px-3 py-3 text-[11px] text-[#8190a5]">
                  No improvement areas were returned for this interview.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Question Performance + Recommended Steps */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Question Performance */}
          <section className="rounded-[11px] border border-[#dce4ef] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eef0ff] text-[#5146e5]">
                <BarChart3 size={16} strokeWidth={1.8} />
              </div>

              <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                Question Performance
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-[8px] border border-[#dce4ef] bg-[#f8fafc] px-2 py-3 text-center">
                <div className="text-[21px] font-bold text-[#172033] sm:text-[23px]">
                  {totalQuestions}
                </div>

                <p className="mt-1 text-[9px] font-medium text-[#8190a5] sm:text-[10px]">
                  Total Questions
                </p>
              </div>

              <div className="rounded-[8px] bg-[#dcfce7] px-2 py-3 text-center">
                <div className="text-[21px] font-bold text-[#16a34a] sm:text-[23px]">
                  {answeredQuestions}
                </div>

                <p className="mt-1 text-[9px] font-medium text-[#15803d] sm:text-[10px]">
                  Answered
                </p>
              </div>

              <div className="rounded-[8px] bg-[#fef3c7] px-2 py-3 text-center">
                <div className="text-[21px] font-bold text-[#f59e0b] sm:text-[23px]">
                  {unansweredQuestions}
                </div>

                <p className="mt-1 text-[9px] font-medium text-[#b45309] sm:text-[10px]">
                  Unanswered
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-[10px] font-medium text-[#8190a5] sm:text-[11px]">
                Answer Completion Distribution
              </div>

              <div className="flex h-3 overflow-hidden rounded-full bg-[#eaf0fb]">
                <div
                  className="h-full bg-[#16a34a] transition-all"
                  style={{ width: `${answeredPercentage}%` }}
                />

                <div
                  className="h-full bg-[#f59e0b] transition-all"
                  style={{ width: `${100 - answeredPercentage}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[9px] font-medium text-[#8190a5] sm:text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                  {answeredQuestions} Answered ({Math.round(answeredPercentage)}
                  %)
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  {unansweredQuestions} Unanswered (
                  {Math.round(100 - answeredPercentage)}%)
                </span>
              </div>
            </div>
          </section>

          {/* Recommended Next Steps */}
          <section className="rounded-[11px] border border-[#dce4ef] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f3e8ff] text-[#7c3aed]">
                <Sparkles size={16} strokeWidth={1.8} />
              </div>

              <div>
                <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                  Recommended Next Steps
                </h2>

                <p className="text-[9px] text-[#8190a5] sm:text-[10px]">
                  Based on your interview performance
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {recommendations.length > 0 ? (
                recommendations.map((item, index) => (
                  <div
                    key={`recommendation-${index}`}
                    className="flex items-center gap-3 rounded-[7px] border border-[#dce4ef] bg-[#f8fafc] px-2.5 py-2.5"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                        index % 3 === 0
                          ? "bg-[#7c3aed]"
                          : index % 3 === 1
                            ? "bg-[#16a34a]"
                            : "bg-[#f59e0b]"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold leading-4 text-[#172033] sm:text-[11px]">
                        {item}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-[7px] bg-[#f8fafc] px-3 py-3 text-[11px] text-[#8190a5]">
                  No recommendations are available for this interview.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <section className="mt-4 rounded-[11px] border border-[#dce4ef] bg-white px-4 py-7 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-6 sm:py-8 lg:mt-5 lg:py-9">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#5146e5] text-white shadow-[0_4px_10px_rgba(79,70,229,0.2)]">
            <RefreshCw size={18} strokeWidth={1.8} />
          </div>

          <h2 className="mt-3 text-[15px] font-bold text-[#172033] sm:text-[17px] lg:text-[18px]">
            Ready to practice again?
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-[#8190a5] sm:text-[11px] lg:text-[12px]">
            Apply what you&apos;ve learned and improve your score in the next
            session.
          </p>

          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleDashboard}
              className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#dce4ef] bg-white px-4 text-[10px] font-semibold text-[#53627a] transition hover:bg-[#f8fafc] sm:text-[11px]"
            >
              <BarChart3 size={13} strokeWidth={1.8} />
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={handleJobs}
              className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#dce4ef] bg-white px-4 text-[10px] font-semibold text-[#53627a] transition hover:bg-[#f8fafc] sm:text-[11px]"
            >
              <Search size={13} strokeWidth={1.8} />
              Find More Jobs
            </button>

            <button
              type="button"
              onClick={handleTryAgain}
              className="flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] px-5 text-[10px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.2)] transition hover:bg-[#453bcf] sm:text-[11px]"
            >
              <RefreshCw size={13} strokeWidth={1.8} />
              Try Another Mock Interview
            </button>
          </div>
        </section>

        {/* Mobile Try Again */}
        <button
          type="button"
          onClick={handleTryAgain}
          className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#5146e5] text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#453bcf] sm:hidden"
        >
          <RefreshCw size={14} strokeWidth={1.8} />
          Try Another Interview
        </button>
      </div>
    </main>
  );
}
