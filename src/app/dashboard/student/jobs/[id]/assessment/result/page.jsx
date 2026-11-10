"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CircleAlert,
  FileText,
  Search,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function ScoreRing({ value = 0, label, size = "large" }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
  const radius = size === "large" ? 48 : 39;
  const circumference = 2 * Math.PI * radius;
  const progress = (safeValue / 100) * circumference;
  const width = size === "large" ? 132 : 112;
  const strokeWidth = size === "large" ? 8 : 7;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width, height: width }}
    >
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="#EEF2FF"
          strokeWidth={strokeWidth}
        />

        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="#4F46E5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={[
            "font-bold leading-none text-[#111827]",
            size === "large" ? "text-[22px]" : "text-[21px]",
          ].join(" ")}
        >
          {safeValue}%
        </span>

        <span
          className={[
            "mt-1 text-center font-bold text-[#16A34A]",
            size === "large" ? "text-[10px]" : "text-[9px]",
          ].join(" ")}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function getScoreLabel(value) {
  if (value >= 90) return "Excellent Performance";
  if (value >= 80) return "Good Performance";
  if (value >= 70) return "Fair Performance";
  return "Needs Improvement";
}

function getCompatibilityLabel(value) {
  if (value >= 90) return "Excellent Match";
  if (value >= 80) return "Strong Match";
  if (value >= 70) return "Good Match";
  return "Needs Improvement";
}

