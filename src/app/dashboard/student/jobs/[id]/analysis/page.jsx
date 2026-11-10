"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileText,
  Lightbulb,
  MapPin,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import api from "@/lib/api";

function scoreLabel(score) {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Moderate Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value || "";
  }, [params]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    let active = true;

    async function loadAnalysis() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/student/jobs/${jobId}/analysis`);

        if (active) setData(response.data);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message || "Unable to load your resume analysis.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [jobId]);

  async function retry() {
    setRetrying(true);
    setError("");

    try {
      const response = await api.get(`/student/jobs/${jobId}/analysis`);
      setData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your analysis. Please try again.",
      );
    } finally {
      setRetrying(false);
    }
  }

  const job = data?.job;
  const application = data?.application;
  const analysis = data?.analysis;

  const score = Number(analysis?.score || 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (score / 100) * circumference;

  const breakdown = [
    { name: "Skill Match", score: analysis?.breakdown?.skill || 0 },
    { name: "Experience Match", score: analysis?.breakdown?.experience || 0 },
    { name: "Education Match", score: analysis?.breakdown?.education || 0 },
    { name: "Profile Relevance", score: analysis?.breakdown?.profile || 0 },
  ];

  const matchedSkills = analysis?.matchedSkills || [];
  const missingSkills = analysis?.missingSkills || [];
  const strengths = analysis?.strengths || [];
  const improvements = analysis?.improvements || [];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-5">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-7 w-64 rounded bg-slate-200" />
          <div className="mt-5 h-64 rounded-xl bg-white" />
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="h-52 rounded-xl bg-white" />
            <div className="h-52 rounded-xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !data || !analysis) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-5">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 text-red-600">
            <TriangleAlert size={19} />
            <h1 className="font-bold">Analysis unavailable</h1>
          </div>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={retry}
              disabled={retrying}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {retrying ? "Retrying..." : "Try Again"}
            </button>
            <button
              onClick={() =>
                router.push(`/dashboard/student/jobs/${jobId}/apply`)
              }
              className="rounded-lg border px-4 py-2 text-sm font-medium"
            >
              Back to Application
            </button>
          </div>
        </div>
      </main>
    );
  }

  const matchedCount = matchedSkills.length;
  const gapCount = missingSkills.length;
  const status = scoreLabel(score);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="mx-auto w-full px-4 pb-10 pt-5 sm:px-6 sm:pt-7 lg:px-7">
        <div className="mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold sm:text-[25px]">
              AI Resume Analysis
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
              <Sparkles size={12} /> AI Powered
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Your submitted resume has been compared with this job's
            requirements.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness size={14} />
              {job.title} · {job.company}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {job.location}
            </span>
          </div>
        </div>

        <section className="rounded-xl border border-[#DCE3EE] bg-white shadow-sm">
          <div className="grid lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="flex flex-col items-center justify-center p-6">
              <div className="relative flex h-40 w-40 items-center justify-center">
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
                <div className="relative text-center">
                  <p className="text-3xl font-bold">{score}%</p>
                  <p className="mt-1 text-xs font-semibold text-indigo-600">
                    {status}
                  </p>
                </div>
              </div>

              <h2 className="mt-3 text-base font-bold">Your Resume Match</h2>
              <p className="mt-2 max-w-xs text-center text-xs leading-5 text-slate-500">
                This score is an AI-generated estimate based on the resume
                information and job details provided.
              </p>

              <div className="mt-5 grid w-full grid-cols-3 overflow-hidden rounded-lg border">
                <div className="py-3 text-center">
                  <p className="text-xl font-bold text-green-600">
                    {matchedCount}
                  </p>
                  <p className="text-[10px] text-slate-500">Matched Skills</p>
                </div>
                <div className="border-x py-3 text-center">
                  <p className="text-xl font-bold text-amber-600">{gapCount}</p>
                  <p className="text-[10px] text-slate-500">Skill Gaps</p>
                </div>
                <div className="py-3 text-center">
                  <p className="text-sm font-bold text-indigo-600">
                    {analysis.confidence}
                  </p>
                  <p className="text-[10px] text-slate-500">Confidence</p>
                </div>
              </div>
            </div>

            <div className="border-t p-5 sm:p-6 lg:border-l lg:border-t-0">
              <h2 className="font-bold">Score Breakdown</h2>
              <div className="mt-5 space-y-5">
                {breakdown.map((item) => (
                  <div key={item.name}>
                    <div className="mb-2 flex justify-between gap-3 text-xs">
                      <span className="font-medium text-slate-600">
                        {item.name}
                      </span>
                      <span className="font-bold text-indigo-600">
                        {item.score}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-indigo-50">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-[#DCE3EE] bg-white p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={19} />
              <h2 className="font-bold">Matched Skills</h2>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Skills supported by evidence in your resume or profile.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {matchedSkills.length ? (
                matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700"
                  >
                    <Check size={12} /> {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  No matching skills were identified.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-[#DCE3EE] bg-white p-5">
            <div className="flex items-center gap-2">
              <TriangleAlert className="text-amber-500" size={19} />
              <h2 className="font-bold">Skill Gaps</h2>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Job skills that were not clearly demonstrated in the submitted
              resume.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {missingSkills.length ? (
                missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-500">
                  No specific skill gaps were identified.
                </p>
              )}
            </div>
            {missingSkills.length > 0 && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-slate-600">
                <Lightbulb
                  className="mt-0.5 shrink-0 text-amber-600"
                  size={16}
                />
                Review these skills and add relevant project or work evidence to
                your resume if you have it.
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-[#DCE3EE] bg-white p-5">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              <h2 className="font-bold">Application Details</h2>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between gap-4 border-b pb-3">
                <span className="text-slate-500">Resume submitted</span>
                <span className="max-w-[65%] break-words text-right font-semibold">
                  {application.resumeName}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b pb-3">
                <span className="text-slate-500">Resume source</span>
                <span className="font-semibold">
                  {application.resumeSource === "profile"
                    ? "Profile resume"
                    : "Newly uploaded PDF"}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-b pb-3">
                <span className="text-slate-500">Application status</span>
                <span className="font-semibold text-green-700">
                  {application.status}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Submitted</span>
                <span className="font-semibold">
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails((value) => !value)}
              className="mt-4 text-xs font-semibold text-indigo-600"
            >
              {showDetails ? "Hide job requirements" : "View job requirements"}
            </button>

            {showDetails && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                <p>
                  <strong>Required skills:</strong>{" "}
                  {job.requiredSkills.join(", ") || "Not specified"}
                </p>
                <p className="mt-2">
                  <strong>Preferred skills:</strong>{" "}
                  {job.preferredSkills.join(", ") || "Not specified"}
                </p>
                <p className="mt-2">
                  <strong>Education:</strong>{" "}
                  {job.educationRequirement || "Not specified"}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-purple-200 bg-purple-50 p-5">
            <div className="flex items-center gap-2 text-purple-700">
              <Sparkles size={18} />
              <h2 className="font-bold">AI Summary</h2>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
              {analysis.summary || "No summary was returned by the AI model."}
            </p>

            {analysis.recommendation && (
              <div className="mt-4 rounded-lg border border-purple-100 bg-white/70 p-3">
                <p className="text-xs font-bold text-purple-700">
                  AI Recommendation
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {analysis.recommendation}
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-[#DCE3EE] bg-white p-5">
            <h2 className="font-bold">Your Strengths</h2>
            <ul className="mt-3 space-y-2">
              {strengths.length ? (
                strengths.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-2 text-xs leading-5 text-slate-600"
                  >
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0 text-green-600"
                    />
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">
                  No specific strengths were returned.
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-[#DCE3EE] bg-white p-5">
            <h2 className="font-bold">Areas to Improve</h2>
            <ul className="mt-3 space-y-2">
              {improvements.length ? (
                improvements.map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-2 text-xs leading-5 text-slate-600"
                  >
                    <Lightbulb
                      size={15}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500">
                  No specific improvements were returned.
                </li>
              )}
            </ul>
          </section>
        </div>

        <section className="mt-5 rounded-xl border border-[#DCE3EE] bg-white p-5">
          <div className="flex items-center gap-2">
            <ArrowRight className="text-indigo-600" size={18} />
            <h2 className="font-bold">Next Step</h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {job.requireSkillAssessment
              ? `This job includes a ${job.assessmentType || "job-specific"} assessment. You can continue to the assessment when it is ready.`
              : "Your application has been submitted. You can return to the job details or review your application."}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {job.requireSkillAssessment && (
              <button
                onClick={() =>
                  router.push(`/dashboard/student/jobs/${jobId}/assessment`)
                }
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Continue to Skill Assessment <ArrowRight size={15} />
              </button>
            )}

            <button
              onClick={() => router.push(`/dashboard/student/jobs/${jobId}`)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 hover:border-indigo-300"
            >
              Back to Job Details
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
