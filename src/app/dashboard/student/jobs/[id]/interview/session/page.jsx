"use client";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Clock3,
  Code2,
  Info,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Sparkles,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "/api/student/jobs";

const EVALUATION_AREAS = [
  {
    title: "Technical Knowledge",
    icon: Code2,
    iconBg: "bg-indigo-50",
    iconColor: "text-[#5146e5]",
  },
  {
    title: "Problem Solving",
    icon: Sparkles,
    iconBg: "bg-violet-50",
    iconColor: "text-[#7c3aed]",
  },
  {
    title: "Communication",
    icon: MessageSquare,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    title: "Role Understanding",
    icon: BriefcaseBusiness,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
];

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function formatDuration(seconds) {
  const minutes = Math.floor((seconds || 0) / 60);
  const remainingSeconds = (seconds || 0) % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

export default function AIMockInterviewActivePage() {
  const router = useRouter();
  const params = useParams();

  const jobId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [job, setJob] = useState(null);
  const [interview, setInterview] = useState(null);

  // Answers are stored using the question ID returned by the backend.
  const [answers, setAnswers] = useState({});

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState("");

  const submissionStartedRef = useRef(false);

  const questions = interview?.questions || [];

  const question = questions[currentQuestion];

  const answer = question ? answers[question.id] || "" : "";

  const totalQuestions = questions.length;

  const answeredQuestions = useMemo(() => {
    return new Set(
      questions
        .filter((item) => String(answers[item.id] || "").trim().length > 0)
        .map((item) => item.id),
    );
  }, [answers, questions]);

  const answeredCount = answeredQuestions.size;

  const remainingQuestions = Math.max(totalQuestions - answeredCount, 0);

  const questionNumber = currentQuestion + 1;

  const completionPercentage = totalQuestions
    ? Math.round((questionNumber / totalQuestions) * 100)
    : 0;

  const progressWidth = `${Math.min(completionPercentage, 100)}%`;

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [remainingSeconds]);

  const durationLabel = interview?.durationSeconds
    ? formatDuration(interview.durationSeconds)
    : "10 min";

  /*
   * Load interview from the backend.
   *
   * The backend creates the interview if one does not exist.
   * Refreshing the page loads the existing interview instead.
   */
  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    async function loadInterview() {
      try {
        setIsLoading(true);
        setError("");

        const data = await apiRequest(`${API_BASE}/${jobId}/interview`, {
          method: "GET",
          cache: "no-store",
        });

        if (cancelled) return;

        const loadedInterview = data.interview;

        if (!loadedInterview) {
          throw new Error("Interview data was not returned by the server.");
        }

        setJob(data.job || null);
        setInterview(loadedInterview);
        setAnswers(loadedInterview.answers || {});

        // The server controls the actual deadline.
        if (loadedInterview.expiresAt) {
          const deadline = new Date(loadedInterview.expiresAt).getTime();

          const secondsLeft = Math.max(
            0,
            Math.ceil((deadline - Date.now()) / 1000),
          );

          setRemainingSeconds(secondsLeft);
        }

        // A completed or expired attempt should show its saved result.
        if (
          loadedInterview.status === "submitted" ||
          loadedInterview.status === "expired"
        ) {
          router.replace(`/dashboard/student/jobs/${jobId}/interview/result`);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your interview.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInterview();

    return () => {
      cancelled = true;
    };
  }, [jobId, router]);

  /*
   * Save answers to MongoDB.
   */
  const saveAnswers = useCallback(
    async (answersToSave) => {
      if (!jobId || !interview?.id) return;

      if (interview.status !== "in_progress") return;

      return apiRequest(`${API_BASE}/${jobId}/interview`, {
        method: "POST",
        body: JSON.stringify({
          action: "save",
          answers: answersToSave,
        }),
      });
    },
    [jobId, interview?.id, interview?.status],
  );

  /*
   * Automatically save answers after the user stops typing.
   *
   * This protects answers if the user refreshes or leaves the page.
   */
  useEffect(() => {
    if (
      isLoading ||
      isSubmitting ||
      !interview?.id ||
      interview.status !== "in_progress"
    ) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        await saveAnswers(answers);
      } catch (err) {
        console.error("Unable to autosave interview answers:", err);
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [
    answers,
    interview?.id,
    interview?.status,
    isLoading,
    isSubmitting,
    saveAnswers,
  ]);

  /*
   * Submit the interview.
   *
   * The backend evaluates answers using Groq and stores the result.
   * The browser never calculates or invents an interview score.
   */
  const submitInterview = useCallback(
    async (finalAnswers = answers) => {
      if (!jobId || !interview?.id) return;

      if (submissionStartedRef.current) return;

      submissionStartedRef.current = true;
      setIsSubmitting(true);
      setError("");

      try {
        const data = await apiRequest(`${API_BASE}/${jobId}/interview`, {
          method: "POST",
          body: JSON.stringify({
            action: "submit",
            answers: finalAnswers,
          }),
        });

        if (!data.result) {
          throw new Error(
            "The interview was submitted, but no result was returned.",
          );
        }

        setInterview(data.interview || interview);

        router.replace(`/dashboard/student/jobs/${jobId}/interview/result`);
      } catch (err) {
        submissionStartedRef.current = false;
        setIsSubmitting(false);
        setError(
          err.message || "Unable to submit your interview. Please try again.",
        );
      }
    },
    [answers, interview, jobId, router],
  );

  /*
   * Server-authoritative countdown.
   *
   * It uses expiresAt rather than decrementing a timer from its
   * initial value, so refreshing does not restart the interview.
   */
  useEffect(() => {
    if (
      isLoading ||
      !interview?.expiresAt ||
      interview.status !== "in_progress"
    ) {
      return;
    }

    const deadline = new Date(interview.expiresAt).getTime();

    const updateTimer = () => {
      const secondsLeft = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );

      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        submitInterview(answers);
      }
    };

    updateTimer();

    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, [
    answers,
    interview?.expiresAt,
    interview?.status,
    isLoading,
    submitInterview,
  ]);

  /*
   * Save current answer locally.
   */
  const handleAnswerChange = (event) => {
    const value = event.target.value;

    if (!question || value.length > 3000) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }));
  };

  /*
   * Move to the next question.
   */
  const handleNext = () => {
    if (isSubmitting || !question) return;

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) return;

    const updatedAnswers = {
      ...answers,
      [question.id]: trimmedAnswer,
    };

    setAnswers(updatedAnswers);

    if (currentQuestion === totalQuestions - 1) {
      submitInterview(updatedAnswers);
      return;
    }

    setCurrentQuestion((previous) => previous + 1);
  };

  /*
   * Previous question.
   */
  const handlePrevious = () => {
    if (currentQuestion === 0 || isSubmitting) return;

    setCurrentQuestion((previous) => previous - 1);
  };

  /*
   * Navigate to an available question.
   */
  const handleQuestionJump = (index) => {
    if (isSubmitting) return;

    const targetQuestion = questions[index];

    if (!targetQuestion) return;

    const isAnswered = answeredQuestions.has(targetQuestion.id);

    const canOpen = index <= currentQuestion || isAnswered;

    if (!canOpen) return;

    setCurrentQuestion(index);
  };

  /*
   * Exit interview.
   *
   * The current answers are saved before leaving.
   * The backend keeps the same attempt and deadline.
   */
  const handleExit = async () => {
    if (isExiting || isSubmitting) return;

    const confirmed = window.confirm(
      "Are you sure you want to exit the interview? Your saved progress will be available when you return, but the timer will continue.",
    );

    if (!confirmed) return;

    setIsExiting(true);

    try {
      await saveAnswers(answers);

      router.push(`/dashboard/student/jobs/${jobId}/interview`);
    } catch (err) {
      setError(err.message || "Unable to save your progress before exiting.");
      setIsExiting(false);
    }
  };

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
        <div className="w-full max-w-sm rounded-[12px] border border-[#dce4ef] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <Sparkles size={22} className="animate-pulse text-[#5146e5]" />
          </div>

          <h2 className="mt-4 text-[15px] font-bold text-[#172033]">
            Preparing your AI interview
          </h2>

          <p className="mt-2 text-[12px] leading-5 text-[#71829a]">
            Generating your job-specific questions. This may take a few moments.
          </p>

          <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-indigo-50">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#5146e5]" />
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error / unavailable state.
   */
  if (!interview || !questions.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
        <div className="w-full max-w-md rounded-[12px] border border-[#dce4ef] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Info size={20} />
          </div>

          <h2 className="mt-4 text-[16px] font-bold text-[#172033]">
            Unable to load interview
          </h2>

          <p className="mt-2 text-[12px] leading-5 text-[#71829a]">
            {error ||
              "We could not find an active interview session for this job."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard/student/jobs")}
            className="mt-5 rounded-[8px] bg-[#5146e5] px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#453bcf]"
          >
            Back to Jobs
          </button>
        </div>
      </main>
    );
  }

  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto w-full px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
        {/* Error notification */}
        {error && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-[9px] border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-6">
          {/* LEFT: MAIN QUESTION */}
          <section className="rounded-[12px] border border-[#dce4ef] bg-white p-4 shadow-[0_2px_7px_rgba(15,23,42,0.04)] sm:p-5 lg:p-7">
            {/* Question header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#e5eaf1] pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-[7px] bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-[#5146e5] sm:text-[11px]">
                  Question {questionNumber}
                </span>

                <span className="rounded-[7px] bg-[#fff3cf] px-3 py-1.5 text-[10px] font-semibold text-[#a65a00] sm:text-[11px]">
                  &lt;&gt; {question.category}
                </span>
              </div>

              {/* Mobile timer */}
              <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-[#172033] lg:hidden">
                <Clock3
                  size={13}
                  strokeWidth={1.8}
                  className="text-[#5146e5]"
                />
                {formattedTime}
              </div>

              {/* Desktop timer */}
              <div className="hidden items-center gap-1.5 rounded-[7px] bg-indigo-50 px-3 py-1.5 text-[10px] font-bold text-[#5146e5] lg:flex">
                <Clock3 size={13} strokeWidth={1.8} />
                {formattedTime} remaining
              </div>
            </div>

            {/* Question */}
            <div className="pt-5 lg:pt-6">
              <h2 className="max-w-[680px] text-[19px] font-bold leading-[1.42] tracking-[-0.25px] text-[#172033] sm:text-[21px] lg:text-[23px] lg:leading-[1.4]">
                {question.question}
              </h2>

              <p className="mt-4 max-w-[700px] text-[13px] leading-6 text-[#61738e] sm:text-[14px] lg:text-[15px] lg:leading-6">
                Take a moment to structure your answer before submitting.
                <span className="hidden lg:inline">
                  {" "}
                  Consider the key components, architecture decisions and
                  technologies involved.
                </span>
              </p>
            </div>

            {/* AI Coach */}
            <div className="mt-5 rounded-[10px] border border-[#e7defc] bg-[#f6f2ff] p-3.5 sm:p-4 lg:mt-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#ede9fe] text-[#7c3aed]">
                  <Sparkles size={15} strokeWidth={1.7} />
                </div>

                <h3 className="text-[12px] font-semibold text-[#7c3aed] sm:text-[13px]">
                  AI Interview Coach
                </h3>

                <Sparkles
                  size={13}
                  strokeWidth={1.8}
                  className="ml-auto text-[#7c3aed]"
                />
              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#4f5f78] sm:text-[12px] sm:leading-5 lg:text-[13px]">
                {question.tip ||
                  "Explain your approach clearly and include a practical example."}
              </p>
            </div>

            {/* Answer */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="answer"
                  className="text-[12px] font-semibold text-[#172033] sm:text-[13px]"
                >
                  Your Answer
                </label>

                <span
                  className={`text-[10px] sm:text-[11px] ${
                    answer.length >= 900
                      ? "font-semibold text-amber-500"
                      : "text-[#8fa0b7]"
                  }`}
                >
                  {answer.length} / 3000
                  <span className="hidden sm:inline"> characters</span>
                </span>
              </div>

              <textarea
                id="answer"
                value={answer}
                onChange={handleAnswerChange}
                maxLength={3000}
                disabled={isSubmitting || remainingSeconds <= 0}
                placeholder="Type your answer here..."
                className="min-h-[228px] w-full resize-none rounded-[10px] border border-[#5146e5] bg-white px-3.5 py-3.5 text-[13px] leading-5 text-[#172033] outline-none ring-0 placeholder:text-[#9aabc1] focus:border-[#5146e5] focus:ring-2 focus:ring-[#5146e5]/10 disabled:bg-slate-50 sm:min-h-[250px] sm:text-[14px] lg:min-h-[252px]"
              />

              <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-[#8fa0b7] sm:text-[11px]">
                <Info size={12} strokeWidth={1.6} className="mt-0.5 shrink-0" />

                <span>
                  Tip:{" "}
                  {question.tip ||
                    "Support your answer with a practical example."}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0 || isSubmitting}
                  className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#dce4ef] bg-white px-4 text-[11px] font-semibold text-[#52627a] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-[12px]"
                >
                  <ArrowLeft size={14} strokeWidth={1.8} />

                  <span className="hidden sm:inline">Previous Question</span>

                  <span className="sm:hidden">Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    isSubmitting || remainingSeconds <= 0 || !answer.trim()
                  }
                  className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#5146e5] px-5 text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#453bcf] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-[12px]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <span>
                        {isLastQuestion ? "Finish Interview" : "Next Question"}
                      </span>

                      <ArrowRight size={14} strokeWidth={1.8} />
                    </>
                  )}
                </button>
              </div>

              {/* Mobile question dots */}
              <div className="mt-3 flex flex-col items-center gap-2 lg:hidden">
                <div className="flex items-center gap-1.5">
                  {questions.map((item, index) => {
                    const isAnswered = answeredQuestions.has(item.id);
                    const isCurrent = index === currentQuestion;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleQuestionJump(index)}
                        disabled={
                          isSubmitting ||
                          !(index <= currentQuestion || isAnswered)
                        }
                        aria-label={`Go to question ${index + 1}`}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          isCurrent
                            ? "bg-[#5146e5]"
                            : isAnswered
                              ? "bg-[#16a34a]"
                              : "bg-[#dce3ed]"
                        } ${
                          index > currentQuestion && !isAnswered
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      />
                    );
                  })}
                </div>

                <span className="text-[10px] text-[#8fa0b7]">
                  {remainingQuestions} questions remaining
                </span>
              </div>

              {/* Desktop dots */}
              <div className="mt-4 hidden items-center justify-center gap-1.5 lg:flex">
                {questions.map((item, index) => {
                  const isAnswered = answeredQuestions.has(item.id);
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      disabled={
                        isSubmitting ||
                        !(index <= currentQuestion || isAnswered)
                      }
                      aria-label={`Go to question ${index + 1}`}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        isCurrent
                          ? "bg-[#5146e5]"
                          : isAnswered
                            ? "bg-[#16a34a]"
                            : "bg-[#dce3ed]"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-3 lg:space-y-4">
            {/* Interview Progress */}
            <section className="rounded-[12px] border border-[#dce4ef] bg-white p-4 shadow-[0_2px_7px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                    <Layers3 size={15} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                    Interview Progress
                  </h2>
                </div>

                <span className="text-[11px] font-bold text-[#5146e5]">
                  {questionNumber}/{totalQuestions}
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9edff]">
                <div
                  className="h-full rounded-full bg-[#5146e5] transition-all duration-300"
                  style={{ width: progressWidth }}
                />
              </div>

              <div className="mt-3 grid grid-cols-8 gap-1.5">
                {questions.map((item, index) => {
                  const isAnswered = answeredQuestions.has(item.id);
                  const isCurrent = currentQuestion === index;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      disabled={
                        isSubmitting ||
                        !(index <= currentQuestion || isAnswered)
                      }
                      className={`flex h-10 items-center justify-center rounded-[8px] border text-[11px] font-medium transition ${
                        isCurrent
                          ? "border-[#5146e5] bg-[#5146e5] text-white"
                          : isAnswered
                            ? "border-[#d1f3dc] bg-[#dcfce7] text-[#16a34a]"
                            : "border-[#dce4ef] bg-white text-[#8da0b7]"
                      } ${
                        index > currentQuestion && !isAnswered
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[9px] text-[#71829a] sm:text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
                  Answered ({answeredCount})
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5146e5]" />
                  Current
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#dce3ed]" />
                  Remaining ({remainingQuestions})
                </span>
              </div>
            </section>

            {/* Interview Details */}
            <section className="rounded-[12px] border border-[#dce4ef] bg-white p-4 shadow-[0_2px_7px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-indigo-50 text-[#5146e5]">
                  <Info size={15} strokeWidth={1.7} />
                </div>

                <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                  Interview Details
                </h2>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between gap-3 border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Job
                  </span>

                  <span className="text-right text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {job?.title || "Mock Interview"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Company
                  </span>

                  <span className="text-right text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {job?.company || "Company"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Questions
                  </span>

                  <span className="text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {totalQuestions} Total
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Duration
                  </span>

                  <span className="text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {durationLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Location
                  </span>

                  <span className="text-[10px] font-semibold text-[#172033]">
                    {job?.location || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Current Skill
                  </span>

                  <span className="rounded-[6px] bg-indigo-50 px-2.5 py-1 text-[9px] font-medium text-[#5146e5] sm:text-[10px]">
                    {question.skill || "General"}
                  </span>
                </div>
              </div>
            </section>

            {/* Evaluating */}
            <section className="rounded-[12px] border border-[#dce4ef] bg-white p-4 shadow-[0_2px_7px_rgba(15,23,42,0.04)] sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#f0eaff] text-[#7c3aed]">
                  <Sparkles size={15} strokeWidth={1.7} />
                </div>

                <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
                  Evaluating
                </h2>
              </div>

              <div className="mt-3 space-y-2">
                {EVALUATION_AREAS.map((area) => {
                  const Icon = area.icon;

                  return (
                    <div key={area.title} className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-[7px] ${area.iconBg} ${area.iconColor}`}
                      >
                        <Icon size={14} strokeWidth={1.7} />
                      </div>

                      <span className="text-[11px] font-medium text-[#475873] sm:text-[12px]">
                        {area.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#8fa0b7] sm:text-[10px]">
                <LockKeyhole size={11} strokeWidth={1.6} />
                Scores visible after submission
              </div>
            </section>

            {/* AI Coach */}
            <section className="rounded-[12px] border border-[#e5defd] bg-[#f6f2ff] p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#ede9fe] text-[#7c3aed]">
                  <Sparkles size={15} strokeWidth={1.7} />
                </div>

                <h2 className="text-[12px] font-semibold text-[#7c3aed] sm:text-[13px]">
                  AI Interview Coach
                </h2>

                <Sparkles
                  size={13}
                  strokeWidth={1.8}
                  className="ml-auto text-[#7c3aed]"
                />
              </div>

              <div className="my-3 h-px bg-[#e7defc]" />

              <p className="text-[10px] leading-5 text-[#586984] sm:text-[11px]">
                Answer naturally. Your responses are saved automatically and
                evaluated after the interview is complete.
              </p>
            </section>
          </aside>
        </div>

        {/* Mobile Exit */}
        <div className="mt-3 flex justify-center lg:hidden">
          <button
            type="button"
            onClick={handleExit}
            disabled={isExiting || isSubmitting}
            className="flex items-center gap-1.5 text-[10px] font-medium text-[#71829a] transition hover:text-[#5146e5] disabled:opacity-50"
          >
            <X size={12} strokeWidth={1.8} />

            {isExiting ? "Saving..." : "Exit Interview"}
          </button>
        </div>

        {/* Desktop Exit */}
        <div className="mt-4 hidden justify-center lg:flex">
          <button
            type="button"
            onClick={handleExit}
            disabled={isExiting || isSubmitting}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[#71829a] transition hover:text-[#5146e5] disabled:opacity-50"
          >
            <X size={13} strokeWidth={1.8} />

            {isExiting ? "Saving..." : "Exit Interview"}
          </button>
        </div>
      </div>
    </main>
  );
}