export default function AssessmentResultPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id;

  const [result, setResult] = useState(null);
  const [job, setJob] = useState({
    title: "Job Assessment",
    companyName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function loadResult() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/student/jobs/${jobId}/assessment/result`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load assessment result.");
        }

        if (!cancelled) {
          setResult(data.result);
          setJob({
            title: data.job?.title || "Job Assessment",
            companyName: data.job?.companyName || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your assessment result.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const totalQuestions = Number(result?.totalQuestions || 0);
  const correctAnswers = Number(result?.correctAnswers || 0);
  const incorrectAnswers = Math.max(0, totalQuestions - correctAnswers);

  const score =
    typeof result?.score === "number"
      ? result.score
      : totalQuestions
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

  const accuracy = score;
  const timeTaken = Number(result?.timeTaken || 0);
  const resumeMatch = Number(result?.resumeMatch || 0);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;

    if (seconds === 0) return `${minutes} min`;

    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }, [timeTaken]);

  const compatibilityScore = Math.min(
    100,
    Math.max(0, Math.round(score * 0.6 + resumeMatch * 0.4)),
  );

  const skills = Array.isArray(result?.skills) ? result.skills : [];

  const strongSkills = skills.filter((skill) => skill.score >= 80);
  const improvementSkills = skills.filter((skill) => skill.score < 60);

  const strengths = Array.isArray(result?.strengths) ? result.strengths : [];

  const improvements = Array.isArray(result?.improvements)
    ? result.improvements
    : [];

  const handleInterview = () => {
    router.push(`/dashboard/student/jobs/${jobId}/interview`);
  };

  const handleJobs = () => {
    router.push("/dashboard/student/jobs");
  };

  const handleAssessment = () => {
    router.push(`/dashboard/student/jobs/${jobId}/assessment`);
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-58px)] bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1328px] px-4 py-10 sm:px-6 lg:px-0">
          <section className="rounded-[12px] border border-[#DCE3EE] bg-white px-5 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#E0E7FF] border-t-[#4F46E5]" />
            <p className="mt-4 text-[13px] text-[#64748B]">
              Loading your assessment result...
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="min-h-[calc(100vh-58px)] bg-[#F8FAFC]">
        <div className="mx-auto max-w-[1328px] px-4 py-10 sm:px-6 lg:px-0">
          <section className="rounded-[12px] border border-[#DCE3EE] bg-white px-5 py-10 text-center">
            <h1 className="text-[20px] font-bold text-[#111827]">
              Assessment result unavailable
            </h1>
            <p className="mx-auto mt-2 max-w-[500px] text-[13px] text-[#64748B]">
              {error ||
                "No completed assessment result was found for this job."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleAssessment}
                className="h-10 rounded-[8px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white hover:bg-[#4338CA]"
              >
                Open Assessment
              </button>
              <button
                type="button"
                onClick={handleJobs}
                className="h-10 rounded-[8px] border border-[#DCE3EE] px-5 text-[13px] font-semibold text-[#52627B]"
              >
                Find Jobs
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-58px)] bg-[#F8FAFC]">
      <div className="mx-auto w-full max-w-[1328px] px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-7 lg:px-0 lg:pt-7">
        {/* BREADCRUMBS */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B] sm:text-[12px]">
          <button
            type="button"
            onClick={handleAssessment}
            className="transition hover:text-[#4F46E5]"
          >
            Assessments
          </button>

          <span className="text-[#CBD5E1]">›</span>
          <span>{job.title}</span>
          <span className="text-[#CBD5E1]">›</span>

          <span className="font-semibold text-[#4F46E5]">Result</span>
        </div>

        {/* PAGE TITLE */}
        <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-bold leading-7 tracking-[-0.03em] text-[#111827] sm:text-[25px]">
                Assessment Result
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BBF7D0] bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-semibold text-[#16A34A]">
                <CheckCircle2 size={12} />
                Completed
              </span>

              {result.expired && (
                <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[10px] font-semibold text-[#B45309]">
                  Time expired
                </span>
              )}
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#64748B] sm:text-[13px]">
              <ClipboardCheck size={13} />
              {job.title}
              {job.companyName ? ` · ${job.companyName}` : ""}
            </p>
          </div>

          <p className="hidden text-[12px] text-[#52627B] lg:block">
            Your job-specific skill assessment has been completed.
          </p>
        </div>

        {/* PERFORMANCE SUMMARY */}
        <section className="mt-5 rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5 lg:p-7">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center lg:gap-8">
            {/* SCORE */}
            <div className="flex flex-col items-center text-center">
              <ScoreRing value={score} label={getScoreLabel(score)} />

              <h2 className="mt-4 text-[13px] font-bold text-[#111827]">
                Your Assessment Score
              </h2>

              <p className="mt-1 max-w-[250px] text-[11px] leading-[15px] text-[#71839E]">
                {result.summary ||
                  "Your score reflects your performance across the job-specific assessment questions."}
              </p>
            </div>

            {/* RIGHT PERFORMANCE */}
            <div className="min-w-0">
              <h2 className="hidden text-[14px] font-bold text-[#111827] lg:block">
                Performance Summary
              </h2>

              {/* STAT CARDS */}
              <div className="mt-0 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:mt-3">
                <div className="rounded-[9px] border border-[#DCE3EE] bg-[#F8FAFC] px-3 py-3 sm:px-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#DCFCE7] text-[#16A34A]">
                      <Check size={13} />
                    </span>
                    <span className="text-[10px] text-[#64748B] sm:text-[11px]">
                      Correct
                    </span>
                  </div>
                  <p className="mt-1 text-[20px] font-bold leading-6 text-[#16A34A]">
                    {correctAnswers}/{totalQuestions}
                  </p>
                </div>

                <div className="rounded-[9px] border border-[#DCE3EE] bg-[#F8FAFC] px-3 py-3 sm:px-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#FEE2E2] text-[#EF4444]">
                      <span className="text-[15px] leading-none">×</span>
                    </span>
                    <span className="text-[10px] text-[#64748B] sm:text-[11px]">
                      Incorrect
                    </span>
                  </div>
                  <p className="mt-1 text-[20px] font-bold leading-6 text-[#EF4444]">
                    {incorrectAnswers}/{totalQuestions}
                  </p>
                </div>

                <div className="rounded-[9px] border border-[#DCE3EE] bg-[#F8FAFC] px-3 py-3 sm:px-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#EEF2FF] text-[#4F46E5]">
                      <Target size={13} />
                    </span>
                    <span className="text-[10px] text-[#64748B] sm:text-[11px]">
                      Accuracy
                    </span>
                  </div>
                  <p className="mt-1 text-[20px] font-bold leading-6 text-[#4F46E5]">
                    {accuracy}%
                  </p>
                </div>

                <div className="rounded-[9px] border border-[#DCE3EE] bg-[#F8FAFC] px-3 py-3 sm:px-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#FEF3C7] text-[#F59E0B]">
                      <Timer size={13} />
                    </span>
                    <span className="text-[10px] text-[#64748B] sm:text-[11px]">
                      Time Taken
                    </span>
                  </div>
                  <p className="mt-1 text-[20px] font-bold leading-6 text-[#F59E0B]">
                    {formattedTime}
                  </p>
                </div>
              </div>

              {/* SKILL PERFORMANCE */}
              <div className="mt-5">
                <h3 className="text-[13px] font-bold text-[#111827]">
                  Skill Performance
                </h3>

                {skills.length > 0 ? (
                  <div className="mt-2 space-y-2.5">
                    {skills.map((skill) => {
                      const percentage = Math.min(
                        100,
                        Math.max(0, Number(skill.score) || 0),
                      );

                      const colorClass =
                        percentage >= 80
                          ? "text-[#16A34A]"
                          : percentage < 60
                            ? "text-[#F59E0B]"
                            : "text-[#4F46E5]";

                      const dotClass =
                        percentage >= 80
                          ? "bg-[#16A34A]"
                          : percentage < 60
                            ? "bg-[#F59E0B]"
                            : "bg-[#4F46E5]";

                      const barClass =
                        percentage >= 80
                          ? "bg-[#16A34A]"
                          : percentage < 60
                            ? "bg-[#F59E0B]"
                            : "bg-[#4F46E5]";

                      return (
                        <div key={skill.name}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span
                                className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`}
                              />
                              <span className="truncate text-[11px] font-medium text-[#52627B]">
                                {skill.name}
                              </span>
                            </div>
                            <span
                              className={`text-[11px] font-bold ${colorClass}`}
                            >
                              {percentage}%
                            </span>
                          </div>

                          <div className="mt-1 h-[7px] overflow-hidden rounded-full bg-[#EEF2FF]">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${barClass}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-[#71839E]">
                    Skill breakdown is not available for this assessment.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT GRID */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_282px]">
          {/* LEFT CONTENT */}
          <div className="min-w-0 space-y-5">
            {/* AI FEEDBACK */}
            <section className="rounded-[12px] border border-[#E9D5FF] bg-[#F5F3FF] p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#EDE9FE] text-[#7C3AED]">
                  <Sparkles size={16} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[14px] font-bold text-[#7C3AED]">
                    AI Assessment Feedback
                  </h2>
                  <p className="mt-0.5 text-[10px] text-[#94A3B8]">
                    Generated based on your performance
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[12px] leading-[18px] text-[#52627B] sm:text-[13px] sm:leading-[19px]">
                {result.feedback ||
                  "Review your skill performance breakdown to identify areas where additional practice may help."}
              </p>

              {result.recommendation && (
                <div className="mt-3 rounded-[9px] border border-[#DDD6FE] bg-white/70 px-3 py-2.5">
                  <p className="text-[10px] font-bold text-[#7C3AED]">
                    Recommended next step
                  </p>
                  <p className="mt-1 text-[11px] leading-[16px] text-[#52627B]">
                    {result.recommendation}
                  </p>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {/* STRONG AREAS */}
                <div className="rounded-[10px] bg-[#DCFCE7] p-3">
                  <div className="flex items-center gap-1.5">
                    <Check size={13} className="text-[#16A34A]" />
                    <span className="text-[11px] font-bold text-[#16A34A]">
                      Strong Areas
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {strongSkills.length ? (
                      strongSkills.map((skill) => (
                        <span
                          key={skill.name}
                          className="rounded-full border border-[#16A34A] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#16A34A]"
                        >
                          {skill.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[#52627B]">
                        No strong skill category identified yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* IMPROVEMENT */}
                <div className="rounded-[10px] bg-[#FEF3C7] p-3">
                  <div className="flex items-center gap-1.5">
                    <CircleAlert size={13} className="text-[#F59E0B]" />
                    <span className="text-[11px] font-bold text-[#F59E0B]">
                      Needs Improvement
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {improvementSkills.length ? (
                      improvementSkills.map((skill) => (
                        <span
                          key={skill.name}
                          className="rounded-full border border-[#F59E0B] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#F59E0B]"
                        >
                          {skill.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[#52627B]">
                        No low-scoring skill category identified.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* STRENGTHS + IMPROVEMENTS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* STRENGTHS */}
              <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#DCFCE7] text-[#16A34A]">
                    <Star size={14} />
                  </div>
                  <h2 className="text-[13px] font-bold text-[#111827]">
                    Your Strengths
                  </h2>
                </div>

                <div className="mt-4 space-y-2">
                  {strengths.length ? (
                    strengths.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-center gap-2 rounded-[8px] bg-[#F8FAFC] px-2.5 py-2"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                          <Check size={11} />
                        </span>
                        <span className="text-[11px] font-medium text-[#52627B]">
                          {item}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#71839E]">
                      No specific strengths were returned.
                    </p>
                  )}
                </div>
              </section>

              {/* IMPROVEMENTS */}
              <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#FEF3C7] text-[#F59E0B]">
                    <TrendingUp size={14} />
                  </div>
                  <h2 className="text-[13px] font-bold text-[#111827]">
                    Areas for Improvement
                  </h2>
                </div>

                <div className="mt-4 space-y-2">
                  {improvements.length ? (
                    improvements.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-center gap-2 rounded-[8px] bg-[#FFFBEB] px-2.5 py-2"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FEF3C7] text-[#F59E0B]">
                          <span className="text-[12px] leading-none">○</span>
                        </span>
                        <span className="text-[11px] font-medium text-[#52627B]">
                          {item}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#71839E]">
                      No specific improvement areas were returned.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="space-y-5">
            {/* COMPATIBILITY */}
            <section className="rounded-[12px] border border-[#4F46E5] bg-white p-4 shadow-[0_2px_5px_rgba(79,70,229,0.08)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                    <Zap size={14} />
                  </div>
                  <h2 className="truncate text-[13px] font-bold text-[#111827]">
                    Updated Job Compatibility
                  </h2>
                </div>

                <span className="shrink-0 rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-semibold text-[#4F46E5]">
                  Updated
                </span>
              </div>

              <div className="mt-5 flex flex-col items-center">
                <ScoreRing
                  value={compatibilityScore}
                  label={getCompatibilityLabel(compatibilityScore)}
                  size="small"
                />

                <p className="mt-3 text-center text-[11px] leading-[15px] text-[#71839E]">
                  This indicator combines your resume match and assessment
                  performance.
                </p>
              </div>

              <div className="mt-4 overflow-hidden rounded-[9px] border border-[#DCE3EE]">
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <FileText size={13} className="shrink-0 text-[#64748B]" />
                  <span className="flex-1 text-[11px] text-[#52627B]">
                    Resume Match
                  </span>

                  <div className="hidden h-[5px] w-[62px] overflow-hidden rounded-full bg-[#EEF2FF] sm:block">
                    <div
                      className="h-full rounded-full bg-[#4F46E5]"
                      style={{ width: `${resumeMatch}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-bold text-[#4F46E5]">
                    {resumeMatch}%
                  </span>
                </div>

                <div className="h-px bg-[#DCE3EE]" />

                <div className="flex items-center gap-2 px-3 py-2.5">
                  <ClipboardCheck
                    size={13}
                    className="shrink-0 text-[#64748B]"
                  />
                  <span className="flex-1 text-[11px] text-[#52627B]">
                    Skill Assessment
                  </span>

                  <div className="hidden h-[5px] w-[62px] overflow-hidden rounded-full bg-[#EEF2FF] sm:block">
                    <div
                      className="h-full rounded-full bg-[#4F46E5]"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <span className="text-[11px] font-bold text-[#4F46E5]">
                    {score}%
                  </span>
                </div>
              </div>
            </section>

            {/* WHAT'S NEXT */}
            <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <ArrowRight size={14} />
                </div>
                <h2 className="text-[13px] font-bold text-[#111827]">
                  What's Next?
                </h2>
              </div>

              <p className="mt-4 text-[11px] leading-[16px] text-[#64748B]">
                Use your assessment feedback to improve your skills and prepare
                for future applications.
              </p>

              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={handleInterview}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] px-4 text-[12px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#4338CA] active:scale-[0.99]"
                >
                  <span>Prepare for Interview</span>
                  <ArrowUpRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={handleJobs}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-[#DCE3EE] bg-white px-4 text-[12px] font-semibold text-[#52627B] transition hover:border-[#C7D2FE] hover:bg-[#F8FAFF] hover:text-[#4F46E5]"
                >
                  <Search size={14} />
                  <span>Find More Jobs</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
