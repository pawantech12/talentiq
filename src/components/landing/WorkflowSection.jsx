"use client";

import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileText,
  BrainCircuit,
  ClipboardCheck,
  Gauge,
  Trophy,
  MessageSquare,
  Lightbulb,
} from "lucide-react";

const workflowSteps = [
  {
    title: "Resume",
    description: (
      <>
        Upload your resume
        <br />
        to get started.
      </>
    ),
    icon: FileText,
    type: "standard",
  },
  {
    title: "AI Analysis",
    badge: "AI",
    description: (
      <>
        Resume matched
        <br />
        against job
        <br />
        requirements.
      </>
    ),
    icon: BrainCircuit,
    type: "ai",
  },
  {
    title: "Skill Assessment",
    description: (
      <>
        Technical skills
        <br />
        evaluated by domain.
      </>
    ),
    icon: ClipboardCheck,
    type: "standard",
  },
  {
    title: "Final Score",
    badge: "86%",
    description: (
      <>
        Overall candidate score
        <br />
        calculated.
      </>
    ),
    icon: Gauge,
    type: "score",
  },
  {
    title: "Candidate Ranking",
    description: (
      <>
        Ranked among all
        <br />
        applicants.
      </>
    ),
    icon: Trophy,
    type: "standard",
  },
  {
    title: "Mock Interview",
    description: (
      <>
        Practice with AI-
        <br />
        generated questions.
      </>
    ),
    icon: MessageSquare,
    type: "standard",
  },
  {
    title: "Feedback",
    badge: "AI",
    description: (
      <>
        Personalized
        <br />
        improvements and next
        <br />
        steps.
      </>
    ),
    icon: Lightbulb,
    type: "ai",
  },
];

