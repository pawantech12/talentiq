"use client";

import { Workflow, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Post or Find a Job",
    description:
      "Recruiters post jobs and students discover relevant opportunities.",
  },
  {
    number: "02",
    title: "Upload Resume",
    description:
      "Students upload their resume for AI-powered analysis and screening.",
  },
  {
    number: "03",
    title: "AI Analysis",
    description:
      "ResumeAI compares the resume against job requirements using AI.",
    core: true,
  },
  {
    number: "04",
    title: "Assess & Rank",
    description:
      "Job-specific skills are assessed and candidates receive ranked scores.",
  },
  {
    number: "05",
    title: "Improve & Prepare",
    description:
      "Students practice AI mock interviews and receive personalized feedback.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-slate-100 px-20 py-24 max-sm:px-5 max-sm:py-12">
      <div className="mx-auto max-w-[1290px] flex flex-col gap-16 max-sm:gap-7">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-6 mx-auto text-center ">
          <div className="inline-flex w-fit mx-auto items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-[14px] py-[6px] text-xs font-semibold text-[#4F46E5]">
            <Workflow className="h-[11px] w-[11px]" strokeWidth={2.3} />
            Simple Workflow
          </div>

          <h2 className="mx-auto max-w-[1000px] text-[28px] font-extrabold leading-[32px] tracking-[-1.2px] text-[#0F172A] sm:text-[38px]  lg:text-[44px] lg:tracking-[-1.8px]">
            How ResumeAI Works
          </h2>

          <p className="mx-auto  max-w-[700px] text-base leading-[1.55] text-[#475569] sm:text-[16px] ">
            A simple workflow for both recruiters and students.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {/* Desktop workflow */}
          <div className="hidden lg:flex lg:items-start">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="flex min-w-0 flex-1 items-start"
              >
                {/* Step */}
                <div className="flex w-full flex-col items-center text-center">
                  <div
                    className={[
                      "flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full",
                      "text-[18px] font-bold text-white shadow-[0_8px_18px_rgba(79,70,229,0.22)]",
                      step.core
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600"
                        : "bg-indigo-600",
                    ].join(" ")}
                  >
                    {step.number}
                  </div>

                  <div className="mt-[15px] min-h-[20px]">
                    {step.core && (
                      <div className="mb-[8px] inline-flex items-center rounded-full bg-violet-100 px-[10px] py-[4px] text-[11px] font-medium leading-none text-violet-600">
                        Core Step
                      </div>
                    )}

                    <h3 className="text-[15px] font-bold leading-5 text-slate-900">
                      {step.title}
                    </h3>
                  </div>

                  <p className="mt-[8px] max-w-[190px] text-[14px] leading-[20px] text-slate-500">
                    {step.description}
                  </p>
                </div>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="mt-[30px] h-px w-[80px] shrink-0 bg-indigo-200 xl:w-[80px]" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile / tablet workflow */}
          <div className="relative lg:hidden">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-[20px] bottom-[29px] w-px bg-indigo-100" />

            <div className="space-y-[27px]">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative flex items-start gap-[15px]"
                >
                  {/* Number */}
                  <div
                    className={[
                      "relative z-10 flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full",
                      "text-[14px] font-bold text-white",
                      step.core
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600"
                        : "bg-indigo-600",
                    ].join(" ")}
                  >
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="pt-[2px]">
                    <div className="flex flex-wrap items-center gap-[7px]">
                      <h3 className="text-[15px] font-bold leading-[20px] text-slate-900">
                        {step.title}
                      </h3>

                      {step.core && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-[8px] py-[3px] text-[10px] font-medium leading-none text-violet-600">
                          <Sparkles size={9} />
                          AI
                        </span>
                      )}
                    </div>

                    <p className="mt-[4px] max-w-[285px] text-[13.5px] leading-[20px] text-slate-500 sm:max-w-[480px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className=" flex items-center justify-center gap-[16px] max-sm:gap-3">
            <button
              type="button"
              className="
              inline-flex  items-center justify-center
              rounded-[10px] bg-indigo-600 px-[32px] max-sm:px-6 py-[14px] max-sm:py-3 max-sm:text-sm
              text-base font-bold text-white
              shadow-[0_8px_18px_rgba(79,70,229,0.22)]
              transition hover:bg-indigo-700
            "
            >
              Get Started Free
            </button>

            <button
              type="button"
              className="
              inline-flex items-center justify-center
              rounded-[10px] border border-slate-200 bg-white
              px-[32px] max-sm:px-6 py-[14px] max-sm:py-3 max-sm:text-sm text-base font-bold text-slate-900
              transition hover:bg-slate-50
            "
            >
              See a Live Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
