"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Filter,
  Sparkles,
  UsersRound,
  UserRoundCheck,
  UserRound,
} from "lucide-react";

const CANDIDATES_PER_PAGE = 5;

const AVATAR_CLASSES = [
  "bg-[#4f46e5]",
  "bg-[#7c3aed]",
  "bg-[#16a34a]",
  "bg-[#f59e0b]",
  "bg-[#0f172a]",
  "bg-[#ef4444]",
  "bg-[#0891b2]",
  "bg-[#db2777]",
  "bg-[#6366f1]",
  "bg-[#059669]",
  "bg-[#9333ea]",
  "bg-[#ea580c]",
];

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAssessmentClasses(candidate) {
  if (candidate.assessmentStatus === "pending") {
    return "bg-[#fff2c7] text-[#f59e0b]";
  }

  if (candidate.assessment >= 80) {
    return "bg-[#dcfce7] text-[#16a34a]";
  }

  return "bg-[#eef2ff] text-[#4f46e5]";
}

function getAiMatchDot(score) {
  if (score >= 85) return "bg-[#16a34a]";
  if (score >= 75) return "bg-[#4f46e5]";
  return "bg-[#f59e0b]";
}

function CandidateAvatar({ candidate, index, mobile = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${
        mobile ? "h-10 w-10 text-[12px]" : "h-9 w-9 text-[12px]"
      } ${AVATAR_CLASSES[index % AVATAR_CLASSES.length]}`}
    >
      {candidate.initials || "C"}
    </div>
  );
}

function AssessmentBadge({ candidate, mobile = false }) {
  if (candidate.assessmentStatus === "pending") {
    return (
      <span
        className={`inline-flex rounded-full bg-[#fff2c7] font-medium text-[#f59e0b] ${
          mobile
            ? "mt-0.5 px-2 py-0.5 text-[12px] leading-4"
            : "px-2.5 py-1 text-[11px] font-semibold"
        }`}
      >
        Pending
      </span>
    );
  }

  if (candidate.assessment === null || candidate.assessment === undefined) {
    return (
      <span className="inline-flex rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
        Completed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full font-semibold ${getAssessmentClasses(
        candidate,
      )} ${
        mobile
          ? "mt-0.5 px-2 py-0.5 text-[12px] leading-4"
          : "px-2.5 py-1 text-[11px]"
      }`}
    >
      {candidate.assessment}%
    </span>
  );
}

