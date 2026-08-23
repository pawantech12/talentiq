"use client";

import {
  Sparkles,
  FileSearch,
  Target,
  ClipboardCheck,
  Trophy,
  MessageSquare,
  Lightbulb,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

const features = [
  {
    title: "AI Resume Analysis",
    badge: "AI",
    description: (
      <>
        Analyze resume content against job requirements
        <br className="hidden md:block" />
        with pinpoint accuracy.
      </>
    ),
    icon: FileSearch,
    iconType: "purple",
    footer: {
      type: "text",
      icon: Sparkles,
      text: "Powered by AI",
    },
  },
  {
    title: "Job Match Score",
    description: (
      <>
        Understand how closely a candidate matches a
        <br className="hidden md:block" />
        specific job requirement.
      </>
    ),
    icon: Target,
    iconType: "blue",
    footer: {
      type: "pill",
      text: "86% Match",
    },
  },
  {
    title: "Skill Assessment",
    badge: "AI",
    description: (
      <>
        Evaluate actual job-specific technical skills with
        <br className="hidden md:block" />
        structured assessments.
      </>
    ),
    icon: ClipboardCheck,
    iconType: "blue",
    footer: {
      type: "text",
      icon: Sparkles,
      text: "Adaptive Testing",
    },
  },
  {
    title: "Candidate Ranking",
    description: (
      <>
        Compare candidates using their evaluation scores to
        <br className="hidden md:block" />
        surface the best fit.
      </>
    ),
    icon: Trophy,
    iconType: "blue",
    footer: {
      type: "pill",
      text: "#1 Auto-Ranked",
    },
  },
  {
    title: "AI Mock Interview",
    badge: "AI",
    description: (
      <>
        Practice job-specific interview questions with real-
        <br className="hidden md:block" />
        time AI feedback.
      </>
    ),
    icon: MessageSquare,
    iconType: "purple",
    footer: {
      type: "text",
      icon: Sparkles,
      text: "Real-Time AI Feedback",
    },
  },
  {
    title: "Personalized Feedback",
    badge: "AI",
    description: (
      <>
        Identify strengths, weaknesses and recommended
        <br className="hidden md:block" />
        improvements clearly.
      </>
    ),
    icon: Lightbulb,
    iconType: "purple",
    footer: {
      type: "text",
      icon: ChartNoAxesColumnIncreasing,
      text: "Detailed Analytics",
    },
  },
];

export default function AIFeaturesSection() {
  return (
    <section
      className="
        w-full
        bg-[#F8FAFC]
        px-5
        py-12
        md:px-20
        md:py-24
      "
    >
      <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-14 max-sm:gap-7">
        {/* =========================
            SECTION HEADER
        ========================== */}

        <div className="flex flex-col gap-3 sm:gap-6 mx-auto text-center ">
          <div className="inline-flex w-fit mx-auto items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-[14px] py-[6px] text-xs font-semibold text-[#7C3AED]">
            <Sparkles className="h-[11px] w-[11px]" strokeWidth={2.3} />
            AI-Powered Features
          </div>

          <h2 className="mx-auto max-w-[1000px] text-[28px] font-extrabold leading-[32px] tracking-[-1.2px] text-[#0F172A] sm:text-[38px]  lg:text-[44px] lg:tracking-[-1.8px]">
            Intelligent Tools for Smarter Outcomes
          </h2>

          <p className="mx-auto  max-w-[700px] text-base leading-[1.55] text-[#475569] sm:text-[16px] ">
            Intelligent tools designed to simplify recruitment and career
            preparation.
          </p>
        </div>

        {/* =========================
            FEATURE GRID
        ========================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            
            md:grid-cols-2
            lg:grid-cols-3
            
          "
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const isPurple = feature.iconType === "purple";

            return (
              <article
                key={feature.title}
                className="
                  group
                  min-h-[240px]
                  w-full
                  rounded-[16px]
                  border border-[#dce4ee]
                  bg-white
                  px-[31px]
                  py-[31px]
                  shadow-[0_5px_16px_rgba(15,23,42,0.025)]
                  transition-all
                  duration-200
                  hover:-translate-y-[2px]
                  hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)]
                  sm:min-h-[250px]
                  md:min-h-[240px]
                  md:px-[31px]
                  md:py-[31px]
                "
              >
                {/* Icon */}

                <div
                  className={[
                    "flex h-[48px] w-[48px] items-center justify-center",
                    "rounded-[12px] border",
                    isPurple
                      ? "border-[#e8ddff] bg-[#f7f3ff] text-[#7c3aed]"
                      : "border-[#bdcaff] bg-[#eff3ff] text-[#4f46ff]",
                  ].join(" ")}
                >
                  <Icon size={23} strokeWidth={1.9} />
                </div>

                {/* Title */}

                <div
                  className="
                    mt-[20px]
                    flex
                    min-h-[21px]
                    items-center
                    gap-[9px]
                  "
                >
                  <h3
                    className="
                      text-[16px]
                      font-[700]
                      leading-[21px]
                      tracking-[-0.25px]
                      text-[#111827]
                    "
                  >
                    {feature.title}
                  </h3>

                  {feature.badge && (
                    <span
                      className="
                        inline-flex
                        h-[18px]
                        items-center
                        rounded-full
                        bg-[#f2edff]
                        px-[7px]
                        text-[9px]
                        font-[700]
                        leading-none
                        text-[#7c3aed]
                      "
                    >
                      {feature.badge}
                    </span>
                  )}
                </div>

                {/* Description */}

                <p
                  className="
                    mt-[9px]
                    text-[14px]
                    font-[400]
                    leading-[21px]
                    tracking-[-0.05px]
                    text-[#647792]
                  "
                >
                  {feature.description}
                </p>

                {/* Footer */}

                <div className="mt-[20px]">
                  {feature.footer.type === "pill" ? (
                    <span
                      className="
                        inline-flex
                        h-[25px]
                        items-center
                        rounded-full
                        bg-[#edf1ff]
                        px-[13px]
                        text-[12px]
                        font-[700]
                        leading-none
                        text-[#4f46e5]
                      "
                    >
                      {feature.footer.text}
                    </span>
                  ) : (
                    <div
                      className="
                        flex
                        items-center
                        gap-[7px]
                        text-[12px]
                        font-[400]
                        leading-[18px]
                        text-[#8ba0bf]
                      "
                    >
                      <feature.footer.icon
                        size={14}
                        strokeWidth={1.8}
                        className="text-[#b59cff]"
                      />

                      <span>{feature.footer.text}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
