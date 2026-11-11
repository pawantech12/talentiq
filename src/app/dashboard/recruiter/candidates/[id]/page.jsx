"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  BriefcaseBusiness,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const API = "/api";

const formatPercent = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
};

const displayValue = (value, fallback = "Not specified") =>
  value === undefined || value === null || value === "" ? fallback : value;

const statusClass = (status) => {
  if (status === "Rejected") return "bg-red-50 text-red-600";
  if (status === "Shortlisted") return "bg-[#dcfce7] text-[#16a34a]";
  if (status === "Under Review") return "bg-amber-50 text-amber-700";
  return "bg-[#eef2ff] text-[#4f46e5]";
};

const dateText = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export default function CandidateDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const candidateId = params?.id;
  const jobId = searchParams.get("jobId");
  const applicationId = searchParams.get("applicationId");

  const [candidate, setCandidate] = useState(null);
  const [candidateStatus, setCandidateStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState("");
  const [showResume, setShowResume] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadCandidate = useCallback(async () => {
    if (!candidateId || !jobId || !applicationId) {
      setPageError(
        "Candidate, job, or application ID is missing from the page URL.",
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setPageError("");

      const response = await axios.get(
        `${API}/recruiter/candidates/${candidateId}`,
        {
          params: { jobId, applicationId },
          withCredentials: true,
          headers: { "Cache-Control": "no-cache" },
        },
      );

      if (!response.data?.success || !response.data?.candidate) {
        throw new Error(
          response.data?.message || "Candidate details not found.",
        );
      }

      setCandidate(response.data.candidate);
      setCandidateStatus(response.data.candidate.status || "Submitted");
    } catch (error) {
      console.error("Load candidate details error:", error);
      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load candidate details.",
      );
    } finally {
      setLoading(false);
    }
  }, [candidateId, jobId, applicationId]);

  useEffect(() => {
    loadCandidate();
  }, [loadCandidate]);

  const goBack = () => {
    if (jobId) {
      router.push(`/dashboard/recruiter/jobs/${jobId}/applicants`);
    } else {
      router.back();
    }
  };

  const updateCandidateStatus = async (status) => {
    if (!jobId || !applicationId || updatingStatus) return;

    try {
      setUpdatingStatus(true);

      const response = await axios.patch(
        `${API}/recruiter/jobs/${jobId}/applicants/${applicationId}`,
        { status },
        { withCredentials: true },
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to update status.");
      }

      setCandidateStatus(response.data.application?.status || status);
      setCandidate((previous) =>
        previous ? { ...previous, status } : previous,
      );
      showToast(
        status === "Shortlisted"
          ? "Candidate shortlisted successfully."
          : status === "Rejected"
            ? "Candidate rejected."
            : "Application status updated.",
      );
    } catch (error) {
      console.error("Update candidate status error:", error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Unable to update candidate status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const resumeText = candidate?.resume?.text || "";
  const resumePdfAvailable = Boolean(candidate?.resume?.pdfAvailable);

  const resumePdfUrl =
    candidateId && jobId && applicationId
      ? `/api/recruiter/candidates/${candidateId}/resume?jobId=${encodeURIComponent(
          jobId,
        )}&applicationId=${encodeURIComponent(applicationId)}`
      : "";

  const resumeAvailable = Boolean(candidate?.resume?.available);

  const resumeContent = useMemo(() => {
    if (!candidate) return "";

    const experience = (candidate.experienceHistory || [])
      .map(
        (item) =>
          `${item.title || ""}\n${item.company || ""}\n${item.duration || ""}\n${item.description || ""}`,
      )
      .join("\n\n");

    const education = (candidate.education || [])
      .map(
        (item) =>
          `${item.degree || ""}\n${item.field || ""}\n${item.duration || ""}`,
      )
      .join("\n\n");

    const skills = (candidate.skills || [])
      .map((item) => item.name)
      .filter(Boolean)
      .join(", ");

    return [
      candidate.name,
      candidate.role,
      `Email: ${candidate.email || ""}`,
      `Phone: ${candidate.phone || ""}`,
      `Location: ${candidate.location || ""}`,
      "",
      "RESUME CONTENT",
      resumeText || "No resume text was stored for this application.",
      "",
      "EXPERIENCE",
      experience,
      "",
      "EDUCATION",
      education,
      "",
      "SKILLS",
      skills,
    ].join("\n");
  }, [candidate, resumeText]);

  const downloadResume = () => {
    if (resumePdfAvailable && resumePdfUrl) {
      const link = document.createElement("a");

      link.href = `${resumePdfUrl}&download=1`;
      link.download = candidate?.resume?.originalName || "resume.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return;
    }

    if (!resumeText.trim()) return;

    const blob = new Blob([resumeText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${candidate?.resume?.name || "resume"}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const matchScore = formatPercent(candidate?.aiMatch);
  const skillsScore = formatPercent(candidate?.skillsMatch);
  const experienceScore = formatPercent(candidate?.experienceMatch);
  const educationScore = formatPercent(candidate?.educationMatch);

  const assessment = candidate?.assessment || {};
  const assessmentCompleted = assessment.status === "submitted";
  const assessmentScore =
    assessment.score === null || assessment.score === undefined
      ? null
      : formatPercent(assessment.score);

  console.log("candidate:", candidate);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-10 text-[#172033]">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-36 rounded-xl border border-[#dce3ee] bg-white" />
          <div className="h-44 rounded-xl border border-[#dce3ee] bg-white" />
          <div className="grid gap-4 lg:grid-cols-[1fr_365px]">
            <div className="h-96 rounded-xl border border-[#dce3ee] bg-white" />
            <div className="h-96 rounded-xl border border-[#dce3ee] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (pageError || !candidate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
        <div className="w-full max-w-md rounded-xl border border-[#dce3ee] bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-[#172033]">
            Unable to load candidate
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#71809a]">{pageError}</p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={loadCandidate}
              className="rounded-lg bg-[#5046e5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#453bd4]"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={goBack}
              className="rounded-lg border border-[#dce3ee] px-4 py-2.5 text-sm font-semibold text-[#52617a] hover:bg-gray-50"
            >
              Back to Applicants
            </button>
          </div>
        </div>
      </div>
    );
  }

  const matchLabel =
    matchScore >= 80
      ? "Strong Match"
      : matchScore >= 60
        ? "Good Match"
        : "Low Match";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[100] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4f46e5]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Resume preview modal */}
      {showResume && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowResume(false);
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#172033]">
                  {candidate.resume?.name || "Candidate Resume"}
                </h2>

                <p className="mt-0.5 text-xs text-[#71809a]">
                  {candidate.resume?.source === "profile"
                    ? "Resume from candidate profile"
                    : "Resume submitted with application"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResume(false)}
                aria-label="Close resume preview"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fafc]">
              {resumePdfAvailable && resumePdfUrl ? (
                <iframe
                  key={resumePdfUrl}
                  src={resumePdfUrl}
                  title="Candidate Resume PDF Preview"
                  className="h-[70vh] min-h-[450px] w-full border-0 bg-white"
                  loading="eager"
                />
              ) : (
                <div className="p-5 sm:p-8">
                  <div className="mx-auto max-w-xl whitespace-pre-wrap break-words text-sm leading-7 text-gray-700">
                    {resumeText.trim()
                      ? resumeText
                      : "Resume is not available."}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowResume(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={downloadResume}
                disabled={!resumeAvailable}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {resumePdfAvailable ? "Download PDF" : "Download Resume Text"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assessment result modal */}
      {showAssessment && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAssessment(false);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#172033]">
                  Assessment Result
                </h2>
                <p className="mt-0.5 text-xs text-[#71809a]">
                  {assessment.submittedAt
                    ? `Submitted ${assessment.submittedAt}`
                    : "Job-specific skill assessment"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssessment(false)}
                aria-label="Close assessment result"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5">
              {assessmentCompleted ? (
                <>
                  <div className="rounded-lg bg-[#f8fafc] p-4">
                    <p className="text-xs text-[#71809a]">Overall score</p>
                    <p className="mt-1 text-3xl font-bold text-[#5046e5]">
                      {assessmentScore === null ? "—" : `${assessmentScore}%`}
                    </p>
                  </div>
                  {assessment.breakdown?.length ? (
                    assessment.breakdown.map((item, index) => (
                      <div key={`${item.name}-${index}`}>
                        <div className="mb-1 flex justify-between gap-3 text-xs text-[#52617a]">
                          <span>{item.name}</span>
                          <strong className="text-[#4f46e5]">
                            {formatPercent(item.score)}%
                          </strong>
                        </div>
                        <div className="h-[6px] overflow-hidden rounded-full bg-[#dce3ee]">
                          <div
                            className="h-full rounded-full bg-[#5046e5]"
                            style={{ width: `${formatPercent(item.score)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#71809a]">
                      No skill-wise breakdown was saved for this assessment.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-[#71809a]">
                  This candidate has not submitted the assessment yet.
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 p-4 text-right">
              <button
                type="button"
                onClick={() => setShowAssessment(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full px-4 py-5 sm:px-6 lg:py-6">
        {/* Breadcrumb / Back */}
        <div className="mb-4">
          <div className="hidden items-center gap-2 text-xs text-[#71809a] lg:flex">
            <button
              type="button"
              onClick={goBack}
              className="transition hover:text-[#4f46e5]"
            >
              Jobs
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="max-w-[220px] truncate">
              {displayValue(candidate.job?.title, "Job")}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
            <button
              type="button"
              onClick={goBack}
              className="transition hover:text-[#4f46e5]"
            >
              Applicants
            </button>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-[#4f46e5]">
              {candidate.name}
            </span>
          </div>

          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4f46e5] transition hover:text-[#4338ca] lg:mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applicants
          </button>

          <h1 className="mt-1 text-xl font-bold tracking-[-0.02em] text-[#172033] lg:hidden">
            Candidate Details
          </h1>
        </div>

        {/* Candidate Header Card */}
        <section className="rounded-xl border border-[#dce3ee] bg-white px-4 py-4 sm:px-5 lg:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5046e5] text-lg font-semibold text-white">
                {candidate.initials ||
                  candidate.name?.slice(0, 2)?.toUpperCase() ||
                  "CA"}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-[-0.02em] text-[#172033] sm:text-xl">
                    {candidate.name}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(candidateStatus)}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${candidateStatus === "Rejected" ? "bg-red-500" : candidateStatus === "Shortlisted" ? "bg-[#22c55e]" : candidateStatus === "Under Review" ? "bg-amber-500" : "bg-[#5046e5]"}`}
                    />
                    {candidateStatus}
                  </span>
                </div>

                <p className="mt-0.5 text-sm font-medium text-[#4f46e5]">
                  {displayValue(candidate.role, "Candidate")}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#71809a]">
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {displayValue(candidate.experience)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {displayValue(candidate.location)}
                  </span>
                  {candidate.email && (
                    <a
                      href={`mailto:${candidate.email}`}
                      className="inline-flex items-center gap-1.5 hover:text-[#4f46e5]"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {candidate.email}
                    </a>
                  )}
                  {candidate.phone && (
                    <a
                      href={`tel:${candidate.phone}`}
                      className="inline-flex items-center gap-1.5 hover:text-[#4f46e5]"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {candidate.phone}
                    </a>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Applied {candidate.appliedDate || "date unavailable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={downloadResume}
                disabled={!resumeAvailable}
                className="inline-flex items-center gap-2 rounded-lg border border-[#dce3ee] bg-white px-4 py-2.5 text-sm font-medium text-[#52617a] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Download Resume
              </button>
              <button
                type="button"
                onClick={() => updateCandidateStatus("Rejected")}
                disabled={updatingStatus || candidateStatus === "Rejected"}
                className="inline-flex items-center gap-2 rounded-lg border border-[#ff4d5a] bg-white px-4 py-2.5 text-sm font-medium text-[#ff3b45] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => updateCandidateStatus("Shortlisted")}
                disabled={updatingStatus || candidateStatus === "Shortlisted"}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5046e5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#453bd4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {updatingStatus ? "Updating..." : "Shortlist"}
              </button>
            </div>
          </div>

          {/* Mobile actions */}
          <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2 border-t border-[#edf0f5] pt-4 lg:hidden">
            <button
              type="button"
              onClick={() => updateCandidateStatus("Shortlisted")}
              disabled={updatingStatus || candidateStatus === "Shortlisted"}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#5046e5] px-3 text-sm font-semibold text-white transition hover:bg-[#453bd4] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {updatingStatus ? "Updating..." : "Shortlist"}
            </button>
            <button
              type="button"
              onClick={() => updateCandidateStatus("Rejected")}
              disabled={updatingStatus || candidateStatus === "Rejected"}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#ff4d5a] bg-white px-4 text-sm font-medium text-[#ff3b45] transition hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={downloadResume}
              disabled={!resumeAvailable}
              aria-label="Download resume"
              className="flex min-h-10 w-11 items-center justify-center rounded-lg border border-[#dce3ee] bg-white text-[#52617a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* AI Candidate Match */}
        <section className="mt-4 rounded-xl border border-[#d9d2ff] bg-[#f5f3ff] px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_335px] lg:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ede9fe]">
                <Sparkles className="h-[18px] w-[18px] text-[#7c3aed]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  AI Candidate Match
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-[#7c3aed]">
                  Powered by ResumeAI Resume Screening
                </p>
                {candidate.summary && (
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-[#52617a]">
                    {candidate.summary}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] items-center gap-5 lg:grid-cols-[78px_1fr]">
              <div className="text-center lg:text-right">
                <div className="text-4xl font-bold leading-none tracking-[-0.04em] text-[#5046e5]">
                  {matchScore}%
                </div>
                <span className="mt-1 inline-flex rounded-full bg-[#5046e5] px-2.5 py-1 text-[10px] font-semibold text-white">
                  {matchLabel}
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  ["Skills Match", skillsScore],
                  ["Experience Match", experienceScore],
                  ["Education Match", educationScore],
                ].map(([label, score]) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-[#52617a]">
                      <span>{label}</span>
                      <span className="font-bold text-[#5046e5]">{score}%</span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-full bg-[#dcd7ff]">
                      <div
                        className="h-full rounded-full bg-[#5046e5]"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-[#d9d2ff] pt-4">
            <h3 className="text-xs font-bold text-[#172033]">
              Why this candidate matches
            </h3>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              {(candidate.strengths?.length
                ? candidate.strengths
                : [
                    `${candidate.matchedSkills?.length || 0} matched skills identified`,
                    `AI match score: ${matchScore}%`,
                    `Experience match: ${experienceScore}%`,
                    `Education match: ${educationScore}%`,
                  ]
              )
                .slice(0, 4)
                .map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-start gap-2 text-xs text-[#52617a]"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
                      <Check className="h-2.5 w-2.5 text-[#16a34a]" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
            </div>
            {candidate.recommendation && (
              <p className="mt-3 text-xs leading-5 text-[#52617a]">
                <strong className="text-[#172033]">Recommendation: </strong>
                {candidate.recommendation}
              </p>
            )}
          </div>
        </section>

        {/* Main two-column content */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_365px]">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Skills */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Skills
                </h2>
                <p className="mt-1 text-xs text-[#71809a]">
                  Skills extracted from the candidate&apos;s profile and
                  compared with job requirements.
                </p>
              </div>

              <div className="pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#71809a]">
                    Job Skills
                  </span>
                  <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-medium text-[#4f46e5]">
                    Job Requirement
                  </span>
                </div>

                {candidate.skills?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <span
                        key={`${skill.name}-${index}`}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium ${
                          skill.required
                            ? "bg-[#eef2ff] text-[#4f46e5]"
                            : "bg-[#f1f5f9] text-[#52617a]"
                        }`}
                      >
                        {skill.required && (
                          <span className="h-1 w-1 rounded-full bg-[#4f46e5]" />
                        )}
                        {skill.name}
                        {skill.matched === false && (
                          <span className="ml-1 text-red-500">Not matched</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#71809a]">
                    No skills were found in the candidate profile.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-[#71809a]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4f46e5]" />
                    Required
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
                    Preferred / Additional
                  </span>
                </div>

                {candidate.missingSkills?.length > 0 && (
                  <div className="mt-4 border-t border-[#edf0f5] pt-3">
                    <p className="mb-2 text-[11px] font-semibold text-[#71809a]">
                      Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.missingSkills.map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Experience */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Experience
                </h2>
              </div>

              <div className="pt-4">
                {candidate.experienceHistory?.length ? (
                  candidate.experienceHistory.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="relative flex gap-3"
                    >
                      <div className="relative flex w-4 shrink-0 justify-center">
                        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-[#5046e5]" />
                        {index !== candidate.experienceHistory.length - 1 && (
                          <span className="absolute left-1/2 top-4 h-full w-px -translate-x-1/2 bg-[#dce3ee]" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <h3 className="text-sm font-bold text-[#172033]">
                            {item.title}
                          </h3>
                          {item.period && (
                            <span className="w-fit rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-semibold text-[#4f46e5]">
                              {item.period}
                            </span>
                          )}
                        </div>
                        {item.company && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#52617a]">
                            <Building2 className="h-3.5 w-3.5" />
                            {item.company}
                          </p>
                        )}
                        {item.duration && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71809a]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {item.duration}
                          </p>
                        )}
                        {item.description && (
                          <p className="mt-1.5 max-w-3xl text-xs leading-5 text-[#52617a]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#71809a]">
                    No experience details were provided.
                  </p>
                )}
              </div>
            </section>

            {/* Education */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Education
                </h2>
              </div>

              <div className="divide-y divide-[#edf0f5]">
                {candidate.education?.length ? (
                  candidate.education.map((item, index) => (
                    <div
                      key={`${item.degree}-${index}`}
                      className="flex gap-3 py-4 first:pt-4 last:pb-1"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.current ? "bg-[#eef2ff]" : "bg-[#f1f5f9]"}`}
                      >
                        <GraduationCap
                          className={`h-[18px] w-[18px] ${item.current ? "text-[#4f46e5]" : "text-[#64748b]"}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#172033]">
                          {item.degree}
                        </h3>
                        {item.university && (
                          <p className="mt-0.5 text-xs text-[#52617a]">
                            {item.university}
                          </p>
                        )}
                        {item.duration && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71809a]">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {item.duration}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-xs text-[#71809a]">
                    No education details were provided.
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Assessment */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  {candidate.job?.assessmentType ||
                    "Job-Specific Skill Assessment"}
                </h2>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${assessmentCompleted ? "bg-[#dcfce7] text-[#16a34a]" : "bg-amber-50 text-amber-700"}`}
                >
                  {assessmentCompleted
                    ? "Completed"
                    : assessment.status === "in_progress"
                      ? "In Progress"
                      : "Not Started"}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-4 rounded-lg border border-[#dce3ee] bg-[#f8fafc] p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-base font-bold text-[#5046e5]">
                  {assessmentScore === null ? "—" : `${assessmentScore}%`}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#172033]">
                    Assessment Score
                  </p>
                  <p className="mt-1 text-xs text-[#71809a]">
                    {assessmentCompleted
                      ? "Job-specific skill evaluation completed"
                      : "Assessment result is not available yet"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2.5">
                {assessment.breakdown?.length ? (
                  assessment.breakdown.map((item, index) => (
                    <div key={`${item.name}-${index}`}>
                      <div className="mb-1 flex items-center justify-between text-xs text-[#52617a]">
                        <span>{item.name}</span>
                        <span className="font-bold text-[#4f46e5]">
                          {formatPercent(item.score)}%
                        </span>
                      </div>
                      <div className="h-[5px] overflow-hidden rounded-full bg-[#dce3ee]">
                        <div
                          className="h-full rounded-full bg-[#5046e5]"
                          style={{ width: `${formatPercent(item.score)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#71809a]">
                    {assessmentCompleted
                      ? "No skill-wise assessment breakdown is available."
                      : "Skill scores will appear here after the candidate submits the assessment."}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAssessment(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#5046e5] bg-white px-4 py-2.5 text-xs font-semibold text-[#5046e5] transition hover:bg-[#f5f3ff]"
              >
                <ArrowUpRight className="h-4 w-4" />
                View Assessment Result
              </button>
            </section>

            {/* Resume */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Resume
                </h2>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#dce3ee] bg-[#f8fafc] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fee2e2]">
                  <FileText className="h-5 w-5 text-[#ef4444]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#172033]">
                    {candidate.resume?.name || "Resume not provided"}
                  </p>

                  <p className="mt-1 text-[10px] text-[#71809a]">
                    <span className="font-semibold text-[#ef4444]">
                      {resumePdfAvailable ? "PDF" : "TEXT"}
                    </span>

                    <span className="mx-1">·</span>

                    {candidate.resume?.source === "profile"
                      ? "Profile resume"
                      : "Application resume"}
                  </p>

                  {candidate.resume?.uploadedAt && (
                    <p className="mt-1 text-[10px] text-[#71809a]">
                      Uploaded:{" "}
                      {new Date(
                        candidate.resume.uploadedAt,
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowResume(true)}
                  disabled={!resumeAvailable}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5046e5] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#453bd4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Resume
                </button>

                <button
                  type="button"
                  onClick={downloadResume}
                  disabled={!resumeAvailable}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#dce3ee] bg-white px-3 py-2.5 text-xs font-semibold text-[#52617a] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {resumePdfAvailable ? "Download PDF" : "Download"}
                </button>
              </div>

              {!resumeAvailable && (
                <p className="mt-2 text-[10px] text-[#71809a]">
                  No resume PDF or stored resume text is available for this
                  candidate.
                </p>
              )}
            </section>

            {/* Application Summary */}
            <section className="rounded-xl border border-[#dce3ee] bg-white p-4 sm:p-5">
              <div className="border-b border-[#edf0f5] pb-3">
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  Application Summary
                </h2>
              </div>

              <div className="mt-2 divide-y divide-[#edf0f5]">
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Applied For</span>
                  <span className="text-right text-xs font-semibold text-[#172033]">
                    {displayValue(candidate.job?.title)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Applied</span>
                  <span className="text-right text-xs font-semibold text-[#172033]">
                    {candidate.appliedDate || "Not available"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">AI Match</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4f46e5]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5046e5]" />
                    {matchScore}% {matchLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Assessment</span>
                  <span className="text-xs font-semibold text-[#172033]">
                    {assessmentScore === null
                      ? "Not completed"
                      : `${assessmentScore}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-xs text-[#71809a]">Status</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(candidateStatus)}`}
                  >
                    {candidateStatus}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