export default function ShortlistedCandidatesPage() {
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("Shortlisted");
  const [sortBy, setSortBy] = useState("Recently Shortlisted");
  const [currentPage, setCurrentPage] = useState(1);

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [stats, setStats] = useState({
    shortlisted: 0,
    strongMatches: 0,
    assessmentCompleted: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: CANDIDATES_PER_PAGE,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCandidates = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          jobId: jobFilter,
          status: statusFilter,
          sortBy,
          page: String(currentPage),
          limit: String(CANDIDATES_PER_PAGE),
        });

        const response = await fetch(
          `/api/recruiter/shortlisted?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load shortlisted candidates.",
          );
        }

        setCandidates(data.candidates || []);
        setJobs(data.jobs || []);
        setStats(
          data.stats || {
            shortlisted: 0,
            strongMatches: 0,
            assessmentCompleted: 0,
          },
        );
        setPagination(
          data.pagination || {
            page: 1,
            limit: CANDIDATES_PER_PAGE,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [jobFilter, statusFilter, sortBy, currentPage],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchCandidates(controller.signal);

    return () => controller.abort();
  }, [fetchCandidates]);

  const handleJobChange = (value) => {
    setJobFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const totalPages = pagination.totalPages || 0;
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex =
    pagination.total === 0 ? 0 : (safePage - 1) * CANDIDATES_PER_PAGE;

  const showingFrom = pagination.total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(
    startIndex + CANDIDATES_PER_PAGE,
    pagination.total,
  );

  const pageNumbers = useMemo(() => {
    if (!totalPages) return [];

    return Array.from({ length: totalPages }, (_, index) => index + 1).filter(
      (page) =>
        page === 1 || page === totalPages || Math.abs(page - safePage) <= 1,
    );
  }, [totalPages, safePage]);

  const listCount =
    statusFilter === "Shortlisted" ? stats.shortlisted : pagination.total;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7 xl:px-8">
        {/* Breadcrumb / page heading */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-1 hidden items-center gap-2 text-[13px] text-[#64748b] md:flex">
              <span>Recruiter</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-[#4f46e5]">
                Shortlisted Candidates
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[23px] font-bold leading-[30px] tracking-[-0.02em] text-[#111827] sm:text-[26px]">
                Shortlisted Candidates
              </h1>

              <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[12px] font-semibold text-[#16a34a]">
                {stats.shortlisted} Shortlisted
              </span>
            </div>

            <p className="mt-0.5 text-[14px] leading-5 text-[#64748b]">
              Review candidates shortlisted by your recruitment team.
            </p>
          </div>

          <Link
            href="/dashboard/recruiter/candidates"
            className="hidden h-10 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-[14px] font-semibold text-white transition hover:bg-[#4338ca] md:inline-flex"
          >
            <UsersRound className="h-4 w-4" />
            View Applicants
          </Link>
        </div>

        {/* Statistics */}
        <section className="mb-5 grid grid-cols-3 gap-2.5 sm:gap-4 lg:grid-cols-3">
          <div className="flex min-h-[98px] items-center gap-3 rounded-xl border border-[#dbe3ee] bg-white px-3 py-3 sm:min-h-[78px] sm:px-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#dcfce7]">
              <UserRoundCheck className="h-5 w-5 text-[#16a34a]" />
            </div>

            <div className="min-w-0">
              <p className="text-[21px] font-bold leading-6 text-[#111827] sm:text-[24px]">
                {stats.shortlisted}
              </p>
              <p className="mt-1 text-[12px] leading-4 text-[#64748b] sm:text-[13px]">
                <span className="sm:hidden">Shortlisted</span>
                <span className="hidden sm:inline">Shortlisted Candidates</span>
              </p>
            </div>
          </div>

          <div className="flex min-h-[98px] items-center gap-3 rounded-xl border border-[#dbe3ee] bg-white px-3 py-3 sm:min-h-[78px] sm:px-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eef2ff]">
              <Sparkles className="h-5 w-5 text-[#4f46e5]" />
            </div>

            <div className="min-w-0">
              <p className="text-[21px] font-bold leading-6 text-[#111827] sm:text-[24px]">
                {stats.strongMatches}
              </p>
              <p className="mt-1 text-[12px] leading-4 text-[#64748b] sm:text-[13px]">
                Strong Matches
              </p>
            </div>
          </div>

          <div className="flex min-h-[98px] items-center gap-3 rounded-xl border border-[#dbe3ee] bg-white px-3 py-3 sm:min-h-[78px] sm:px-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f0e9ff]">
              <ClipboardCheck className="h-5 w-5 text-[#7c3aed]" />
            </div>

            <div className="min-w-0">
              <p className="text-[21px] font-bold leading-6 text-[#111827] sm:text-[24px]">
                {stats.assessmentCompleted}
              </p>
              <p className="mt-1 text-[12px] leading-4 text-[#64748b]">
                <span className="sm:hidden">Assessments</span>
                <span className="hidden sm:inline">Assessment Completed</span>
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-5 rounded-xl border border-[#dbe3ee] bg-white p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center">
            {/* Job filter */}
            <div className="relative">
              <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />

              <select
                value={jobFilter}
                onChange={(e) => handleJobChange(e.target.value)}
                aria-label="Filter by job"
                className="h-10 w-full appearance-none rounded-lg border border-[#dbe3ee] bg-white pl-9 pr-9 text-[13px] font-medium text-[#475569] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 sm:w-[190px]"
              >
                <option value="all">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <span
                className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${
                  statusFilter === "Shortlisted"
                    ? "bg-[#16a34a]"
                    : "bg-[#64748b]"
                }`}
              />

              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                aria-label="Filter by candidate status"
                className="h-10 w-full appearance-none rounded-lg border border-[#dbe3ee] bg-white pl-7 pr-9 text-[13px] font-medium text-[#475569] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 sm:w-[155px]"
              >
                <option value="Shortlisted">Shortlisted</option>
                <option value="All">All Candidates</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
            </div>

            {/* Sort */}
            <div className="relative col-span-2 sm:col-span-1">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                aria-label="Sort candidates"
                className="h-10 w-full appearance-none rounded-lg border border-[#dbe3ee] bg-white pl-9 pr-9 text-[13px] font-medium text-[#475569] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 sm:w-[198px]"
              >
                <option value="Recently Shortlisted">
                  Recently Shortlisted
                </option>
                <option value="Highest AI Match">Highest AI Match</option>
                <option value="Highest Skills Match">
                  Highest Skills Match
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
            </div>
          </div>
        </section>

        {/* Candidate list */}
        <section className="overflow-hidden rounded-xl border border-[#dbe3ee] bg-white">
          {/* Section title */}
          <div className="flex items-center justify-between border-b border-[#e5eaf1] px-4 py-4 sm:px-5">
            <h2 className="text-[15px] font-bold text-[#111827] sm:text-[16px]">
              {statusFilter === "Shortlisted"
                ? "Shortlisted Candidates"
                : "All Candidates"}
            </h2>

            <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold text-[#4f46e5]">
              {listCount} Total
            </span>
          </div>

          {/* Desktop column header */}
          <div className="hidden border-b border-[#dbe3ee] bg-white px-5 py-3 lg:grid lg:grid-cols-[2.1fr_1.7fr_.9fr_.8fr_.95fr_1.15fr_1.1fr_.75fr] lg:items-center lg:gap-4">
            <p className="text-[12px] font-medium text-[#64748b]">Candidate</p>
            <p className="text-[12px] font-medium text-[#64748b]">
              Applied Job
            </p>
            <p className="text-[12px] font-medium text-[#64748b]">AI Match</p>
            <p className="text-[12px] font-medium text-[#64748b]">Skills</p>
            <p className="text-[12px] font-medium text-[#64748b]">Assessment</p>
            <p className="text-[12px] font-medium text-[#64748b]">
              Shortlisted
            </p>
            <p className="text-[12px] font-medium text-[#64748b]">Status</p>
            <p className="text-[12px] font-medium text-[#64748b]">Action</p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[88px] animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Could not load candidates
              </h3>
              <p className="mt-1 max-w-md text-[13px] text-[#64748b]">
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchCandidates()}
                className="mt-4 rounded-lg bg-[#4f46e5] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#4338ca]"
              >
                Try again
              </button>
            </div>
          )}

          {/* Candidates */}
          {!loading && !error && (
            <div>
              {candidates.map((candidate, index) => {
                const isFirstCandidate =
                  index === 0 &&
                  safePage === 1 &&
                  sortBy === "Recently Shortlisted";

                const candidateHref = `/dashboard/recruiter/candidates/${candidate.id}?jobId=${encodeURIComponent(
                  candidate.jobId,
                )}&applicationId=${encodeURIComponent(
                  candidate.applicationId,
                )}`;

                const isShortlisted = candidate.status === "Shortlisted";

                return (
                  <article
                    key={candidate.applicationId}
                    className={`relative border-b border-[#dbe3ee] px-3.5 py-4 last:border-b-0 sm:px-5 lg:px-5 lg:py-3.5 ${
                      isFirstCandidate ? "bg-[#eef2ff]/70" : "bg-white"
                    }`}
                  >
                    {/* Desktop/table layout */}
                    <div className="hidden lg:grid lg:grid-cols-[2.1fr_1.7fr_.9fr_.8fr_.95fr_1.15fr_1.1fr_.75fr] lg:items-center lg:gap-4">
                      {/* Candidate */}
                      <div className="flex min-w-0 items-center gap-3">
                        <CandidateAvatar candidate={candidate} index={index} />

                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold text-[#111827]">
                            {candidate.name}
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[#64748b]">
                            <BriefcaseBusiness className="h-3 w-3" />
                            {candidate.experience}
                          </p>
                        </div>
                      </div>

                      {/* Applied job */}
                      <div className="min-w-0">
                        <span className="inline-flex max-w-full truncate rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-medium text-[#4f46e5]">
                          {candidate.job}
                        </span>
                      </div>

                      {/* AI match */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${getAiMatchDot(
                            candidate.aiMatch,
                          )}`}
                        />
                        <span className="text-[14px] font-semibold text-[#111827]">
                          {candidate.aiMatch}%
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="text-[14px] font-semibold text-[#111827]">
                        {candidate.skills}%
                      </div>

                      {/* Assessment */}
                      <div>
                        <AssessmentBadge candidate={candidate} />
                      </div>

                      {/* Shortlisted date */}
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#64748b]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {isShortlisted
                          ? formatDate(candidate.shortlistedDate)
                          : "—"}
                      </div>

                      {/* Status */}
                      <div>
                        {isShortlisted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                            Shortlisted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-semibold text-[#64748b]">
                            {candidate.status}
                          </span>
                        )}
                      </div>

                      {/* Action */}
                      <div>
                        <Link
                          href={candidateHref}
                          className={`inline-flex h-8 items-center justify-center rounded-lg border px-3.5 text-[12px] font-semibold transition ${
                            isFirstCandidate
                              ? "border-[#4f46e5] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
                              : "border-[#dbe3ee] bg-white text-[#475569] hover:border-[#4f46e5] hover:text-[#4f46e5]"
                          }`}
                        >
                          View
                        </Link>
                      </div>
                    </div>

                    {/* Mobile / tablet card layout */}
                    <div className="lg:hidden">
                      {/* Candidate top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <CandidateAvatar
                            candidate={candidate}
                            index={index}
                            mobile
                          />

                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold leading-5 text-[#111827]">
                              {candidate.name}
                            </p>

                            <div className="mt-0.5 flex items-center gap-1">
                              <span className="inline-flex max-w-[180px] truncate rounded-full bg-[#eef2ff] px-2 py-0.5 text-[11px] font-medium text-[#4f46e5]">
                                {candidate.job}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isShortlisted ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                            Shortlisted
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-semibold text-[#64748b]">
                            {candidate.status}
                          </span>
                        )}
                      </div>

                      {/* Match metrics */}
                      <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-xl border border-[#dbe3ee] bg-[#f8fafc]">
                        <div className="border-r border-[#dbe3ee] px-2.5 py-2.5">
                          <p className="text-[11px] leading-4 text-[#64748b]">
                            AI Match
                          </p>

                          <p className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold leading-5 text-[#111827]">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${getAiMatchDot(
                                candidate.aiMatch,
                              )}`}
                            />
                            {candidate.aiMatch}%
                          </p>
                        </div>

                        <div className="border-r border-[#dbe3ee] px-2.5 py-2.5">
                          <p className="text-[11px] leading-4 text-[#64748b]">
                            Skills
                          </p>
                          <p className="mt-0.5 text-[15px] font-semibold leading-5 text-[#111827]">
                            {candidate.skills}%
                          </p>
                        </div>

                        <div className="px-2.5 py-2.5">
                          <p className="text-[11px] leading-4 text-[#64748b]">
                            Assessment
                          </p>
                          <AssessmentBadge candidate={candidate} mobile />
                        </div>
                      </div>

                      {/* Bottom row */}
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-1.5 text-[12px] text-[#64748b]">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {isShortlisted
                              ? formatDate(candidate.shortlistedDate)
                              : "Not shortlisted"}
                          </span>
                        </div>

                        <Link
                          href={candidateHref}
                          className={`inline-flex h-8 min-w-[72px] items-center justify-center rounded-lg border px-4 text-[13px] font-semibold transition ${
                            isFirstCandidate
                              ? "border-[#4f46e5] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
                              : "border-[#dbe3ee] bg-white text-[#475569] hover:border-[#4f46e5] hover:text-[#4f46e5]"
                          }`}
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}

              {candidates.length === 0 && (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
                    <UserRound className="h-5 w-5 text-[#4f46e5]" />
                  </div>

                  <h3 className="mt-3 text-[15px] font-semibold text-[#111827]">
                    {statusFilter === "Shortlisted"
                      ? "No shortlisted candidates found"
                      : "No candidates found"}
                  </h3>

                  <p className="mt-1 max-w-sm text-[13px] text-[#64748b]">
                    Try changing the job or status filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Pagination */}
        {!loading && !error && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-[12px] text-[#64748b] sm:text-left sm:text-[13px]">
              Showing{" "}
              <span className="font-medium text-[#475569]">
                {showingFrom}–{showingTo}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[#475569]">
                {pagination.total}
              </span>{" "}
              {statusFilter === "Shortlisted"
                ? "shortlisted candidates"
                : "candidates"}
            </p>

            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={safePage === 1 || totalPages === 0}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[12px] font-medium text-[#475569] transition hover:border-[#4f46e5] hover:text-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[12px] font-medium transition ${
                    safePage === page
                      ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                      : "border-[#dbe3ee] bg-white text-[#475569] hover:border-[#4f46e5] hover:text-[#4f46e5]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[12px] font-medium text-[#475569] transition hover:border-[#4f46e5] hover:text-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
