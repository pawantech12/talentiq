"use client";

import {
  BrainCircuit,
  Check,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-tr from-[#F5F3FF] to-[#FAFBFF]">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[18%] h-[420px] w-[420px] rounded-full bg-[#eeeaff] opacity-40 blur-[100px]" />
        <div className="absolute right-[12%] top-[22%] h-[360px] w-[360px] rounded-full bg-[#f1efff] opacity-50 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-[700px] max-w-[1440px] items-center px-8 py-16 max-sm:px-5 max-sm:py-10 lg:px-20">
        <div className="grid w-full grid-cols-1 items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 xl:gap-20">
          {/* =========================================================
              LEFT CONTENT
          ========================================================= */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left gap-8 max-sm:gap-7">
            {/* Badge */}
            <div className=" inline-flex items-center gap-2 rounded-full border border-[#b9a8ff] bg-[#f4f0ff] px-4 py-1.5 text-[13px] max-sm:text-xs font-medium text-[#643cff]">
              <Sparkles size={14} strokeWidth={2.3} />
              <span>AI-Powered Career &amp; Recruitment Platform</span>
            </div>

            {/* Heading */}
            <h1 className="max-w-[600px] text-[42px] font-extrabold leading-[46.2px] lg:leading-[68px] tracking-[-1.8px] text-[#0F172A] sm:text-[56px] lg:text-[58px] ">
              Smarter Hiring.
              <br />
              <span className="text-[#4F46E5]">
                Better Career
                <br />
                Preparation.
              </span>
            </h1>

            {/* Description */}
            <p className=" max-w-[570px] max-sm:text-[15px] text-lg max-sm:leading-[23.3px] leading-[30px] text-[#475569]">
              ResumeAI helps recruiters screen candidates faster and helps
              students understand their skills, improve their resumes and
              prepare for real job opportunities.
            </p>

            {/* Buttons */}
            <div className=" flex gap-[14px] max-sm:gap-3">
              <button
                type="button"
                className="flex  items-center justify-center rounded-[10px] bg-[#4b3bd4] px-7 py-[14px] max-sm:py-[13px] max-sm:text-[15px] text-base font-bold text-white shadow-[0_8px_18px_rgba(75,59,212,0.22)] transition hover:bg-[#4032c2]"
              >
                Get Started
              </button>

              <button
                type="button"
                className="flex  items-center justify-center rounded-[10px] border border-[#dce1ec] bg-white px-7 py-[14px] max-sm:py-[13px] max-sm:text-[15px] text-base font-bold text-[#0F172A] shadow-[0_3px_10px_rgba(20,30,60,0.04)] transition hover:bg-[#fafaff]"
              >
                How It Works
              </button>
            </div>

            {/* Trust line */}
            <div className=" flex gap-2 max-sm:gap-[6px] text-[14px] text-[#657592]">
              <ShieldCheck
                size={16}
                strokeWidth={2}
                className="text-[#10a957]"
              />
              <p>Built for smarter recruitment and career growth.</p>
            </div>
          </div>

          {/* =========================================================
              RIGHT DESKTOP DASHBOARD
          ========================================================= */}
          <div className="relative hidden lg:block">
            {/* Top cards */}
            <div className="flex items-stretch gap-4">
              {/* Resume Match */}
              <div className="flex h-[200px] flex-1 rounded-[16px] border border-[#dfe3ed] bg-white p-6 shadow-[0_12px_35px_rgba(50,45,130,0.07)]">
                <div className="flex w-full flex-col">
                  {/* Card heading */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0edff] text-[#5543ec]">
                        <BrainCircuit size={17} />
                      </div>

                      <span className="text-[15px] font-semibold text-[#172039]">
                        Resume Match
                      </span>
                    </div>

                    <div className="flex items-center gap-1 rounded-full bg-[#f3efff] px-3 py-1 text-[11px] font-medium text-[#6546e9]">
                      <Sparkles size={12} />
                      AI Scored
                    </div>
                  </div>

                  {/* Score + metrics */}
                  <div className="mt-5 flex flex-1 items-center gap-6">
                    {/* Circular score */}
                    <div className="relative flex h-[92px] w-[92px] shrink-0 items-center justify-center">
                      <svg
                        viewBox="0 0 100 100"
                        className="absolute inset-0 h-full w-full -rotate-[90deg]"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="43"
                          fill="none"
                          stroke="#eeeafe"
                          strokeWidth="10"
                        />

                        <circle
                          cx="50"
                          cy="50"
                          r="43"
                          fill="none"
                          stroke="#6841e8"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray="270.2"
                          strokeDashoffset="37.8"
                        />
                      </svg>

                      <div className="relative text-center">
                        <div className="text-[24px] font-bold leading-none text-[#151c30]">
                          86%
                        </div>
                        <div className="mt-1 text-[10px] text-[#71809b]">
                          Match
                        </div>
                      </div>
                    </div>

                    {/* Match metrics */}
                    <div className="min-w-0 flex-1 space-y-3">
                      <MatchMetric
                        label="Skill Match"
                        value="85%"
                        percentage={85}
                        purple
                      />

                      <MatchMetric
                        label="Experience Match"
                        value="100%"
                        percentage={100}
                      />

                      <MatchMetric
                        label="Education Match"
                        value="100%"
                        percentage={100}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Ranking */}
              <div className="flex h-[224px] w-[200px] shrink-0 flex-col items-center justify-center rounded-[16px] border border-[#dfe3ed] bg-white shadow-[0_12px_35px_rgba(50,45,130,0.07)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f0edff] text-[#6546e9]">
                  <Trophy size={21} />
                </div>

                <p className="mt-3 text-[12px] font-medium text-[#71809b]">
                  Candidate Ranking
                </p>

                <div className="mt-1 text-[40px] font-extrabold leading-none text-[#141b2f]">
                  #2
                </div>

                <div className="mt-3 rounded-full bg-[#693be5] px-4 py-1 text-[13px] font-bold text-white">
                  83.25%
                </div>

                <p className="mt-2 text-[11px] text-[#8995aa]">Overall Score</p>
              </div>
            </div>

            {/* Candidate card */}
            <CandidateCard />

            {/* Decorative icons */}
            <div className="absolute -bottom-9 right-2 flex items-center gap-3 text-[#b6a7ff]">
              <Sparkles size={14} />
              <Zap size={14} />
              <Sparkles size={12} />
            </div>
          </div>

          {/* =========================================================
              MOBILE DASHBOARD
          ========================================================= */}
          <div className="block w-full lg:hidden">
            <MobileDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MATCH METRIC
========================================================= */

function MatchMetric({ label, value, percentage, purple = false }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
        <span className="font-medium text-[#465570]">{label}</span>

        <span
          className={
            purple
              ? "font-semibold text-[#5143e8]"
              : "font-semibold text-[#0b9f4d]"
          }
        >
          {value}
        </span>
      </div>

      <div className="h-[6px] overflow-hidden rounded-full bg-[#eef0f6]">
        <div
          className={
            purple
              ? "h-full rounded-full bg-[#5143e8]"
              : "h-full rounded-full bg-[#0da64f]"
          }
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   DESKTOP CANDIDATE CARD
========================================================= */

function CandidateCard() {
  return (
    <div className="mt-5 flex h-[85px] items-center justify-between rounded-[16px] border border-[#dfe3ed] bg-white px-6 shadow-[0_10px_30px_rgba(50,45,130,0.05)]">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6243e9] text-[15px] font-semibold text-white">
          RS
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-[#182039]">
              Rahul Sharma
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-[#dcf9e9] px-2.5 py-1 text-[10px] font-semibold text-[#0a9d4b]">
              <Check size={10} strokeWidth={3} />
              Shortlisted
            </span>
          </div>

          <p className="mt-1 text-[13px] text-[#6d7c96]">
            Full Stack Developer
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[11px] text-[#91a0b8]">Matched Skills</p>

        <div className="flex gap-2">
          {["React", "Node.js", "MongoDB"].map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#f1efff] px-3 py-1 text-[10px] font-medium text-[#5143e8]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE DASHBOARD
========================================================= */

function MobileDashboard() {
  return (
    <div className="mx-auto w-full max-w-[350px] rounded-[18px] border border-[#dfe4ee] bg-[#f9faff] p-4 shadow-[0_10px_35px_rgba(60,60,130,0.08)]">
      {/* Dashboard header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#10a957]" />

          <span className="text-[12px] font-medium text-[#61718e]">
            ResumeAI Dashboard
          </span>
        </div>

        <span className="rounded-full bg-[#eeecff] px-3 py-1 text-[11px] font-medium text-[#5943e9]">
          Live Preview
        </span>
      </div>

      {/* Match card */}
      <div className="mt-3 rounded-[14px] border border-[#dce2ec] bg-white px-4 py-4 shadow-[0_3px_10px_rgba(30,40,70,0.04)]">
        {/* Card title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#5c6780]">
            <Sparkles size={15} className="text-[#6444ed]" />
            AI Resume Match
          </div>

          <span className="rounded-full bg-[#d9f8e6] px-3 py-1 text-[10px] font-semibold text-[#079a48]">
            Strong Match
          </span>
        </div>

        {/* Score */}
        <div className="mt-5 grid grid-cols-[90px_1fr] items-center gap-4">
          <div className="text-center">
            <div className="text-[41px] font-extrabold leading-none text-[#5143e8]">
              86%
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2.5">
            <MobileMetric
              label="Skill Match"
              value="85%"
              percentage={85}
              purple
            />

            <MobileMetric label="Experience" value="100%" percentage={100} />

            <MobileMetric label="Education" value="100%" percentage={100} />
          </div>
        </div>
      </div>

      {/* Candidate */}
      <div className="mt-3 flex h-[52px] items-center rounded-[8px] border border-[#dce2ec] bg-white px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6344e9] text-[10px] font-semibold text-white">
          RS
        </div>

        <div className="ml-2 min-w-0">
          <p className="truncate text-[11px] font-bold text-[#182039]">
            Rahul Sharma
          </p>

          <p className="truncate text-[9px] text-[#75839b]">
            Full Stack Developer
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <span className="rounded-full bg-[#f1efff] px-2 py-1 text-[9px] font-medium text-[#5143e8]">
            React
          </span>

          <span className="rounded-full bg-[#f1efff] px-2 py-1 text-[9px] font-medium text-[#5143e8]">
            Node.js
          </span>

          <span className="flex items-center gap-1 rounded-full bg-[#d9f8e6] px-2 py-1 text-[9px] font-medium text-[#079a48]">
            <Check size={9} />
            Shortlisted
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE METRIC
========================================================= */

function MobileMetric({ label, value, percentage, purple = false }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[12px]">
        <span className="font-medium text-[#485670]">{label}</span>

        <span
          className={
            purple
              ? "font-semibold text-[#5143e8]"
              : "font-semibold text-[#079a48]"
          }
        >
          {value}
        </span>
      </div>

      <div className="h-[6px] overflow-hidden rounded-full bg-[#edf0f6]">
        <div
          className={
            purple
              ? "h-full rounded-full bg-[#5143e8]"
              : "h-full rounded-full bg-[#0da64f]"
          }
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
