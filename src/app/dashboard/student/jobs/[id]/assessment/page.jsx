"use client";

import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Flag,
  List,
  Sparkles,
  Timer,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function SkillAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id;

  const [questions, setQuestions] = useState([]);
  const [jobTitle, setJobTitle] = useState("Job Skill Assessment");
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const submitLock = useRef(false);

  const loadAssessment = useCallback(async () => {
    if (!jobId) return;

    try {
      setError("");
      setStatus("loading");

      const response = await fetch(`/api/student/jobs/${jobId}/assessment`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load assessment.");
      }

      setJobTitle(data.job?.title || "Job Skill Assessment");

      if (data.status === "submitted" || data.status === "expired") {
        router.replace(`/dashboard/student/jobs/${jobId}/assessment/result`);
        return;
      }

      const assessment = data.assessment;

      if (!assessment || !Array.isArray(assessment.questions)) {
        throw new Error("Assessment questions were not returned.");
      }

      setQuestions(assessment.questions);
      setAnswers(assessment.answers || {});
      setExpiresAt(assessment.expiresAt);
      setStatus("ready");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("error");
    }
  }, [jobId, router]);

  useEffect(() => {
    loadAssessment();
  }, [loadAssessment]);

  const submitAssessment = useCallback(
    async (automatic = false) => {
      if (!jobId || submitLock.current || status !== "ready") return;

      submitLock.current = true;
      setIsSubmitting(true);
      setError("");

      try {
        const response = await fetch(`/api/student/jobs/${jobId}/assessment`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to submit assessment.");
        }

        setFinalResult(data.result || null);
        setStatus("submitted");

        router.replace(`/dashboard/student/jobs/${jobId}/assessment/result`);
      } catch (err) {
        submitLock.current = false;
        setIsSubmitting(false);
        setError(
          automatic
            ? "Time is up. We could not submit automatically. Please try submitting again."
            : err.message || "Unable to submit assessment.",
        );
      }
    },
    [answers, jobId, router, status],
  );

  // The server deadline is authoritative. This interval only displays it.
  useEffect(() => {
    if (status !== "ready" || !expiresAt) return;

    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );

      setTimeLeft(remaining);

      if (remaining <= 0 && !submitLock.current) {
        submitAssessment(true);
      }
    };

    updateTimer();

    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt, status, submitAssessment]);

  const question = questions[currentQuestion];

  const answeredCount = Object.keys(answers).length;
  const questionCount = questions.length;
  const remainingCount = Math.max(0, questionCount - answeredCount);

  const progress = questionCount
    ? Math.round(((currentQuestion + 1) / questionCount) * 100)
    : 0;

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(
    2,
    "0",
  )}:${String(timeLeft % 60).padStart(2, "0")}`;

  const evaluatedSkills = useMemo(
    () => [...new Set(questions.map((item) => item.skill).filter(Boolean))],
    [questions],
  );

  const handleAnswer = (optionIndex) => {
    if (status !== "ready" || isSubmitting || !question) return;

    setAnswers((previous) => ({
      ...previous,
      [question.id]: optionIndex,
    }));
  };

  const goToQuestion = (index) => {
    if (status !== "ready" || isSubmitting) return;

    setCurrentQuestion(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      goToQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questionCount - 1) {
      goToQuestion(currentQuestion + 1);
      return;
    }

    submitAssessment(false);
  };

  const handleExit = () => {
    setIsExiting(true);

    window.setTimeout(() => {
      router.push(`/dashboard/student/jobs/${jobId}/analysis`);
    }, 200);
  };

  if (status === "loading") {
    return (
      <main className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-14">
        <div className="mx-auto max-w-[1328px] rounded-[12px] border border-[#DCE3EE] bg-white px-5 py-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#E0E7FF] border-t-[#4F46E5]" />
          <p className="mt-4 text-[13px] font-medium text-[#64748B]">
            Preparing your AI-powered assessment...
          </p>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-14">
        <div className="mx-auto max-w-[1328px] rounded-[12px] border border-[#DCE3EE] bg-white px-5 py-10 text-center">
          <h1 className="text-[20px] font-bold text-[#111827]">
            Unable to load assessment
          </h1>
          <p className="mx-auto mt-2 max-w-[500px] text-[13px] text-[#64748B]">
            {error}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={loadAssessment}
              className="h-10 rounded-[8px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white hover:bg-[#4338CA]"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={handleExit}
              className="h-10 rounded-[8px] border border-[#DCE3EE] px-5 text-[13px] font-semibold text-[#52627B]"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!question) return null;

  return (
    <main
      className={`
        min-h-[calc(100vh-58px)]
        bg-[#F8FAFC]
        px-4
        pb-24
        pt-4
        transition-opacity
        sm:px-6
        sm:pb-8
        sm:pt-6
        lg:px-14
        lg:pb-8
        lg:pt-7
        ${isExiting ? "opacity-50" : "opacity-100"}
      `}
    >
      <div className="mx-auto w-full max-w-[1328px]">
        {/* ASSESSMENT INFORMATION */}
        <section className="rounded-[12px] border border-[#DCE3EE] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:px-5 sm:py-5 lg:px-6 lg:py-[18px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[16px] font-bold leading-6 tracking-[-0.02em] text-[#111827] sm:text-[18px]">
                  {jobTitle} Skill Assessment
                </h1>

                <span className="inline-flex items-center gap-1 rounded-full border border-[#E9D5FF] bg-[#FAF5FF] px-2 py-1 text-[10px] font-semibold text-[#7C3AED]">
                  <Sparkles size={11} />
                  AI Powered
                </span>
              </div>

              <p className="mt-1 text-[12px] text-[#64748B] sm:text-[13px]">
                Test your practical knowledge based on the requirements of this
                job.
              </p>
            </div>

            <div className="flex items-center rounded-[9px] border border-[#DCE3EE]">
              <div className="flex items-center justify-center gap-2 px-4 py-2 lg:border-r lg:border-[#DCE3EE]">
                <List size={14} className="text-[#4F46E5]" />
                <div>
                  <p className="text-[14px] font-bold leading-4 text-[#111827]">
                    {questionCount}
                  </p>
                  <p className="text-[10px] text-[#71839E]">Questions</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 border-l border-[#DCE3EE] px-4 py-2 lg:border-l-0 lg:border-r">
                <Timer size={14} className="text-[#F59E0B]" />
                <div>
                  <p className="text-[14px] font-bold leading-4 text-[#111827]">
                    5 Min
                  </p>
                  <p className="text-[10px] text-[#71839E]">Duration</p>
                </div>
              </div>

              <div className="hidden flex-wrap items-center gap-1.5 px-3 lg:flex">
                {evaluatedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-medium text-[#4F46E5]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TIMER */}
        <div className="mt-3 flex items-center justify-between rounded-[9px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-2.5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#92400E]">
            <Timer size={15} />
            Time remaining
          </div>
          <span
            className={`text-[15px] font-bold tabular-nums ${
              timeLeft <= 60 ? "text-[#DC2626]" : "text-[#B45309]"
            }`}
          >
            {formattedTime}
          </span>
        </div>

        {error && (
          <div className="mt-3 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]">
            {error}
          </div>
        )}

        {/* PROGRESS */}
        <section className="mt-4 rounded-[12px] border border-[#DCE3EE] bg-white px-4 py-4 sm:mt-5 sm:px-5 sm:py-4 lg:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#111827]">
                Question {currentQuestion + 1} of {questionCount}
              </span>
              <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-semibold text-[#4F46E5]">
                {progress}% Complete
              </span>
            </div>

            <div className="hidden items-center gap-1.5 text-[11px] text-[#64748B] sm:flex">
              <Flag size={13} />
              {remainingCount} questions remaining
            </div>
          </div>

          <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-[#EEF2FF]">
            <div
              className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {/* MAIN GRID */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_272px]">
          {/* QUESTION CARD */}
          <section className="rounded-[12px] border border-[#DCE3EE] bg-white px-4 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:px-6 sm:py-6 lg:px-9 lg:py-7">
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-[11px] font-semibold text-[#4F46E5]">
                <span className="text-[10px]">?</span>
                Question {currentQuestion + 1}
              </span>
            </div>

            <h2 className="mt-3 max-w-[900px] text-[19px] font-bold leading-[24px] tracking-[-0.02em] text-[#111827] sm:text-[21px] sm:leading-[28px] lg:text-[22px]">
              {question.question}
            </h2>

            <div className="mt-5 space-y-2.5">
              {question.options.map((option, index) => {
                const selected = answers[question.id] === index;
                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={`${question.id}-${index}`}
                    type="button"
                    disabled={isSubmitting || timeLeft <= 0}
                    onClick={() => handleAnswer(index)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-[10px] border px-3.5 py-3 text-left transition sm:px-4 sm:py-3.5 disabled:cursor-not-allowed",
                      selected
                        ? "border-[2px] border-[#4F46E5] bg-[#EEF2FF]"
                        : "border-[#DCE3EE] bg-white hover:border-[#C7D2FE] hover:bg-[#F8FAFF]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full border-2",
                        selected ? "border-[#4F46E5]" : "border-[#CBD5E1]",
                      ].join(" ")}
                    >
                      {selected && (
                        <span className="h-[9px] w-[9px] rounded-full bg-[#4F46E5]" />
                      )}
                    </span>

                    <span
                      className={[
                        "flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] text-[11px] font-bold",
                        selected
                          ? "bg-[#4F46E5] text-white"
                          : "bg-[#F1F5F9] text-[#64748B]",
                      ].join(" ")}
                    >
                      {letter}
                    </span>

                    <span
                      className={[
                        "text-[13px] leading-5 sm:text-[14px]",
                        selected
                          ? "font-semibold text-[#4F46E5]"
                          : "font-medium text-[#52627B]",
                      ].join(" ")}
                    >
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* DESKTOP NAVIGATION */}
            <div className="mt-6 hidden items-center justify-between gap-3 sm:flex">
              <button
                type="button"
                disabled={currentQuestion === 0 || isSubmitting}
                onClick={handlePrevious}
                className="inline-flex h-10 min-w-[125px] items-center justify-center gap-2 rounded-[8px] border border-[#DCE3EE] bg-white px-5 text-[13px] font-medium text-[#475569] transition hover:border-[#C7D2FE] hover:text-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
                className="inline-flex h-10 min-w-[172px] items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Submitting..."
                  : currentQuestion === questionCount - 1
                    ? "Submit Assessment"
                    : "Next Question"}
                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden space-y-4 lg:block">
            <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#111827]">
                  Questions
                </h2>
                <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[10px] font-semibold text-[#4F46E5]">
                  {currentQuestion + 1} / {questionCount}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((item, index) => {
                  const answered = answers[item.id] !== undefined;
                  const current = currentQuestion === index;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={[
                        "flex h-10 items-center justify-center rounded-[9px] border text-[12px] font-medium transition",
                        current
                          ? "border-[2px] border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                          : answered
                            ? "border-[#16A34A] bg-[#DCFCE7] text-[#16A34A]"
                            : "border-[#DCE3EE] bg-white text-[#94A3B8] hover:border-[#C7D2FE] hover:text-[#4F46E5]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-[9px] bg-[#F8FAFC] p-3">
                <p className="text-[10px] font-semibold text-[#71839E]">
                  Legend
                </p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-[3px] border border-[#16A34A] bg-[#DCFCE7]" />
                    <span className="text-[10px] text-[#52627B]">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-[3px] border border-[#4F46E5] bg-[#EEF2FF]" />
                    <span className="text-[10px] text-[#52627B]">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-[3px] border border-[#DCE3EE] bg-white" />
                    <span className="text-[10px] text-[#52627B]">
                      Not Answered
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <Code2 size={14} />
                </div>
                <h2 className="text-[13px] font-bold text-[#111827]">
                  Skills Being Evaluated
                </h2>
              </div>

              <div className="mt-3 space-y-2">
                {evaluatedSkills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 rounded-[7px] border border-[#DCE3EE] bg-[#F8FAFC] px-3 py-2"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                    <span className="text-[11px] font-medium text-[#52627B]">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>

        {/* AI INFORMATION */}
        <section className="mt-4 rounded-[10px] border border-[#E9D5FF] bg-[#F5F3FF] px-3.5 py-3 sm:px-4 lg:max-w-[1035px]">
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EDE9FE] text-[#7C3AED]">
              <Sparkles size={14} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#7C3AED]">
                AI-Powered Assessment
              </p>
              <p className="mt-0.5 text-[11px] leading-[15px] text-[#52627B] sm:text-[12px]">
                Questions are generated based on this job's requirements and
                your student profile. Your answers are evaluated securely.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* MOBILE FIXED NAVIGATION */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DCE3EE] bg-white/95 px-4 py-3 backdrop-blur-md sm:hidden">
        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={currentQuestion === 0 || isSubmitting}
            onClick={handlePrevious}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[9px] border border-[#DCE3EE] bg-white px-3 text-[13px] font-medium text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={15} />
            Previous
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNext}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[9px] bg-[#4F46E5] px-3 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting..."
              : currentQuestion === questionCount - 1
                ? "Submit"
                : "Next Question"}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </main>
  );
}
