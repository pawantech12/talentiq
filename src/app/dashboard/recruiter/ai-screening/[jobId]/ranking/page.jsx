"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import axios from "axios";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers3,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";

const PAGE_SIZE = 6;

const getScoreColor = (score) => {
  if (score >= 85) return "text-[#16a34a]";
  if (score >= 75) return "text-[#4f46e5]";
  return "text-[#f59e0b]";
};

const getStatusClasses = (status) => {
  if (status === "Strong Match") {
    return "bg-[#dcfce7] text-[#16a34a]";
  }

  if (status === "Good Match") {
    return "bg-[#eef2ff] text-[#4f46e5]";
  }

  if (status === "Potential Match" || status === "Moderate Match") {
    return "bg-[#fef3c7] text-[#b7791f]";
  }

  return "bg-gray-100 text-gray-600";
};

const getAvatarColor = (index) => {
  const colors = [
    "bg-[#5046e5]",
    "bg-[#7c3aed]",
    "bg-[#16a34a]",
    "bg-[#f59e0b]",
    "bg-[#172033]",
    "bg-[#ef4444]",
    "bg-[#0f766e]",
    "bg-[#0891b2]",
    "bg-[#db2777]",
    "bg-[#9333ea]",
  ];

  return colors[index % colors.length];
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

export default function CandidateRankingPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params?.jobId;

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    strongMatches: 0,
    topCandidates: 0,
    shortlisted: 0,
    assessmentCompleted: 0,
  });

  const [sortBy, setSortBy] = useState("overall-desc");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2500);
  }, []);

  const fetchRankings = useCallback(
    async ({ silent = false } = {}) => {
      if (!jobId) return;

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setPageError("");

        const response = await axios.get(
          `/api/recruiter/ai-screening/${jobId}/ranking`,
          {
            params: {
              page: currentPage,
              limit: PAGE_SIZE,
              sortBy,
              search: search.trim(),
            },
          },
        );

        const data = response.data;

        if (!data?.success) {
          throw new Error(
            data?.message || "Unable to load candidate rankings.",
          );
        }

        setJob(data.job || null);
        setCandidates(data.candidates || []);
        setStats(
          data.stats || {
            total: 0,
            strongMatches: 0,
            topCandidates: 0,
            shortlisted: 0,
            assessmentCompleted: 0,
          },
        );
        setPagination(
          data.pagination || {
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (error) {
        const status = error.response?.status;

        if (status === 401) {
          router.replace("/login");
          return;
        }

        if (status === 403) {
          setPageError(
            error.response?.data?.message ||
              "You do not have permission to view this page.",
          );
          return;
        }

        if (status === 404) {
          setPageError(error.response?.data?.message || "Job not found.");
          return;
        }

        setPageError(
          error.response?.data?.message ||
            error.message ||
            "Unable to load candidate rankings.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId, currentPage, sortBy, search, router],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRankings();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchRankings]);

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleViewCandidate = (candidate) => {
    router.push(
      `/dashboard/recruiter/candidates/${candidate.studentId || candidate.id}` +
        `?jobId=${jobId}&applicationId=${candidate.applicationId}`,
    );
  };

  const handleShortlist = async (candidate) => {
    const action = candidate.shortlisted ? "remove" : "shortlist";

    try {
      setUpdatingId(candidate.applicationId);

      const response = await axios.patch(
        `/api/recruiter/ai-screening/${jobId}/ranking`,
        {
          applicationId: candidate.applicationId,
          action,
        },
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to update shortlist.",
        );
      }

      setCandidates((previous) =>
        previous.map((item) =>
          item.applicationId === candidate.applicationId
            ? {
                ...item,
                shortlisted: action === "shortlist",
                applicationStatus: response.data.status,
              }
            : item,
        ),
      );

      setStats((previous) => ({
        ...previous,
        shortlisted: Math.max(
          0,
          previous.shortlisted + (action === "shortlist" ? 1 : -1),
        ),
      }));

      showToast(
        action === "shortlist"
          ? `${candidate.name} shortlisted successfully.`
          : `${candidate.name} removed from shortlist.`,
      );
    } catch (error) {
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Unable to update shortlist.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages || 0;
    if (!totalPages) return [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, pagination.totalPages]);

  const startIndex =
    pagination.total > 0 ? (pagination.page - 1) * PAGE_SIZE + 1 : 0;

  const endIndex = Math.min(pagination.page * PAGE_SIZE, pagination.total);

  const handleBack = () => {
    router.push("/dashboard/recruiter/ai-screening");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[1170px] animate-pulse space-y-5">
          <div className="h-5 w-44 rounded bg-gray-200" />
          <div className="h-10 w-64 rounded bg-gray-200" />
          <div className="h-28 rounded-xl bg-gray-200" />
          <div className="h-24 rounded-xl bg-gray-200" />
          <div className="h-72 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-10">
        <div className="mx-auto max-w-[600px] rounded-xl border border-[#dce3ee] bg-white p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <Info className="h-6 w-6 text-red-500" />
          </div>

          <h1 className="mt-4 text-lg font-bold text-[#172033]">
            Unable to load candidate ranking
          </h1>

          <p className="mt-2 text-sm text-[#71809a]">{pageError}</p>

          <div className="mt-5 flex justify-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border border-[#dce3ee] px-4 py-2 text-sm font-medium text-[#52617a]"
            >
              Go Back
            </button>

            <button
              type="button"
              onClick={() => fetchRankings()}
              className="rounded-lg bg-[#5046e5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338ca]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[100] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg">
          <Check className="h-5 w-5 shrink-0 text-[#4f46e5]" />
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast("")}
            aria-label="Close notification"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1170px] px-4 py-5 sm:px-6 lg:px-0 lg:py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <div className="hidden items-center gap-2 text-xs text-[#71809a] lg:flex">
            <button
              type="button"
              onClick={handleBack}
              className="transition hover:text-[#4f46e5]"
            >
              AI Screening
            </button>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="max-w-[220px] truncate">
              {job?.title || "Job"}
            </span>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="font-semibold text-[#4f46e5]">
              Candidate Ranking
            </span>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4f46e5] transition hover:text-[#4338ca] lg:mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="lg:hidden">Back</span>
            <span className="hidden lg:inline">Back to AI Screening</span>
          </button>
        </div>

        {/* Page heading */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-[-0.02em] text-[#172033] sm:text-2xl">
              Candidate Ranking
            </h1>

            <p className="mt-1 text-sm text-[#71809a]">
              AI-ranked candidates for {job?.title || "this job"}
              <span className="hidden lg:inline">
                {" "}
                based on resume match, skills, experience, education and
                assessment performance.
              </span>
              <span className="lg:hidden">.</span>
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[11px] font-medium text-[#4f46e5]">
                <BriefcaseBusiness className="h-3 w-3" />
                {job?.title || "Job"}
              </span>

              {job?.industry && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-medium text-[#52617a]">
                  <Layers3 className="h-3 w-3" />
                  {job.industry}
                </span>
              )}

              {job?.location && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-medium text-[#52617a]">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-medium text-[#52617a]">
                <Users className="h-3 w-3" />
                {formatNumber(stats.total)} Applicants
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/dashboard/recruiter/candidates`)}
            className="hidden shrink-0 items-center justify-center gap-2 rounded-lg border border-[#dce3ee] bg-white px-4 py-2.5 text-sm font-medium text-[#52617a] transition hover:bg-gray-50 lg:inline-flex"
          >
            <Users className="h-4 w-4" />
            View Applicants
          </button>
        </div>

        {/* AI Ranking Completed */}
        <section className="rounded-xl border border-[#d9d2ff] bg-[#f5f3ff] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ede9fe]">
                <Sparkles className="h-[18px] w-[18px] text-[#7c3aed]" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-[#172033] sm:text-base">
                  AI Ranking Completed
                </h2>

                <p className="mt-0.5 text-xs text-[#52617a]">
                  {formatNumber(stats.total)} applicants ranked using the
                  configured ranking factors.
                </p>

                {refreshing && (
                  <p className="mt-1 text-[11px] text-[#7c3aed]">
                    Updating rankings...
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 rounded-lg border border-[#d9d2ff] bg-white px-2 py-2 lg:min-w-[365px]">
              <div className="border-r border-[#e5e1ff] text-center">
                <p className="text-xl font-bold leading-6 text-[#5046e5] sm:text-2xl">
                  {formatNumber(stats.total)}
                </p>
                <p className="mt-0.5 text-[10px] text-[#71809a] sm:text-xs">
                  Analyzed
                </p>
              </div>

              <div className="border-r border-[#e5e1ff] text-center">
                <p className="text-xl font-bold leading-6 text-[#16a34a] sm:text-2xl">
                  {formatNumber(stats.strongMatches)}
                </p>
                <p className="mt-0.5 text-[10px] text-[#71809a] sm:text-xs">
                  Strong Matches
                </p>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold leading-6 text-[#7c3aed] sm:text-2xl">
                  {formatNumber(stats.topCandidates)}
                </p>
                <p className="mt-0.5 text-[10px] text-[#71809a] sm:text-xs">
                  Top Candidates
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ranking Factors */}
        <section className="mt-4 rounded-xl border border-[#dce3ee] bg-white px-4 py-4 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[#7c3aed]" />

            <h2 className="text-sm font-bold text-[#172033]">
              Ranking Factors
            </h2>

            <span className="hidden text-xs text-[#71809a] sm:inline">
              How the overall score is calculated
            </span>
          </div>

          <div className="mt-3 hidden lg:block">
            <div className="relative flex h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div className="h-full w-[40%] bg-[#5046e5]" />
              <div className="h-full w-[25%] bg-[#7c3aed]" />
              <div className="h-full w-[20%] bg-[#16a34a]" />
              <div className="h-full w-[10%] bg-[#f59e0b]" />
              <div className="h-full w-[5%] bg-[#94a3b8]" />
            </div>

            <div className="grid grid-cols-5">
              {[
                {
                  label: "Resume Match",
                  weight: "40%",
                  dot: "bg-[#5046e5]",
                  pill: "bg-[#eef2ff] text-[#4f46e5]",
                },
                {
                  label: "Skills Match",
                  weight: "25%",
                  dot: "bg-[#7c3aed]",
                  pill: "bg-[#f3e8ff] text-[#7c3aed]",
                },
                {
                  label: "Experience",
                  weight: "20%",
                  dot: "bg-[#16a34a]",
                  pill: "bg-[#dcfce7] text-[#16a34a]",
                },
                {
                  label: "Assessment",
                  weight: "10%",
                  dot: "bg-[#f59e0b]",
                  pill: "bg-[#fef3c7] text-[#b7791f]",
                },
                {
                  label: "Education",
                  weight: "5%",
                  dot: "bg-[#94a3b8]",
                  pill: "bg-[#f1f5f9] text-[#64748b]",
                },
              ].map((factor, index) => (
                <div
                  key={factor.label}
                  className={`pt-2 text-center ${
                    index !== 4 ? "border-r border-[#dce3ee]" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#52617a]">
                    <span className={`h-2 w-2 rounded-full ${factor.dot}`} />
                    {factor.label}
                  </div>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${factor.pill}`}
                  >
                    {factor.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
            {[
              [
                "Resume Match 40%",
                "bg-[#eef2ff] text-[#4f46e5]",
                "bg-[#5046e5]",
              ],
              ["Skills 25%", "bg-[#f3e8ff] text-[#7c3aed]", "bg-[#7c3aed]"],
              ["Experience 20%", "bg-[#dcfce7] text-[#16a34a]", "bg-[#16a34a]"],
              ["Assessment 10%", "bg-[#fef3c7] text-[#b7791f]", "bg-[#f59e0b]"],
              ["Education 5%", "bg-[#f1f5f9] text-[#64748b]", "bg-[#94a3b8]"],
            ].map(([label, pill, dot]) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${pill}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </div>

          <p className="mt-3 text-[11px] leading-5 text-[#71809a]">
            Candidates without a submitted assessment are scored using the
            available factors only. Their overall score is normalized against
            the remaining 90% of the ranking weight.
          </p>
        </section>

        {/* Candidates heading */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#172033] sm:text-lg">
              Top Candidates
            </h2>

            <p className="hidden text-xs text-[#71809a] sm:block">
              Candidates ranked by overall suitability for this job.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 sm:w-[230px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71809a]" />

              <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search candidates..."
                className="h-9 w-full rounded-lg border border-[#dce3ee] bg-white pl-9 pr-3 text-xs text-[#52617a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#5046e5] focus:ring-1 focus:ring-[#5046e5] sm:h-10"
              />
            </div>

            <div className="relative shrink-0">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-[#71809a] sm:block" />

              <select
                value={sortBy}
                onChange={handleSortChange}
                className="h-9 w-full appearance-none rounded-lg border border-[#dce3ee] bg-white px-3 pr-8 text-xs font-medium text-[#52617a] outline-none transition focus:border-[#5046e5] focus:ring-1 focus:ring-[#5046e5] sm:h-10 sm:w-auto sm:pl-8 sm:pr-9"
              >
                <option value="overall-desc">
                  Overall Score — High to Low
                </option>
                <option value="overall-asc">Overall Score — Low to High</option>
                <option value="ai-desc">Resume Match — High to Low</option>
                <option value="skills-desc">Skills — High to Low</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71809a]" />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <section className="mt-3 hidden lg:block">
          <div className="grid grid-cols-[54px_210px_100px_90px_75px_95px_105px_minmax(180px,1fr)] items-center gap-2 px-5 pb-3 text-[11px] font-medium text-[#71809a]">
            <span>Rank</span>
            <span>Candidate</span>
            <span>Overall</span>
            <span>AI Match</span>
            <span>Skills</span>
            <span>Experience</span>
            <span>Assessment</span>
            <span className="text-right">Status / Action</span>
          </div>

          <div className="space-y-2">
            {candidates.map((candidate, index) => {
              const avatarColor = getAvatarColor(index);

              return (
                <div
                  key={candidate.applicationId}
                  className={`rounded-xl border px-5 py-3.5 transition ${
                    candidate.recommended
                      ? "border-[#bfc7ff] bg-[#eef2ff]"
                      : "border-[#dce3ee] bg-white hover:border-[#cbd5e1]"
                  }`}
                >
                  <div className="grid grid-cols-[54px_210px_100px_90px_75px_95px_105px_minmax(180px,1fr)] items-center gap-2">
                    <div>
                      <span
                        className={`text-lg font-bold ${
                          candidate.rank === 1
                            ? "text-[#5046e5]"
                            : candidate.rank <= 4
                              ? "text-[#52617a]"
                              : "text-[#94a3b8]"
                        }`}
                      >
                        {String(candidate.rank).padStart(2, "0")}
                      </span>

                      {candidate.rank === 1 && (
                        <Award className="mt-0.5 h-3.5 w-3.5 text-[#f59e0b]" />
                      )}
                    </div>

                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${avatarColor}`}
                      >
                        {candidate.initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#172033]">
                          {candidate.name}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#71809a]">
                          <BriefcaseBusiness className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {candidate.experience}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <p
                        className={`text-lg font-bold ${getScoreColor(candidate.overall)}`}
                      >
                        {candidate.overall}%
                      </p>
                      <p className="text-[10px] text-[#71809a]">
                        Overall Score
                      </p>
                    </div>

                    <div className="text-sm font-bold text-[#172033]">
                      <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#16a34a]" />
                      {candidate.aiMatch}%
                    </div>

                    <div className="text-sm font-bold text-[#172033]">
                      {candidate.skills}%
                    </div>

                    <div className="text-sm font-bold text-[#172033]">
                      {candidate.experienceMatch}%
                    </div>

                    <div>
                      {typeof candidate.assessment === "number" ? (
                        <span className="text-sm font-bold text-[#172033]">
                          {candidate.assessment}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-[10px] font-semibold text-[#b7791f]">
                          {candidate.assessmentStatus === "Not Started"
                            ? "Not Started"
                            : "Pending"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold xl:inline-flex ${getStatusClasses(candidate.status)}`}
                      >
                        {candidate.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleViewCandidate(candidate)}
                        className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-medium text-[#52617a] transition hover:border-[#5046e5] hover:text-[#5046e5]"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        disabled={updatingId === candidate.applicationId}
                        onClick={() => handleShortlist(candidate)}
                        className={`min-w-[94px] rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          candidate.shortlisted
                            ? "border border-[#5046e5] bg-[#eef2ff] text-[#5046e5]"
                            : "bg-[#5046e5] text-white hover:bg-[#4338ca]"
                        }`}
                      >
                        {updatingId === candidate.applicationId
                          ? "Saving..."
                          : candidate.shortlisted
                            ? "Shortlisted"
                            : "Shortlist"}
                      </button>
                    </div>
                  </div>

                  {candidate.recommended && (
                    <div className="mt-2 flex items-center gap-2 pl-[54px]">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f5f3ff] px-3 py-1.5 text-[10px] font-medium text-[#7c3aed]">
                        <Sparkles className="h-3 w-3" />
                        AI Recommended — Highest overall match based on job
                        requirements.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Mobile cards */}
        <section className="mt-3 space-y-3 lg:hidden">
          {candidates.map((candidate, index) => (
            <article
              key={candidate.applicationId}
              className={`rounded-xl border p-4 ${
                candidate.recommended
                  ? "border-[#bfc7ff] bg-[#eef2ff]"
                  : "border-[#dce3ee] bg-white"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 shrink-0 pt-1">
                  <p
                    className={`text-lg font-bold leading-none ${
                      candidate.rank === 1
                        ? "text-[#5046e5]"
                        : candidate.rank <= 4
                          ? "text-[#52617a]"
                          : "text-[#94a3b8]"
                    }`}
                  >
                    {String(candidate.rank).padStart(2, "0")}
                  </p>

                  {candidate.rank === 1 && (
                    <Award className="mt-1 h-3.5 w-3.5 text-[#f59e0b]" />
                  )}
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${getAvatarColor(index)}`}
                >
                  {candidate.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#172033]">
                    {candidate.name}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#71809a]">
                    <BriefcaseBusiness className="h-3 w-3" />
                    {candidate.role}
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#71809a]">
                    {candidate.experience}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className={`text-2xl font-bold leading-6 ${getScoreColor(candidate.overall)}`}
                  >
                    {candidate.overall}%
                  </p>
                  <p className="mt-1 text-[10px] text-[#71809a]">Overall</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] text-[#71809a]">AI Match</p>
                  <p className="mt-0.5 text-sm font-bold text-[#172033]">
                    {candidate.aiMatch}%
                  </p>
                </div>

                <div className="min-w-0 border-l border-[#cbd5e1] px-2">
                  <p className="text-[10px] text-[#71809a]">Skills</p>
                  <p className="mt-0.5 text-sm font-bold text-[#172033]">
                    {candidate.skills}%
                  </p>
                </div>

                <div className="min-w-0 border-l border-[#cbd5e1] px-2">
                  <p className="text-[10px] text-[#71809a]">Experience</p>
                  <p className="mt-0.5 text-sm font-bold text-[#172033]">
                    {candidate.experienceMatch}%
                  </p>
                </div>

                <div className="min-w-0 border-l border-[#cbd5e1] pl-2">
                  <p className="text-[10px] text-[#71809a]">Assessment</p>

                  {typeof candidate.assessment === "number" ? (
                    <p className="mt-0.5 text-sm font-bold text-[#172033]">
                      {candidate.assessment}%
                    </p>
                  ) : (
                    <span className="mt-0.5 inline-block rounded-full bg-[#fef3c7] px-2 py-0.5 text-[9px] font-semibold text-[#b7791f]">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {candidate.recommended ? (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f3ff] px-3 py-1.5 text-[10px] font-medium text-[#7c3aed]">
                    <Sparkles className="h-3 w-3" />
                    AI Recommended
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold ${getStatusClasses(candidate.status)}`}
                  >
                    {candidate.status}
                  </span>
                </div>
              )}

              {candidate.location && (
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#71809a]">
                  <MapPin className="h-3 w-3" />
                  {candidate.location}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleViewCandidate(candidate)}
                  className={`inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-xs font-medium transition ${
                    candidate.recommended
                      ? "border border-[#5046e5] bg-white text-[#4f46e5] hover:bg-[#f5f3ff]"
                      : "border border-[#dce3ee] bg-white text-[#52617a] hover:border-[#5046e5] hover:text-[#5046e5]"
                  }`}
                >
                  View Candidate
                </button>

                <button
                  type="button"
                  disabled={updatingId === candidate.applicationId}
                  onClick={() => handleShortlist(candidate)}
                  className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition disabled:opacity-60 ${
                    candidate.shortlisted
                      ? "border border-[#5046e5] bg-[#eef2ff] text-[#5046e5]"
                      : "bg-[#5046e5] text-white hover:bg-[#4338ca]"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                  {updatingId === candidate.applicationId
                    ? "Saving..."
                    : candidate.shortlisted
                      ? "Shortlisted"
                      : "Shortlist"}
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Empty state */}
        {!candidates.length && (
          <div className="mt-3 rounded-xl border border-[#dce3ee] bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9]">
              <Users className="h-6 w-6 text-[#94a3b8]" />
            </div>

            <h3 className="mt-3 text-sm font-bold text-[#172033]">
              No candidates found
            </h3>

            <p className="mt-1 text-xs text-[#71809a]">
              {search
                ? "Try another search term."
                : "There are no applications for this job yet."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-xs font-semibold text-[#5046e5] hover:text-[#4338ca]"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#71809a]">
              Showing{" "}
              <span className="font-medium text-[#52617a]">
                {startIndex}–{endIndex}
              </span>{" "}
              of{" "}
              <span className="font-medium text-[#52617a]">
                {formatNumber(pagination.total)}
              </span>{" "}
              candidates
            </p>

            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#dce3ee] bg-white px-3 text-xs font-medium text-[#52617a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="hidden items-center gap-1.5 sm:flex">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 rounded-lg border px-2 text-xs font-medium transition ${
                      currentPage === page
                        ? "border-[#5046e5] bg-[#5046e5] text-white"
                        : "border-[#dce3ee] bg-white text-[#52617a] hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <span className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-[#5046e5] bg-[#5046e5] px-2 text-xs font-medium text-white sm:hidden">
                {currentPage}
              </span>

              <button
                type="button"
                disabled={
                  !pagination.totalPages || currentPage >= pagination.totalPages
                }
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(pagination.totalPages, page + 1),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#dce3ee] bg-white px-3 text-xs font-medium text-[#52617a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
