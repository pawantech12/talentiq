"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  Info,
  Lightbulb,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const params = useParams();

  /*
   * ------------------------------------------------------------
   * GET JOB ID FROM /jobs/[id]/analysis
   * ------------------------------------------------------------
   */

  const jobId = useMemo(() => {
    const value = params?.id;

    if (Array.isArray(value)) {
      return value[0];
    }

    return value || "";
  }, [params]);

  /*
   * ------------------------------------------------------------
   * STATE
   * ------------------------------------------------------------
   */

  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  /*
   * ------------------------------------------------------------
   * JOB DATA
   *
   * Replace this later with API data.
   * ------------------------------------------------------------
   */

  const job = {
    id: jobId,
    title: "Full Stack Developer",
    company: "ABC Technologies",
  };

  /*
   * ------------------------------------------------------------
   * ANALYSIS DATA
   * ------------------------------------------------------------
   */

  const analysis = {
    overallScore: 86,

    matchedRequirements: 4,

    skillGaps: 1,

    profileStatus: "Strong Match",

    scoreBreakdown: [
      {
        name: "Skill Match",
        score: 85,
        type: "purple",
      },
      {
        name: "Semantic Match",
        score: 80,
        type: "purple",
      },
      {
        name: "Experience Match",
        score: 100,
        type: "green",
      },
      {
        name: "Education Match",
        score: 100,
        type: "green",
      },
      {
        name: "Profile Relevance",
        score: 80,
        type: "purple",
      },
    ],

    matchedSkills: ["React", "JavaScript", "Node.js", "MongoDB"],

    skillGaps: ["Express.js"],

    resumeInformation: [
      {
        label: "Skills",
        value: "React, JavaScript, Node.js, MongoDB",
      },
      {
        label: "Education",
        value: "MCA",
      },
      {
        label: "Experience",
        value: "2 Years",
      },
      {
        label: "Projects",
        value: "E-commerce Website",
      },
    ],

    summary:
      "Your resume matches most of the technical requirements for this role. Your strongest matches are React, JavaScript, Node.js and MongoDB. Express.js appears to be the main skill gap.",
  };

  /*
   * ------------------------------------------------------------
   * SCORE RING
   * ------------------------------------------------------------
   */

  const radius = 58;
  const circumference = 2 * Math.PI * radius;

  const scoreOffset =
    circumference - (analysis.overallScore / 100) * circumference;

  /*
   * ------------------------------------------------------------
   * INITIAL LOAD
   *
   * This simulates the AI analysis process.
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * SAVE ANALYSIS STATE
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!jobId || isLoading) {
      return;
    }

    try {
      const applicationData = {
        jobId,
        jobTitle: job.title,
        company: job.company,
        analysisCompleted: true,
        overallScore: analysis.overallScore,
        matchedRequirements: analysis.matchedRequirements,
        skillGaps: analysis.skillGaps,
        updatedAt: new Date().toISOString(),
      };

      sessionStorage.setItem(
        `resumeai-analysis-${jobId}`,
        JSON.stringify(applicationData),
      );
    } catch (error) {
      console.error("Unable to save analysis state:", error);
    }
  }, [jobId, isLoading]);

  /*
   * ------------------------------------------------------------
   * NAVIGATION HELPERS
   * ------------------------------------------------------------
   */

  const navigateTo = (url) => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    router.push(url);
  };

  /*
   * ------------------------------------------------------------
   * CONTINUE TO ASSESSMENT
   * ------------------------------------------------------------
   */

  const handleContinue = () => {
    if (!jobId) {
      return;
    }

    navigateTo(
      `/dashboard/student/jobs/${encodeURIComponent(jobId)}/assessment`,
    );
  };

  /*
   * ------------------------------------------------------------
   * VIEW APPLICATION
   * ------------------------------------------------------------
   */

  const handleViewApplication = () => {
    if (!jobId) {
      return;
    }

    navigateTo(`/dashboard/student/jobs/${encodeURIComponent(jobId)}/apply`);
  };

  /*
   * ------------------------------------------------------------
   * LOADING STATE
   * ------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
        <div className="mx-auto w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-7 lg:py-8">
          <div className="animate-pulse">
            <div className="h-7 w-[240px] rounded-md bg-[#E2E8F0]" />

            <div className="mt-2 h-4 w-[340px] rounded-md bg-[#E2E8F0]" />

            <div className="mt-2 h-4 w-[250px] rounded-md bg-[#E2E8F0]" />

            <div className="mt-6 h-[330px] rounded-[12px] border border-[#DCE3EE] bg-white" />

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="h-[190px] rounded-[12px] border border-[#DCE3EE] bg-white" />

              <div className="h-[190px] rounded-[12px] border border-[#DCE3EE] bg-white" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="h-[250px] rounded-[12px] border border-[#DCE3EE] bg-white" />

              <div className="h-[250px] rounded-[12px] border border-[#DCE3EE] bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------------------------
   * MAIN PAGE
   * ------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="mx-auto w-full px-4 pb-28 pt-5 sm:px-6 sm:pb-8 sm:pt-7 lg:px-7 lg:pt-8">
        {/* =====================================================
            PAGE HEADING
        ====================================================== */}

        <div className="mb-4 sm:mb-5 lg:mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[21px] font-bold leading-7 tracking-[-0.025em] text-[#111827] sm:text-[24px] lg:text-[25px]">
              AI Resume Analysis
            </h1>

            <span className="inline-flex items-center gap-1 rounded-full border border-[#E9D5FF] bg-[#FAF5FF] px-2.5 py-1 text-[10px] font-semibold text-[#7C3AED] sm:text-[11px]">
              <Sparkles size={12} strokeWidth={1.8} />
              AI Powered
            </span>
          </div>

          <p className="mt-1 text-[13px] leading-5 text-[#64748B] sm:text-[14px]">
            Your resume has been analyzed against the requirements of this job.
          </p>

          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#64748B] sm:text-[12px]">
            <BriefcaseBusiness size={13} strokeWidth={1.7} />

            <span>
              {job.title} · {job.company}
            </span>
          </div>
        </div>

        {/* =====================================================
            TOP SCORE / BREAKDOWN CARD
        ====================================================== */}

        <section className="rounded-[12px] border border-[#DCE3EE] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
            {/* SCORE */}

            <div className="flex flex-col items-center justify-center px-4 py-5 sm:px-6 sm:py-6 lg:px-6 lg:py-7">
              <h2 className="order-1 text-[15px] font-bold text-[#111827] lg:order-2 lg:mt-3">
                Your Resume Match
              </h2>

              {/* SCORE RING */}

              <div className="relative order-2 mt-4 flex h-[150px] w-[150px] items-center justify-center lg:order-1 lg:mt-0">
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 140 140"
                >
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#EEF2FF"
                    strokeWidth="10"
                  />

                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={scoreOffset}
                  />
                </svg>

                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[30px] font-bold leading-8 tracking-[-0.03em] text-[#111827] sm:text-[32px]">
                    {analysis.overallScore}%
                  </span>

                  <span className="mt-1 text-[12px] font-semibold text-[#16A34A]">
                    Strong Match
                  </span>
                </div>
              </div>

              <p className="order-3 mt-4 max-w-[340px] text-center text-[12px] leading-[17px] text-[#64748B] sm:text-[13px] lg:mt-1">
                Your resume matches most of the requirements for this role.
              </p>

              {/* MOBILE STATISTICS */}

              <div className="order-4 mt-4 grid w-full max-w-[320px] grid-cols-3 overflow-hidden rounded-[9px] border border-[#DCE3EE] lg:hidden">
                <div className="flex flex-col items-center justify-center py-2.5">
                  <span className="text-[21px] font-bold leading-5 text-[#16A34A]">
                    {analysis.matchedRequirements}
                  </span>

                  <span className="mt-1 text-[10px] text-[#64748B]">
                    Matched
                  </span>
                </div>

                <div className="border-x border-[#E2E8F0]">
                  <div className="flex flex-col items-center justify-center py-2.5">
                    <span className="text-[21px] font-bold leading-5 text-[#F59E0B]">
                      {analysis.skillGaps}
                    </span>

                    <span className="mt-1 text-[10px] text-[#64748B]">
                      Skill Gap
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-2.5">
                  <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-semibold text-[#16A34A]">
                    Strong
                  </span>

                  <span className="mt-1 text-[10px] text-[#64748B]">
                    Status
                  </span>
                </div>
              </div>
            </div>

            {/* SCORE BREAKDOWN */}

            <div className="px-4 pb-5 sm:px-6 sm:pb-6 lg:px-6 lg:py-6">
              <h2 className="text-[15px] font-bold text-[#111827]">
                Score Breakdown
              </h2>

              <div className="mt-4 space-y-3">
                {analysis.scoreBreakdown.map((item) => (
                  <div key={item.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-medium text-[#475569]">
                        {item.name}
                      </span>

                      <span
                        className={`text-[12px] font-semibold ${
                          item.type === "green"
                            ? "text-[#16A34A]"
                            : "text-[#4F46E5]"
                        }`}
                      >
                        {item.score}%
                      </span>
                    </div>

                    <div className="h-[7px] overflow-hidden rounded-full bg-[#EEF2FF]">
                      <div
                        className={`h-full rounded-full ${
                          item.type === "green"
                            ? "bg-[#16A34A]"
                            : "bg-[#4F46E5]"
                        }`}
                        style={{
                          width: `${item.score}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP STATISTICS */}

              <div className="mt-4 hidden overflow-hidden rounded-[9px] border border-[#DCE3EE] lg:grid lg:grid-cols-3">
                <div className="flex flex-col items-center justify-center py-3">
                  <span className="text-[21px] font-bold leading-5 text-[#16A34A]">
                    {analysis.matchedRequirements}
                  </span>

                  <span className="mt-1 text-[11px] text-[#64748B]">
                    Matched Requirements
                  </span>
                </div>

                <div className="border-x border-[#E2E8F0]">
                  <div className="flex flex-col items-center justify-center py-3">
                    <span className="text-[21px] font-bold leading-5 text-[#F59E0B]">
                      {analysis.skillGaps}
                    </span>

                    <span className="mt-1 text-[11px] text-[#64748B]">
                      Skill Gaps
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-3">
                  <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-[10px] font-semibold text-[#16A34A]">
                    {analysis.profileStatus}
                  </span>

                  <span className="mt-1 text-[11px] text-[#64748B]">
                    Profile Status
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MATCHED SKILLS + SKILL GAPS
        ====================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* MATCHED SKILLS */}

          <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#DCFCE7] text-[#16A34A]">
                <Check size={15} strokeWidth={2} />
              </div>

              <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                Matched Skills
              </h2>
            </div>

            <p className="mt-2 text-[11px] leading-4 text-[#64748B] sm:text-[12px]">
              Skills found in your resume that match the job requirements.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1.5 text-[11px] font-medium text-[#16A34A]"
                >
                  <Check size={12} strokeWidth={2} />

                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* SKILL GAPS */}

          <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#FEF3C7] text-[#F59E0B]">
                <TriangleAlert size={15} strokeWidth={1.8} />
              </div>

              <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                Skill Gaps
              </h2>
            </div>

            <p className="mt-2 text-[11px] leading-4 text-[#64748B] sm:text-[12px]">
              Skills required by this job that were not clearly identified in
              your resume.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {analysis.skillGaps.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B] bg-[#FFFBEB] px-3 py-1.5 text-[11px] font-medium text-[#F59E0B]"
                >
                  <TriangleAlert size={12} strokeWidth={1.8} />

                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-[8px] bg-[#FFFBEB] px-3 py-2.5">
              <Lightbulb
                size={15}
                className="mt-0.5 shrink-0 text-[#F59E0B]"
                strokeWidth={1.7}
              />

              <p className="text-[11px] leading-[15px] text-[#64748B]">
                Improving this skill may increase your compatibility with
                similar backend and full-stack roles.
              </p>
            </div>
          </section>
        </div>

        {/* =====================================================
            RESUME INFORMATION + AI SUMMARY
        ====================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* RESUME INFORMATION */}

          <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                <FileText size={15} strokeWidth={1.8} />
              </div>

              <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                Resume Information
              </h2>
            </div>

            <div className="mt-3 overflow-hidden rounded-[9px] border border-[#DCE3EE]">
              {analysis.resumeInformation.map((item, index) => (
                <div
                  key={item.label}
                  className={`grid grid-cols-[82px_minmax(0,1fr)] items-center gap-3 px-3 py-2.5 sm:grid-cols-[100px_minmax(0,1fr)] ${
                    index !== analysis.resumeInformation.length - 1
                      ? "border-b border-[#DCE3EE]"
                      : ""
                  }`}
                >
                  <span className="text-[11px] text-[#64748B] sm:text-[12px]">
                    {item.label}
                  </span>

                  <span className="break-words text-right text-[11px] font-medium leading-4 text-[#111827] sm:text-[12px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowDetails((value) => !value)}
              className="mt-3 text-[11px] font-medium text-[#4F46E5] hover:text-[#4338CA]"
            >
              {showDetails ? "Hide resume details" : "View resume details"}
            </button>

            {showDetails && (
              <div className="mt-3 rounded-[8px] bg-[#F8FAFC] p-3">
                <p className="text-[11px] leading-[16px] text-[#64748B]">
                  Your uploaded resume contains the technical skills, education,
                  experience and project information used for this analysis.
                </p>
              </div>
            )}
          </section>

          {/* AI SUMMARY */}

          <section className="rounded-[12px] border border-[#E9D5FF] bg-[#F5F3FF] p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EDE9FE] text-[#7C3AED]">
                <Sparkles size={15} strokeWidth={1.8} />
              </div>

              <h2 className="text-[14px] font-bold text-[#7C3AED] sm:text-[15px]">
                AI Summary
              </h2>
            </div>

            <p className="mt-4 text-[12px] leading-[17px] text-[#475569] sm:text-[13px]">
              {analysis.summary}
            </p>
          </section>
        </div>

        {/* =====================================================
            NEXT STEP
        ====================================================== */}

        <section className="mt-5 rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
              <ArrowRight size={15} strokeWidth={1.8} />
            </div>

            <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
              Next Step
            </h2>
          </div>

          <p className="mt-3 max-w-[760px] text-[11px] leading-[16px] text-[#475569] sm:text-[12px]">
            Complete the job-specific skill assessment to evaluate your
            practical skills and calculate your final compatibility score.
          </p>

          {/* DESKTOP ACTIONS */}

          <div className="mt-4 hidden gap-3 sm:flex">
            <button
              type="button"
              onClick={handleContinue}
              disabled={!jobId || isNavigating}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#4338CA] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isNavigating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Loading...
                </>
              ) : (
                <>
                  <ArrowRight size={15} />
                  Continue to Skill Assessment
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleViewApplication}
              disabled={!jobId || isNavigating}
              className="inline-flex h-10 min-w-[142px] items-center justify-center rounded-[8px] border border-[#DCE3EE] bg-white px-5 text-[13px] font-medium text-[#475569] transition hover:border-[#C7D2FE] hover:text-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              View Application
            </button>
          </div>
        </section>
      </div>

      {/* =====================================================
          MOBILE FIXED ACTION BAR
      ====================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DCE3EE] bg-white/95 px-4 pb-3 pt-3 backdrop-blur-md sm:hidden">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!jobId || isNavigating}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[9px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(79,70,229,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isNavigating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Loading...
            </>
          ) : (
            <>
              <ArrowRight size={15} />
              Continue to Skill Assessment
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleViewApplication}
          disabled={!jobId || isNavigating}
          className="mt-2 flex h-8 w-full items-center justify-center text-[12px] font-medium text-[#64748B] disabled:opacity-50"
        >
          View Application
        </button>
      </div>
    </main>
  );
}
