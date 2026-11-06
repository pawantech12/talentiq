"use client";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Info,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Play,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function AIMockInterviewActivePage() {
  const router = useRouter();

  /*
   * Interview data
   */
  const interview = {
    job: "Full Stack Developer",
    company: "ABC Technologies",
    location: "Mumbai",
    questions: 8,
    duration: "10–15 min",

    skills: ["React", "JavaScript", "Node.js", "MongoDB"],

    evaluationAreas: [
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
    ],

    questionsData: [
      {
        id: 1,
        category: "Technical",
        question:
          "Tell me about yourself and your experience with full-stack development.",
        tip: "Briefly explain your background, experience and the technologies you have worked with.",
        skill: "React",
      },
      {
        id: 2,
        category: "Technical",
        question:
          "How would you design a scalable frontend architecture for a large React application?",
        tip: "Explain how you would structure components, state management and reusable modules.",
        skill: "React",
      },
      {
        id: 3,
        category: "Technical",
        question:
          "How would you design a scalable REST API using Node.js and Express?",
        tip: "Explain your approach, key technologies and why you would choose them.",
        skill: "Node.js",
      },
      {
        id: 4,
        category: "Problem Solving",
        question:
          "How would you troubleshoot a slow API response in a production application?",
        tip: "Walk through your debugging process and explain how you would identify the bottleneck.",
        skill: "Node.js",
      },
      {
        id: 5,
        category: "Technical",
        question:
          "How would you optimize a MongoDB database for an application with millions of records?",
        tip: "Discuss indexing, query optimization, schema design and monitoring.",
        skill: "MongoDB",
      },
      {
        id: 6,
        category: "Communication",
        question:
          "Describe a difficult technical problem you faced and how you communicated the solution.",
        tip: "Focus on the situation, your approach, communication and final outcome.",
        skill: "JavaScript",
      },
      {
        id: 7,
        category: "Problem Solving",
        question:
          "How would you handle a sudden increase in traffic to your application?",
        tip: "Discuss scalability, caching, load balancing and monitoring.",
        skill: "Node.js",
      },
      {
        id: 8,
        category: "Role Understanding",
        question:
          "What would be your priorities during your first month in this role?",
        tip: "Explain how you would understand the product, team, codebase and business requirements.",
        skill: "React",
      },
    ],
  };

  /*
   * Current question.
   *
   * Starts at Question 3 to match the supplied design.
   */
  const [currentQuestion, setCurrentQuestion] = useState(0);

  /*
   * Answers are stored per question so moving back and forth
   * does not lose previously entered answers.
   */
  const [answers, setAnswers] = useState(Array(interview.questions).fill(""));

  /*
   * First two questions are already answered in the supplied
   * active-interview screenshot.
   */
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set([0, 0]));

  /*
   * Screenshot starts at 08:42.
   * 8 minutes 42 seconds = 522 seconds.
   */
  const [remainingSeconds, setRemainingSeconds] = useState(522);

  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = interview.questionsData[currentQuestion];

  const answer = answers[currentQuestion] || "";

  /*
   * Countdown timer
   */
  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [remainingSeconds]);

  /*
   * Format timer as MM:SS
   */
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [remainingSeconds]);

  /*
   * Current progress
   */
  const questionNumber = currentQuestion + 1;

  const completionPercentage = Math.round(
    (questionNumber / interview.questions) * 100,
  );

  const answeredCount = answeredQuestions.size;

  const remainingQuestions = Math.max(interview.questions - answeredCount, 0);

  /*
   * Save current answer
   */
  const handleAnswerChange = (event) => {
    const value = event.target.value;

    if (value.length > 1000) {
      return;
    }

    setAnswers((previous) => {
      const next = [...previous];
      next[currentQuestion] = value;
      return next;
    });
  };

  /*
   * Move to next question.
   */
  const handleNext = () => {
    if (isSubmitting) return;

    const trimmedAnswer = answer.trim();

    /*
     * Do not allow empty answer to be submitted.
     */
    if (!trimmedAnswer) {
      return;
    }

    const updatedAnswered = new Set(answeredQuestions);
    updatedAnswered.add(currentQuestion);

    setAnsweredQuestions(updatedAnswered);

    /*
     * Last question -> assessment result
     */
    if (currentQuestion === interview.questions - 1) {
      setIsSubmitting(true);

      try {
        sessionStorage.setItem(
          "resumeai-assessment-result",
          JSON.stringify({
            totalQuestions: interview.questions,
            correctAnswers: 8,
            timeTaken: 11 * 60,
            resumeMatch: 86,
            skills: [
              {
                name: "React",
                score: 90,
              },
              {
                name: "JavaScript",
                score: 85,
              },
              {
                name: "Node.js",
                score: 80,
              },
              {
                name: "MongoDB",
                score: 75,
              },
            ],
          }),
        );
      } catch (error) {
        console.error("Unable to save assessment result:", error);
      }

      window.setTimeout(() => {
        router.push("/dashboard/student/interview/result");
      }, 350);

      return;
    }

    setCurrentQuestion((previous) => previous + 1);
  };

  /*
   * Previous question
   */
  const handlePrevious = () => {
    if (currentQuestion === 0 || isSubmitting) {
      return;
    }

    setCurrentQuestion((previous) => previous - 1);
  };

  /*
   * Clicking a progress question
   */
  const handleQuestionJump = (index) => {
    if (isSubmitting) return;

    /*
     * Only allow jumping to already answered questions,
     * current question, or the next available question.
     */
    const canOpen = index <= currentQuestion || answeredQuestions.has(index);

    if (!canOpen) {
      return;
    }

    setCurrentQuestion(index);
  };

  /*
   * Exit interview
   */
  const handleExit = () => {
    if (isExiting) return;

    const confirmed = window.confirm(
      "Are you sure you want to exit the interview? Your current progress may not be saved.",
    );

    if (!confirmed) {
      return;
    }

    setIsExiting(true);

    window.setTimeout(() => {
      router.push("/dashboard/student/interview");
    }, 250);
  };

  /*
   * Top progress status
   */
  const progressWidth = `${Math.min(completionPercentage, 100)}%`;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {/* =========================================================
          MAIN CONTENT
         ========================================================= */}
      <div className="mx-auto w-full px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-7">
        {/* =======================================================
            DESKTOP 2 COLUMN / MOBILE 1 COLUMN
           ======================================================= */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-6">
          {/* =====================================================
              LEFT / MAIN QUESTION
             ===================================================== */}
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
                {currentQuestion === 2
                  ? "Explain your approach clearly and mention the technologies you would use. Include how you would structure your API endpoints and handle middleware."
                  : question.tip}
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
                  {answer.length} / 1000
                  <span className="hidden sm:inline"> characters</span>
                </span>
              </div>

              <textarea
                id="answer"
                value={answer}
                onChange={handleAnswerChange}
                maxLength={1000}
                placeholder="Type your answer here..."
                className="min-h-[228px] w-full resize-none rounded-[10px] border border-[#5146e5] bg-white px-3.5 py-3.5 text-[13px] leading-5 text-[#172033] outline-none ring-0 placeholder:text-[#9aabc1] focus:border-[#5146e5] focus:ring-2 focus:ring-[#5146e5]/10 sm:min-h-[250px] sm:text-[14px] lg:min-h-[252px]"
              />

              <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-[#8fa0b7] sm:text-[11px]">
                <Info size={12} strokeWidth={1.6} className="mt-0.5 shrink-0" />

                <span>Tip: {question.tip}</span>
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
                  disabled={isSubmitting || !answer.trim()}
                  className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#5146e5] px-5 text-[11px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#453bcf] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-[12px]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span>
                        {currentQuestion === interview.questions - 1
                          ? "Finish Interview"
                          : "Next Question"}
                      </span>

                      <ArrowRight size={14} strokeWidth={1.8} />
                    </>
                  )}
                </button>
              </div>

              {/* Mobile question dots */}
              <div className="mt-3 flex flex-col items-center gap-2 lg:hidden">
                <div className="flex items-center gap-1.5">
                  {interview.questionsData.map((_, index) => {
                    const isAnswered = answeredQuestions.has(index);
                    const isCurrent = index === currentQuestion;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleQuestionJump(index)}
                        disabled={
                          !(
                            index <= currentQuestion ||
                            answeredQuestions.has(index)
                          )
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
                {interview.questionsData.map((_, index) => {
                  const isAnswered = answeredQuestions.has(index);
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      disabled={
                        !(
                          index <= currentQuestion ||
                          answeredQuestions.has(index)
                        )
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

          {/* =====================================================
              RIGHT SIDEBAR
             ===================================================== */}
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
                  {questionNumber}/{interview.questions}
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9edff]">
                <div
                  className="h-full rounded-full bg-[#5146e5] transition-all duration-300"
                  style={{ width: progressWidth }}
                />
              </div>

              <div className="mt-3 grid grid-cols-8 gap-1.5">
                {interview.questionsData.map((_, index) => {
                  const isAnswered = answeredQuestions.has(index);
                  const isCurrent = currentQuestion === index;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleQuestionJump(index)}
                      disabled={
                        !(
                          index <= currentQuestion ||
                          answeredQuestions.has(index)
                        )
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
                  Remaining ({Math.max(interview.questions - answeredCount, 0)})
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
                <div className="flex items-center justify-between border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Job
                  </span>

                  <span className="text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {interview.job}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Company
                  </span>

                  <span className="text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {interview.company}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Questions
                  </span>

                  <span className="text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {interview.questions} Total
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#dce4ef] py-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Duration
                  </span>

                  <span className="text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                    {interview.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-[#8ca0b8] sm:text-[11px]">
                    Current Skill
                  </span>

                  <span className="rounded-[6px] bg-indigo-50 px-2.5 py-1 text-[9px] font-medium text-[#5146e5] sm:text-[10px]">
                    {question.skill}
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
                {interview.evaluationAreas.map((area) => {
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

                <h2 className="text-[12px] font-semibold text-[#172033] sm:text-[13px]">
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
                Answer naturally. Your responses will be evaluated after the
                interview is complete.
              </p>
            </section>
          </aside>
        </div>

        {/* =======================================================
            MOBILE EXIT
           ======================================================= */}
        <div className="mt-3 flex justify-center lg:hidden">
          <button
            type="button"
            onClick={handleExit}
            disabled={isExiting}
            className="flex items-center gap-1.5 text-[10px] font-medium text-[#71829a] transition hover:text-[#5146e5] disabled:opacity-50"
          >
            <X size={12} strokeWidth={1.8} />
            Exit Interview
          </button>
        </div>
      </div>
    </main>
  );
}