export default function WorkflowSection() {
  return (
    <section
      className="
        relative w-full overflow-hidden
        bg-white
        px-5
        py-12
        md:px-20
        md:py-24
      "
    >
      <div className="mx-auto w-full max-w-[1252px] flex flex-col gap-14 max-sm:gap-6">
        {/* =========================
            HEADER
        ========================== */}

        <div className="mx-auto flex flex-col gap-3 text-center sm:gap-6">
          <div className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-[14px] py-[6px] text-xs font-semibold text-[#4F46E5]">
            <ArrowRight className="h-[11px] w-[11px]" strokeWidth={2.3} />
            End-to-End Workflow
          </div>

          <h2 className="mx-auto max-w-[1000px] text-[28px] font-extrabold leading-[32px] tracking-[-1.2px] text-[#0F172A] sm:text-[38px] lg:text-[44px] lg:tracking-[-1.8px]">
            From Resume to Readiness
          </h2>

          <p className="mx-auto max-w-[700px] text-base leading-[1.55] text-[#475569] sm:text-[16px]">
            Every step of the hiring and career journey, handled intelligently
            by ResumeAI.
          </p>
        </div>

        {/* =========================
            DESKTOP WORKFLOW
        ========================== */}

        <div
          className="
            mx-auto 
            hidden w-full
            items-center
            gap-[32px]
            md:flex
          "
        >
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            const isAI = step.type === "ai";
            const isScore = step.type === "score";

            return (
              <div key={step.title} className="relative min-w-0 flex-1">
                {/* Step Card */}

                <div
                  className={[
                    "relative flex h-[148px] w-full flex-col items-center",
                    "rounded-[16px] border px-3 text-center",
                    "transition-all duration-200",

                    isAI
                      ? "border-[#ded1ff] bg-[linear-gradient(135deg,#f7f3ff_0%,#f0ebff_100%)] shadow-[0_8px_24px_rgba(124,58,237,0.10)]"
                      : "",

                    isScore
                      ? "border-[#bdcaff] bg-[linear-gradient(135deg,#edf1ff_0%,#e2e8ff_100%)] shadow-[0_8px_24px_rgba(67,56,202,0.10)]"
                      : "",

                    !isAI && !isScore ? "border-[#dfe5ed] bg-white" : "",
                  ].join(" ")}
                >
                  {/* Icon */}

                  <div
                    className={[
                      "mt-[19px] flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px]",

                      isAI
                        ? "bg-[#7c2de8] text-white shadow-[0_5px_12px_rgba(124,45,232,0.28)]"
                        : "",

                      isScore
                        ? "bg-[#4338ca] text-white shadow-[0_5px_12px_rgba(67,56,202,0.25)]"
                        : "",

                      !isAI && !isScore ? "bg-[#f0f4fb] text-[#60728f]" : "",
                    ].join(" ")}
                  >
                    <Icon size={21} strokeWidth={1.9} />
                  </div>

                  {/* Title */}

                  <div
                    className={[
                      "mt-[10px] flex items-center justify-center gap-[7px]",
                      "text-[13px] font-bold leading-[18px]",

                      isAI ? "text-[#7429e7]" : "",

                      isScore ? "text-[#3730a3]" : "",

                      !isAI && !isScore ? "text-[#111827]" : "",
                    ].join(" ")}
                  >
                    <span>{step.title}</span>

                    {step.badge && (
                      <span
                        className={[
                          "inline-flex h-[17px] items-center justify-center rounded-full px-[6px]",
                          "text-[9px] font-bold leading-none",

                          isScore
                            ? "border border-[#aebcff] bg-[#eef1ff] text-[#4f46e5]"
                            : "bg-[#7c2de8] text-white",
                        ].join(" ")}
                      >
                        {step.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}

                  <div
                    className={[
                      "mt-[7px] text-[11px] font-normal leading-[16px]",

                      isAI ? "text-[#7c3aed]" : "",

                      isScore ? "text-[#4f46e5]" : "",

                      !isAI && !isScore ? "text-[#91a2bc]" : "",
                    ].join(" ")}
                  >
                    {step.description}
                  </div>
                </div>

                {/* Desktop Arrow */}

                {index < workflowSteps.length - 1 && (
                  <ChevronRight
                    className="absolute -right-[21px] top-1/2 z-10 -translate-y-1/2 text-[#c7d3e3]"
                    size={15}
                    strokeWidth={1.7}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* =========================
            DESKTOP LEGEND
        ========================== */}

        <div
          className="
            hidden items-center justify-center gap-[28px]
            text-[13px]
            md:flex
          "
        >
          <div className="flex items-center gap-[8px] text-[#91a2bc]">
            <span className="h-[10px] w-[10px] rounded-full border border-[#cbd5e1] bg-[#e8edf4]" />

            <span>Standard Stage</span>
          </div>

          <div className="flex items-center gap-[8px] text-[#91a2bc]">
            <span className="h-[10px] w-[10px] rounded-full bg-[#7c3aed]" />

            <span>AI-Powered Stage</span>
          </div>

          <div className="flex items-center gap-[8px] text-[#91a2bc]">
            <span className="h-[10px] w-[10px] rounded-full bg-[#4f46e5]" />

            <span>Scoring Stage</span>
          </div>
        </div>

        {/* =========================
            MOBILE WORKFLOW
        ========================== */}

        <div
          className="
            mx-auto mt-[25px]
            block w-full max-w-[350px]
            md:hidden
          "
        >
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            const isAI = step.type === "ai";
            const isScore = step.type === "score";

            return (
              <div key={step.title} className="relative">
                {/* Step Card */}

                <div
                  className={[
                    "relative flex h-[148px] w-full flex-col items-center",
                    "rounded-[16px] border px-3 text-center",
                    "transition-all duration-200",

                    isAI
                      ? "border-[#ded1ff] bg-[linear-gradient(135deg,#f7f3ff_0%,#f0ebff_100%)] shadow-[0_8px_24px_rgba(124,58,237,0.10)]"
                      : "",

                    isScore
                      ? "border-[#bdcaff] bg-[linear-gradient(135deg,#edf1ff_0%,#e2e8ff_100%)] shadow-[0_8px_24px_rgba(67,56,202,0.10)]"
                      : "",

                    !isAI && !isScore ? "border-[#dfe5ed] bg-white" : "",
                  ].join(" ")}
                >
                  {/* Icon */}

                  <div
                    className={[
                      "mt-[19px] flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px]",

                      isAI
                        ? "bg-[#7c2de8] text-white shadow-[0_5px_12px_rgba(124,45,232,0.28)]"
                        : "",

                      isScore
                        ? "bg-[#4338ca] text-white shadow-[0_5px_12px_rgba(67,56,202,0.25)]"
                        : "",

                      !isAI && !isScore ? "bg-[#f0f4fb] text-[#60728f]" : "",
                    ].join(" ")}
                  >
                    <Icon size={21} strokeWidth={1.9} />
                  </div>

                  {/* Title */}

                  <div
                    className={[
                      "mt-[10px] flex items-center justify-center gap-[7px]",
                      "text-[13px] font-bold leading-[18px]",

                      isAI ? "text-[#7429e7]" : "",

                      isScore ? "text-[#3730a3]" : "",

                      !isAI && !isScore ? "text-[#111827]" : "",
                    ].join(" ")}
                  >
                    <span>{step.title}</span>

                    {step.badge && (
                      <span
                        className={[
                          "inline-flex h-[17px] items-center justify-center rounded-full px-[6px]",
                          "text-[9px] font-bold leading-none",

                          isScore
                            ? "border border-[#aebcff] bg-[#eef1ff] text-[#4f46e5]"
                            : "bg-[#7c2de8] text-white",
                        ].join(" ")}
                      >
                        {step.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}

                  <div
                    className={[
                      "mt-[7px] text-[11px] font-normal leading-[16px]",

                      isAI ? "text-[#7c3aed]" : "",

                      isScore ? "text-[#4f46e5]" : "",

                      !isAI && !isScore ? "text-[#91a2bc]" : "",
                    ].join(" ")}
                  >
                    {step.description}
                  </div>
                </div>

                {/* Mobile Arrow */}

                {index < workflowSteps.length - 1 && (
                  <div className="flex h-[32px] items-center justify-center">
                    <ChevronDown
                      size={17}
                      strokeWidth={1.7}
                      className="text-[#c7d3e3]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
