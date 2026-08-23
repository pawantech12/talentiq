"use client";

import {
  Award,
  ArrowRight,
  Check,
  FileText,
  Lightbulb,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

export default function PlatformPreviewSection() {
  const candidates = [
    {
      rank: 1,
      initials: "PK",
      name: "Priya Kapoor",
      score: "91.5%",
      avatar: "green",
    },
    {
      rank: 2,
      initials: "RS",
      name: "Rahul Sharma",
      score: "83.25%",
      avatar: "purple",
      active: true,
    },
    {
      rank: 3,
      initials: "AM",
      name: "Ankit Mehta",
      score: "76.8%",
      avatar: "gray",
    },
  ];

  const progressItems = [
    {
      label: "Skill Match",
      value: 85,
      color: "purple",
    },
    {
      label: "Experience",
      value: 100,
      color: "green",
    },
    {
      label: "Education",
      value: 88,
      color: "purple",
    },
  ];

  const assessmentSkills = [
    {
      label: "React.js",
      value: 90,
    },
    {
      label: "Node.js",
      value: 75,
    },
    {
      label: "System Design",
      value: 70,
    },
    {
      label: "Algorithms",
      value: 85,
    },
  ];

  return (
    <section className="w-full overflow-hidden bg-white">
      <div className="flex flex-col gap-16 max-sm:gap-6 mx-auto w-full max-w-[1520px]  py-12 px-5 lg:px-[80px]   lg:py-[96px]">
        {/* =========================================================
            SECTION HEADING
        ========================================================= */}
        <div className="flex flex-col gap-3 sm:gap-6 mx-auto text-center ">
          <div className="inline-flex w-fit mx-auto items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-[#F5F3FF] px-[14px] py-[6px] text-xs font-semibold text-[#7C3AED]">
            <Sparkles className="h-[11px] w-[11px]" strokeWidth={2.3} />
            AI Powered
          </div>

          <h2 className="mx-auto max-w-[1000px] text-[28px] font-extrabold leading-[32px] tracking-[-1.2px] text-[#0F172A] sm:text-[38px]  lg:text-[44px] lg:tracking-[-1.8px]">
            One Platform. Smarter Decisions.
          </h2>

          <p className="mx-auto  max-w-[700px] text-base leading-[1.55] text-[#475569] sm:text-[16px] ">
            From resume analysis to candidate ranking and interview preparation,
            <br className="hidden sm:block" />
            ResumeAI brings the complete process together.
          </p>
        </div>

        {/* =========================================================
            PREVIEW CONTAINER
        ========================================================= */}
        <div className="mx-auto w-full max-w-[1280px] rounded-[20px] border border-[#DDE4EF] bg-[#F8FAFC] p-[10px]  sm:p-5  lg:px-[51px] lg:py-[36px]">
          <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-[48px]">
            {/* =====================================================
                CARD 1 — AI RESUME ANALYSIS
            ====================================================== */}
            <article className="relative w-full overflow-hidden rounded-[16px] border border-[#DCE3EE] bg-white shadow-[0_10px_28px_rgba(30,41,59,0.05)]">
              {/* Header */}
              <header className="flex h-[68px] items-center gap-3 bg-gradient-to-r from-[#7138F2] to-[#5145E5] px-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white/15">
                  <FileText
                    className="h-[18px] w-[18px] text-white"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h3 className="text-[14px] font-bold leading-[17px] text-white">
                    AI Resume Analysis
                  </h3>

                  <div className="mt-[3px]">
                    <span className="inline-flex h-[16px] items-center gap-[4px] rounded-full bg-white px-[7px] text-[9px] font-semibold leading-none text-[#16A34A]">
                      <span className="h-[5px] w-[5px] rounded-full bg-[#16A34A]" />
                      Live
                    </span>
                  </div>
                </div>
              </header>

              {/* Body */}
              <div className="px-5 pb-[19px] pt-[24px]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[12px] font-medium text-[#61718B]">
                      Match Score
                    </div>

                    <div className="mt-[3px] flex items-baseline">
                      <span className="text-[42px] font-bold leading-none tracking-[-1.5px] text-[#10182B]">
                        86
                      </span>

                      <span className="ml-[2px] text-[20px] font-semibold text-[#5546E8]">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Circular Score */}
                  <div
                    className="relative mt-[1px] flex h-[66px] w-[66px] items-center justify-center rounded-full"
                    style={{
                      background:
                        "conic-gradient(#5546E8 0deg 309.6deg, #EEF0FF 309.6deg 360deg)",
                    }}
                  >
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white">
                      <span className="text-[13px] font-bold text-[#10182B]">
                        86%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="mt-[22px] space-y-[11px]">
                  {progressItems.map((item) => {
                    const isGreen = item.color === "green";

                    return (
                      <div key={item.label} className="space-y-[5px]">
                        <div className="flex items-center justify-between text-[12px] leading-none">
                          <span className="text-[#536581]">{item.label}</span>

                          <span
                            className={`font-semibold ${
                              isGreen ? "text-[#16A34A]" : "text-[#5146E5]"
                            }`}
                          >
                            {item.value}%
                          </span>
                        </div>

                        <div className="h-[5px] overflow-hidden rounded-full bg-[#EEF0FF]">
                          <div
                            className={`h-full rounded-full ${
                              isGreen ? "bg-[#16A34A]" : "bg-[#5546E8]"
                            }`}
                            style={{
                              width: `${item.value}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Matched Candidate */}
                <div className="mt-[17px] flex h-[51px] items-center justify-between rounded-[10px] border border-[#DFE6F0] bg-[#F8FAFD] px-3">
                  <div className="flex items-center gap-[9px]">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#6541E9] text-[10px] font-bold text-white">
                      RS
                    </div>

                    <div>
                      <div className="text-[12px] font-bold leading-[15px] text-[#172035]">
                        Rahul Sharma
                      </div>

                      <div className="text-[10px] leading-[13px] text-[#70809A]">
                        Full Stack Developer
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-[#D9F8E7] px-[9px] py-[4px] text-[9px] font-semibold text-[#16A34A]">
                    <Check className="h-[9px] w-[9px]" strokeWidth={3} />
                    Matched
                  </div>
                </div>
              </div>
            </article>

            {/* Desktop Arrow 1 */}
            <div className="pointer-events-none absolute left-1/3 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
              <ArrowRight
                className="h-[22px] w-[22px] text-[#BFAEFF]"
                strokeWidth={1.8}
              />
            </div>

            {/* =====================================================
                CARD 2 — SKILL ASSESSMENT
            ====================================================== */}
            <article className="relative w-full overflow-hidden rounded-[16px] border border-[#DCE3EE] bg-white shadow-[0_10px_28px_rgba(30,41,59,0.05)]">
              {/* Header */}
              <header className="h-[68px] bg-gradient-to-r from-[#7631E8] to-[#8636E9] px-5 pt-[14px]">
                <h3 className="text-[14px] font-bold leading-[17px] text-white">
                  Skill Assessment
                </h3>

                <div className="mt-[4px]">
                  <span className="inline-flex h-[18px] items-center gap-1 rounded-full bg-white/90 px-2 text-[10px] font-semibold leading-none text-[#6938EF]">
                    <Sparkles className="h-[9px] w-[9px]" strokeWidth={2.5} />
                    AI Graded
                  </span>
                </div>
              </header>

              {/* Body */}
              <div className="px-5 pb-[19px] pt-[16px]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[12px] font-medium text-[#61718B]">
                      Assessment Score
                    </div>

                    <div className="mt-[3px] flex items-baseline">
                      <span className="text-[42px] font-bold leading-none tracking-[-1.5px] text-[#10182B]">
                        80
                      </span>

                      <span className="ml-[2px] text-[20px] font-semibold text-[#5546E8]">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Good Badge */}
                  <div className="flex h-[58px] w-[58px] flex-col items-center justify-center rounded-[11px] border border-[#E4DEFF] bg-[#F8F6FF]">
                    <Award
                      className="h-[20px] w-[20px] text-[#7440EE]"
                      strokeWidth={2}
                    />

                    <span className="mt-[2px] text-[10px] font-semibold text-[#7440EE]">
                      Good
                    </span>
                  </div>
                </div>

                {/* Assessment Progress */}
                <div className="mt-[20px] space-y-[11px]">
                  {assessmentSkills.map((skill) => (
                    <div key={skill.label} className="space-y-[5px]">
                      <div className="flex items-center justify-between text-[12px] leading-none">
                        <span className="text-[#536581]">{skill.label}</span>

                        <span className="font-semibold text-[#5146E5]">
                          {skill.value}%
                        </span>
                      </div>

                      <div className="h-[5px] overflow-hidden rounded-full bg-[#EEF0FF]">
                        <div
                          className="h-full rounded-full bg-[#5546E8]"
                          style={{
                            width: `${skill.value}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="mt-[16px] flex h-[36px] items-center gap-2 rounded-[9px] border border-[#E7E0FF] bg-[#F7F4FF] px-3">
                  <Lightbulb
                    className="h-[14px] w-[14px] text-[#7040EF]"
                    strokeWidth={1.8}
                  />

                  <span className="text-[11px] font-medium text-[#7040EF]">
                    3 improvement suggestions ready
                  </span>
                </div>
              </div>
            </article>

            {/* Desktop Arrow 2 */}
            <div className="pointer-events-none absolute left-2/3 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
              <ArrowRight
                className="h-[22px] w-[22px] text-[#BFAEFF]"
                strokeWidth={1.8}
              />
            </div>

            {/* =====================================================
                CARD 3 — CANDIDATE RANKING
            ====================================================== */}
            <article className="relative w-full overflow-hidden rounded-[16px] border border-[#DCE3EE] bg-white shadow-[0_10px_28px_rgba(30,41,59,0.05)]">
              {/* Header */}
              <header className="h-[68px] bg-[#131C2F] px-5 pt-[14px]">
                <h3 className="text-[14px] font-bold leading-[17px] text-white">
                  Candidate Ranking
                </h3>

                <div className="mt-[4px]">
                  <span className="inline-flex h-[16px] items-center gap-[4px] rounded-full bg-[#5546E8] px-[7px] text-[9px] font-semibold leading-none text-white">
                    <Zap className="h-[9px] w-[9px]" strokeWidth={2.5} />
                    Auto-Ranked
                  </span>
                </div>
              </header>

              {/* Body */}
              <div className="px-5 pb-[18px] pt-[19px]">
                {/* Main Ranking */}
                <div className="flex items-center gap-[14px]">
                  <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-[#633CEB] text-[21px] font-bold text-white shadow-[0_8px_18px_rgba(99,60,235,0.25)]">
                    #2
                  </div>

                  <div>
                    <div className="text-[19px] font-bold leading-[23px] tracking-[-0.3px] text-[#151D31]">
                      83.25% Overall
                    </div>

                    <div className="mt-[2px] text-[11px] leading-[14px] text-[#70809A]">
                      Top 15% of Applicants
                    </div>

                    <div className="mt-[1px] flex items-center gap-1 text-[10px] font-medium text-[#F59E0B]">
                      <Trophy className="h-[11px] w-[11px]" strokeWidth={2} />
                      Top Candidate
                    </div>
                  </div>
                </div>

                {/* Top Candidates */}
                <div className="mt-[18px]">
                  <div className="mb-[7px] flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#61718B]">
                      Top Candidates
                    </span>

                    <button
                      type="button"
                      className="flex items-center gap-[2px] text-[11px] font-semibold text-[#5546E8]"
                    >
                      View All
                      <ArrowRight
                        className="h-[12px] w-[12px]"
                        strokeWidth={2}
                      />
                    </button>
                  </div>

                  <div className="space-y-[7px]">
                    {candidates.map((candidate) => {
                      const avatarClasses = {
                        green: "bg-[#159447]",
                        purple: "bg-[#6541E9]",
                        gray: "bg-[#5F6F87]",
                      };

                      const rankClasses =
                        candidate.rank === 1
                          ? "bg-[#5546E8] text-white"
                          : candidate.rank === 2
                            ? "bg-[#7040EF] text-white"
                            : "bg-[#9AAAC0] text-white";

                      const candidateContainer = candidate.active
                        ? "border border-[#BFC7FF] bg-[#F5F5FF]"
                        : candidate.rank === 1
                          ? "bg-[#EEF2FF]"
                          : "bg-[#F8FAFC]";

                      const scoreColor =
                        candidate.rank === 1
                          ? "text-[#16A34A]"
                          : candidate.rank === 2
                            ? "text-[#5546E8]"
                            : "text-[#63748D]";

                      return (
                        <div
                          key={candidate.rank}
                          className={`flex h-[48px] items-center justify-between rounded-[9px] px-3 ${candidateContainer}`}
                        >
                          <div className="flex min-w-0 items-center gap-[9px]">
                            {/* Rank */}
                            <div
                              className={`flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${rankClasses}`}
                            >
                              {candidate.rank}
                            </div>

                            {/* Avatar */}
                            <div
                              className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${avatarClasses[candidate.avatar]}`}
                            >
                              {candidate.initials}
                            </div>

                            {/* Name */}
                            <span className="truncate text-[12px] font-semibold text-[#202A3D]">
                              {candidate.name}
                            </span>
                          </div>

                          {/* Score */}
                          <span
                            className={`ml-2 shrink-0 text-[12px] font-bold ${scoreColor}`}
                          >
                            {candidate.score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
