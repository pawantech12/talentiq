"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Code2,
  Flag,
  List,
  Sparkles,
  Timer,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function SkillAssessmentPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params?.id;

  /*
   * ============================================================
   * QUESTIONS
   * ============================================================
   */

  const questions = useMemo(
    () => [
      {
        id: 1,
        question: "What is JavaScript primarily used for?",
        options: [
          "Styling web pages",
          "Adding behavior and interactivity to web pages",
          "Managing physical servers",
          "Creating database tables",
        ],
        answer: 1,
      },

      {
        id: 2,
        question: "Which hook is used to manage state in a React component?",
        options: ["useEffect", "useState", "useContext", "useMemo"],
        answer: 1,
      },

      {
        id: 3,
        question: "What is the main purpose of React components?",
        options: [
          "Manage database connections",
          "Build reusable UI elements",
          "Create server-side APIs",
          "Configure web servers",
        ],
        answer: 1,
      },

      {
        id: 4,
        question:
          "Which runtime is commonly used to run JavaScript on the server?",
        options: ["Node.js", "React", "HTML", "CSS"],
        answer: 0,
      },

      {
        id: 5,
        question: "Which MongoDB feature is used to group related documents?",
        options: ["Collections", "Components", "Routes", "Hooks"],
        answer: 0,
      },

      {
        id: 6,
        question: "Which HTTP method is commonly used to create a resource?",
        options: ["GET", "POST", "DELETE", "OPTIONS"],
        answer: 1,
      },

      {
        id: 7,
        question: "What does Express.js primarily provide?",
        options: [
          "A Node.js web framework",
          "A database engine",
          "A CSS framework",
          "A browser engine",
        ],
        answer: 0,
      },

      {
        id: 8,
        question: "Which command starts a typical Next.js development server?",
        options: [
          "npm run dev",
          "npm run database",
          "npm start-react",
          "npm run server-only",
        ],
        answer: 0,
      },

      {
        id: 9,
        question: "Which data format is commonly used by REST APIs?",
        options: ["JSON", "PSD", "SVG only", "MP3"],
        answer: 0,
      },

      {
        id: 10,
        question:
          "Which React feature allows a component to receive data from its parent?",
        options: ["Props", "Indexes", "Middleware", "Schemas"],
        answer: 0,
      },
    ],
    [],
  );

  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({});

  const [submitted, setSubmitted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const [isExiting, setIsExiting] = useState(false);

  const question = questions[currentQuestion];

  /*
   * ============================================================
   * DERIVED VALUES
   * ============================================================
   */

  const answeredCount = Object.keys(answers).length;

  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  const remainingCount = questions.length - answeredCount;

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(
    2,
    "0",
  )}:${String(timeLeft % 60).padStart(2, "0")}`;

  /*
   * ============================================================
   * TIMER
   * ============================================================
   */

  useEffect(() => {
    if (submitted || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, timeLeft]);

  /*
   * ============================================================
   * SELECT ANSWER
   * ============================================================
   */

  const handleAnswer = (optionIndex) => {
    if (submitted) return;

    setAnswers((previous) => ({
      ...previous,
      [question.id]: optionIndex,
    }));
  };

  /*
   * ============================================================
   * QUESTION NAVIGATION
   * ============================================================
   */

  const goToQuestion = (index) => {
    if (submitted) return;

    setCurrentQuestion(index);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) return;

    goToQuestion(currentQuestion - 1);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      goToQuestion(currentQuestion + 1);
      return;
    }

    if (answeredCount !== questions.length) {
      const firstUnansweredIndex = questions.findIndex(
        (item) => answers[item.id] === undefined,
      );

      if (firstUnansweredIndex !== -1) {
        goToQuestion(firstUnansweredIndex);
      }

      return;
    }

    handleSubmitAssessment();
  };

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  const handleSubmitAssessment = () => {
    const correctAnswers = questions.reduce((total, item) => {
      if (answers[item.id] === item.answer) {
        return total + 1;
      }

      return total;
    }, 0);

    const totalQuestions = questions.length;

    const timeTaken = 15 * 60 - timeLeft;

    /*
     * Calculate basic skill performance.
     *
     * Question mapping:
     * 1,2,3,10 -> React / JavaScript
     * 4,7 -> Node.js
     * 5 -> MongoDB
     * 6,8,9 -> General Full Stack
     */

    const skillQuestions = {
      React: [2, 3, 10],
      JavaScript: [1, 6, 9],
      "Node.js": [4, 7, 8],
      MongoDB: [5],
    };

    const skills = Object.entries(skillQuestions).map(
      ([skillName, questionIds]) => {
        const correct = questionIds.reduce((total, questionId) => {
          const question = questions.find((item) => item.id === questionId);

          if (question && answers[question.id] === question.answer) {
            return total + 1;
          }

          return total;
        }, 0);

        return {
          name: skillName,
          score: Math.round((correct / questionIds.length) * 100),
          type:
            correct / questionIds.length >= 0.85
              ? "strong"
              : correct / questionIds.length < 0.8
                ? "improvement"
                : "normal",
        };
      },
    );

    const assessmentResult = {
      correctAnswers,
      totalQuestions,
      timeTaken,
      resumeMatch: 86,
      skills,
    };

    sessionStorage.setItem(
      "resumeai-assessment-result",
      JSON.stringify(assessmentResult),
    );

    router.push(`/dashboard/student/jobs/${jobId}/assessment/result`);
  };

  /*
   * ============================================================
   * EXIT
   * ============================================================
   */

  const handleExit = () => {
    setIsExiting(true);

    setTimeout(() => {
      router.push(`/dashboard/student/jobs/${jobId}/analysis`);
    }, 200);
  };

  /*
   * ============================================================
   * SUBMITTED SCREEN
   * ============================================================
   */

  if (submitted) {
    const correctAnswers = questions.reduce((total, item) => {
      if (answers[item.id] === item.answer) {
        return total + 1;
      }

      return total;
    }, 0);

    const finalScore = Math.round((correctAnswers / questions.length) * 100);

    return (
      <main className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] px-4 py-5 sm:px-6 sm:py-8 lg:px-14 lg:py-8">
        <div className="mx-auto w-full max-w-[1328px]">
          <section className="rounded-[12px] border border-[#DCE3EE] bg-white px-5 py-8 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-10 sm:py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
              <Check size={27} strokeWidth={2} />
            </div>

            <h1 className="mt-5 text-[22px] font-bold text-[#111827] sm:text-[26px]">
              Assessment Completed
            </h1>

            <p className="mx-auto mt-2 max-w-[500px] text-[13px] leading-5 text-[#64748B] sm:text-[14px]">
              Your skill assessment has been completed successfully. Your
              responses will be used to calculate your final compatibility
              score.
            </p>

            <div className="mx-auto mt-6 grid max-w-[500px] grid-cols-2 overflow-hidden rounded-[10px] border border-[#DCE3EE]">
              <div className="py-4">
                <p className="text-[25px] font-bold text-[#4F46E5]">
                  {finalScore}%
                </p>

                <p className="mt-1 text-[11px] text-[#64748B]">
                  Assessment Score
                </p>
              </div>

              <div className="border-l border-[#DCE3EE] py-4">
                <p className="text-[25px] font-bold text-[#16A34A]">
                  {correctAnswers}/{questions.length}
                </p>

                <p className="mt-1 text-[11px] text-[#64748B]">
                  Correct Answers
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/student/jobs/${jobId}/analysis`)
                }
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-[8px]
                  bg-[#4F46E5]
                  px-5
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-[0_4px_10px_rgba(79,70,229,0.18)]
                  transition
                  hover:bg-[#4338CA]
                "
              >
                View Resume Analysis
                <ArrowRight size={15} />
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * MAIN PAGE
   * ============================================================
   */

  return (
    <main
      className="
        min-h-[calc(100vh-58px)]
        bg-[#F8FAFC]
        px-4
        pb-24
        pt-4
        sm:px-6
        sm:pb-8
        sm:pt-6
        lg:px-14
        lg:pb-8
        lg:pt-7
      "
    >
      <div className="mx-auto w-full max-w-[1328px]">
        {/* ==================================================
            ASSESSMENT INFORMATION
        =================================================== */}

        <section
          className="
            rounded-[12px]
            border
            border-[#DCE3EE]
            bg-white
            px-4
            py-4
            shadow-[0_1px_3px_rgba(15,23,42,0.03)]
            sm:px-5
            sm:py-5
            lg:px-6
            lg:py-[18px]
          "
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1
                  className="
                    text-[16px]
                    font-bold
                    leading-6
                    tracking-[-0.02em]
                    text-[#111827]
                    sm:text-[18px]
                    lg:text-[18px]
                  "
                >
                  Full Stack Developer Skill Assessment
                </h1>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded-full
                    border
                    border-[#E9D5FF]
                    bg-[#FAF5FF]
                    px-2
                    py-1
                    text-[10px]
                    font-semibold
                    text-[#7C3AED]
                  "
                >
                  <Sparkles size={11} strokeWidth={1.8} />
                  AI Powered
                </span>
              </div>

              <p className="mt-1 text-[12px] text-[#64748B] sm:text-[13px]">
                Test your practical knowledge based on the requirements of this
                job.
              </p>
            </div>

            {/* Assessment statistics */}
            <div
              className="
                
                
                flex items-center
                
                rounded-[9px]
                border
                border-[#DCE3EE]
                
              "
            >
              {/* Questions */}
              <div className="flex items-center justify-center gap-2 px-4 py-2 lg:border-r lg:border-[#DCE3EE]">
                <List size={14} strokeWidth={1.7} className="text-[#4F46E5]" />

                <div>
                  <p className="text-[14px] font-bold leading-4 text-[#111827]">
                    10
                  </p>

                  <p className="text-[10px] text-[#71839E]">Questions</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-center gap-2 border-l border-[#DCE3EE] px-4 py-2 lg:border-l-0 lg:border-r">
                <Timer size={14} strokeWidth={1.7} className="text-[#F59E0B]" />

                <div>
                  <p className="text-[14px] font-bold leading-4 text-[#111827]">
                    15 Min
                  </p>

                  <p className="text-[10px] text-[#71839E]">Duration</p>
                </div>
              </div>

              {/* Skills */}
              <div className="hidden items-center gap-1.5 px-3 lg:flex">
                {["React", "JavaScript", "Node.js", "MongoDB"].map((skill) => (
                  <span
                    key={skill}
                    className="
                        rounded-full
                        bg-[#EEF2FF]
                        px-2.5
                        py-1
                        text-[10px]
                        font-medium
                        text-[#4F46E5]
                      "
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            PROGRESS
        =================================================== */}

        <section
          className="
            mt-4
            rounded-[12px]
            border
            border-[#DCE3EE]
            bg-white
            px-4
            py-4
            sm:mt-5
            sm:px-5
            sm:py-4
            lg:px-5
          "
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#111827]">
                Question {currentQuestion + 1} of {questions.length}
              </span>

              <span
                className="
                  rounded-full
                  bg-[#EEF2FF]
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-[#4F46E5]
                "
              >
                {progress}% Complete
              </span>
            </div>

            <div className="hidden items-center gap-1.5 text-[11px] text-[#64748B] sm:flex">
              <Flag size={13} strokeWidth={1.7} />
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

        {/* ==================================================
            MAIN ASSESSMENT GRID
        =================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_272px]">
          {/* ==================================================
              QUESTION CARD
          =================================================== */}

          <section
            className="
              rounded-[12px]
              border
              border-[#DCE3EE]
              bg-white
              px-4
              py-5
              shadow-[0_1px_3px_rgba(15,23,42,0.03)]
              sm:px-6
              sm:py-6
              lg:px-9
              lg:py-7
            "
          >
            {/* Question label */}
            <div className="flex items-center">
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-[#EEF2FF]
                  px-3
                  py-1.5
                  text-[11px]
                  font-semibold
                  text-[#4F46E5]
                "
              >
                <span className="text-[10px]">?</span>
                Question {question.id}
              </span>
            </div>

            {/* Question */}
            <h2
              className="
                mt-3
                max-w-[900px]
                text-[19px]
                font-bold
                leading-[24px]
                tracking-[-0.02em]
                text-[#111827]
                sm:text-[21px]
                sm:leading-[28px]
                lg:text-[22px]
              "
            >
              {question.question}
            </h2>

            {/* Options */}
            <div className="mt-5 space-y-2.5">
              {question.options.map((option, index) => {
                const selected = answers[question.id] === index;

                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAnswer(index)}
                    className={[
                      "group flex w-full items-center gap-3 rounded-[10px] border px-3.5 py-3 text-left transition sm:px-4 sm:py-3.5",
                      selected
                        ? "border-[2px] border-[#4F46E5] bg-[#EEF2FF]"
                        : "border-[#DCE3EE] bg-white hover:border-[#C7D2FE] hover:bg-[#F8FAFF]",
                    ].join(" ")}
                  >
                    {/* Radio */}
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

                    {/* Letter */}
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

                    {/* Text */}
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

            {/* Desktop navigation */}
            <div className="mt-6 hidden items-center justify-between gap-3 sm:flex">
              <button
                type="button"
                disabled={currentQuestion === 0}
                onClick={handlePrevious}
                className="
                  inline-flex
                  h-10
                  min-w-[125px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[8px]
                  border
                  border-[#DCE3EE]
                  bg-white
                  px-5
                  text-[13px]
                  font-medium
                  text-[#475569]
                  transition
                  hover:border-[#C7D2FE]
                  hover:text-[#4F46E5]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <ArrowLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="
                  inline-flex
                  h-10
                  min-w-[172px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[8px]
                  bg-[#4F46E5]
                  px-5
                  text-[13px]
                  font-semibold
                  text-white
                  shadow-[0_4px_10px_rgba(79,70,229,0.18)]
                  transition
                  hover:bg-[#4338CA]
                  active:scale-[0.99]
                "
              >
                {currentQuestion === questions.length - 1
                  ? "Submit Assessment"
                  : "Next Question"}

                <ArrowRight size={15} />
              </button>
            </div>
          </section>

          {/* ==================================================
              RIGHT SIDEBAR
          =================================================== */}

          <aside className="hidden space-y-4 lg:block">
            {/* Questions */}
            <section
              className="
                rounded-[12px]
                border
                border-[#DCE3EE]
                bg-white
                p-5
                shadow-[0_1px_3px_rgba(15,23,42,0.03)]
              "
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-bold text-[#111827]">
                  Questions
                </h2>

                <span
                  className="
                    rounded-full
                    bg-[#EEF2FF]
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    text-[#4F46E5]
                  "
                >
                  {currentQuestion + 1} / {questions.length}
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
                      {item.id}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
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

            {/* Skills */}
            <section
              className="
                rounded-[12px]
                border
                border-[#DCE3EE]
                bg-white
                p-5
                shadow-[0_1px_3px_rgba(15,23,42,0.03)]
              "
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <Code2 size={14} strokeWidth={1.8} />
                </div>

                <h2 className="text-[13px] font-bold text-[#111827]">
                  Skills Being Evaluated
                </h2>
              </div>

              <div className="mt-3 space-y-2">
                {["React", "JavaScript", "Node.js", "MongoDB"].map((skill) => (
                  <div
                    key={skill}
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-[7px]
                        border
                        border-[#DCE3EE]
                        bg-[#F8FAFC]
                        px-3
                        py-2
                      "
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

        {/* ==================================================
            AI INFORMATION
        =================================================== */}

        <section
          className="
            mt-4
            rounded-[10px]
            border
            border-[#E9D5FF]
            bg-[#F5F3FF]
            px-3.5
            py-3
            sm:mt-4
            sm:px-4
            sm:py-3
            lg:max-w-[1035px]
          "
        >
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EDE9FE] text-[#7C3AED]">
              <Sparkles size={14} strokeWidth={1.8} />
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#7C3AED]">
                AI-Powered Assessment
              </p>

              <p className="mt-0.5 text-[11px] leading-[15px] text-[#52627B] sm:text-[12px]">
                Questions are selected based on the skills required for this job
                and your resume profile.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          MOBILE FIXED NAVIGATION
      ====================================================== */}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-40
          border-t
          border-[#DCE3EE]
          bg-white/95
          px-4
          py-3
          backdrop-blur-md
          sm:hidden
        "
      >
        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={currentQuestion === 0}
            onClick={handlePrevious}
            className="
              inline-flex
              h-12
              flex-1
              items-center
              justify-center
              gap-2
              rounded-[9px]
              border
              border-[#DCE3EE]
              bg-white
              px-3
              text-[13px]
              font-medium
              text-[#475569]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ArrowLeft size={15} />
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="
              inline-flex
              h-12
              flex-1
              items-center
              justify-center
              gap-2
              rounded-[9px]
              bg-[#4F46E5]
              px-3
              text-[13px]
              font-semibold
              text-white
              shadow-[0_4px_10px_rgba(79,70,229,0.18)]
              active:scale-[0.99]
            "
          >
            {currentQuestion === questions.length - 1
              ? "Submit"
              : "Next Question"}

            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </main>
  );
}
