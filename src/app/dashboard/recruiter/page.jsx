"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Plus,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  ListFilter,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const AVATAR_CLASSES = [
  "bg-[#EEF1FF] text-[#5146E5]",
  "bg-[#F0E9FF] text-[#7C3AED]",
  "bg-[#DCFCE7] text-[#16A34A]",
  "bg-[#FFF3C4] text-[#F59E0B]",
];

const EMPTY_STATS = {
  activeJobs: 0,
  totalApplications: 0,
  toReview: 0,
  shortlisted: 0,
};

const EMPTY_SCREENING_STATS = {
  analyzed: 0,
  strong: 0,
  medium: 0,
  low: 0,
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMobileDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getStatusClasses(status) {
  if (status === "Shortlisted") {
    return "bg-[#D9FBE8] text-[#0B9A4A]";
  }

  if (status === "Under Review") {
    return "bg-[#FFF0C2] text-[#A85A00]";
  }

  if (status === "Rejected") {
    return "bg-[#FEE2E2] text-[#B91C1C]";
  }

  return "bg-[#EEF1FF] text-[#5146E5]";
}

function getStatusDot(status) {
  if (status === "Shortlisted") return "bg-[#16A34A]";
  if (status === "Under Review") return "bg-[#F59E0B]";
  if (status === "Rejected") return "bg-[#DC2626]";
  return "bg-[#5146E5]";
}

function getMatchColor(match) {
  if (match >= 85) return "text-[#16A34A]";
  if (match >= 70) return "text-[#5146E5]";
  return "text-[#F59E0B]";
}

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const toastTimer = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [showToast, setShowToast] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [recruiter, setRecruiter] = useState({ name: "Recruiter" });
  const [stats, setStats] = useState(EMPTY_STATS);
  const [screeningStats, setScreeningStats] = useState(EMPTY_SCREENING_STATS);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const notify = useCallback((message) => {
    setShowToast(message);

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setShowToast("");
    }, 2200);
  }, []);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/recruiter/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load recruiter dashboard.");
      }

      setRecruiter(data.recruiter || { name: "Recruiter" });
      setStats({
        ...EMPTY_STATS,
        ...(data.stats || {}),
      });
      setScreeningStats({
        ...EMPTY_SCREENING_STATS,
        ...(data.screeningStats || {}),
      });
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setApplications(
        Array.isArray(data.applications) ? data.applications : [],
      );
    } catch (fetchError) {
      console.error("Recruiter dashboard fetch error:", fetchError);
      setError(
        fetchError.message || "Something went wrong while loading the page.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, [fetchDashboard]);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return applications;

    return applications.filter((candidate) =>
      [
        candidate.name,
        candidate.role,
        candidate.appliedFor,
        candidate.status,
        candidate.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [applications, searchQuery]);

  const visibleApplications = showAllApplications
    ? filteredApplications
    : filteredApplications.slice(0, 4);

  const handleViewProfile = (candidate) => {
    if (!candidate.studentId || !candidate.jobId || !candidate.applicationId) {
      notify("Candidate profile details are unavailable.");
      return;
    }

    router.push(
      `/dashboard/recruiter/candidates/${candidate.studentId}?jobId=${candidate.jobId}&applicationId=${candidate.applicationId}`,
    );
  };

  const handleViewApplications = (job) => {
    router.push(
      `/dashboard/recruiter/applications?jobId=${encodeURIComponent(job.id)}`,
    );
  };

  const handleRankings = () => {
    if (jobs.length > 0) {
      router.push(`/dashboard/recruiter/ai-screening/${jobs[0].id}/ranking`);
      return;
    }

    router.push("/dashboard/recruiter/ai-screening");
  };

  const handleCreateJob = () => {
    router.push("/dashboard/recruiter/jobs/create");
  };

  const screeningCards = [
    {
      value: screeningStats.analyzed,
      label: "Analyzed",
      type: "analyzed",
      dot: "bg-[#7C3AED]",
      valueColor: "text-[#172033]",
    },
    {
      value: screeningStats.strong,
      label: "Strong Matches",
      type: "strong",
      dot: "bg-[#16A34A]",
      valueColor: "text-[#16A34A]",
    },
    {
      value: screeningStats.medium,
      label: "Medium Matches",
      type: "medium",
      dot: "bg-[#5146E5]",
      valueColor: "text-[#5146E5]",
    },
    {
      value: screeningStats.low,
      label: "Low Matches",
      type: "low",
      dot: "bg-[#F59E0B]",
      valueColor: "text-[#C86A00]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-[#172033]">
      {/* Toast */}
      {showToast && (
        <div
          role="status"
          className="fixed left-1/2 top-4 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-[9px] bg-[#172033] px-4 py-2.5 text-[12px] font-semibold text-white shadow-xl"
        >
          <CheckCircle2 size={15} className="text-[#4ADE80]" />
          {showToast}
        </div>
      )}

      <div className="mx-auto w-full px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
        {/* Dashboard intro */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold leading-[1.2] tracking-[-0.35px] text-[#172033] sm:text-[27px] lg:text-[28px]">
              Good morning, {recruiter.name} 👋
            </h1>

            <p className="mt-1 text-[12px] leading-[1.45] text-[#52627B] sm:text-[13px] lg:text-[14px]">
              Here&apos;s an overview of your recruitment activity.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateJob}
            className="flex h-[40px] w-full shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#5146E5] px-5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.20)] transition hover:bg-[#453BCF] active:scale-[0.98] sm:w-auto sm:min-w-[145px] sm:text-[13px]"
          >
            <Plus size={16} strokeWidth={2.1} />
            Post New Job
          </button>
        </section>

        {/* Mobile search */}
        <section className="mt-4 sm:hidden">
          <div className="flex h-[40px] items-center gap-2 rounded-[8px] border border-[#DCE4EE] bg-white px-3">
            <Search size={15} className="shrink-0 text-[#8FA0B8]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search candidates..."
              aria-label="Search candidates"
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[#172033] outline-none placeholder:text-[#9AA8BC]"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#8FA0B8]"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </section>

        {/* Error state */}
        {error && (
          <div className="mt-5 flex flex-col gap-3 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-bold text-[#B91C1C]">
                Unable to load dashboard
              </p>
              <p className="mt-1 text-[11px] text-[#7F1D1D]">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="h-[34px] shrink-0 rounded-[7px] bg-[#B91C1C] px-4 text-[11px] font-bold text-white hover:bg-[#991B1B] disabled:opacity-60"
            >
              {refreshing ? "Retrying..." : "Try again"}
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section className="mt-5 grid grid-cols-2 gap-3 lg:mt-6 lg:grid-cols-4 lg:gap-4">
          {[
            {
              label: "Active Jobs",
              value: stats.activeJobs,
              icon: BriefcaseBusiness,
              iconClass: "bg-[#EEF1FF] text-[#5146E5]",
              valueClass: "text-[#172033]",
              cardClass: "border-[#DCE4EE] bg-white",
            },
            {
              label: "Total Applications",
              value: stats.totalApplications,
              icon: FileText,
              iconClass: "bg-[#EEF1FF] text-[#5146E5]",
              valueClass: "text-[#172033]",
              cardClass: "border-[#DCE4EE] bg-white",
            },
            {
              label: "To Review",
              value: stats.toReview,
              icon: Clock3,
              iconClass: "bg-[#FFF9E9] text-[#F59E0B]",
              valueClass: "text-[#F59E0B]",
              labelClass: "text-[#A85A00]",
              cardClass: "border-[#F59E0B] bg-[#FFF3C7]",
            },
            {
              label: "Shortlisted",
              value: stats.shortlisted,
              icon: UserRound,
              iconClass: "bg-[#ECFFF2] text-[#16A34A]",
              valueClass: "text-[#16A34A]",
              labelClass: "text-[#187343]",
              cardClass: "border-[#22C55E] bg-[#DDFBE8]",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`flex min-h-[112px] flex-col justify-between rounded-[11px] border p-3.5 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:min-h-[116px] sm:p-4 lg:min-h-[90px] lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:p-4 ${item.cardClass}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] sm:h-10 sm:w-10 ${item.iconClass}`}
                >
                  <Icon size={18} strokeWidth={1.7} />
                </div>

                <div>
                  <p
                    className={`text-[10px] font-medium sm:text-[11px] ${
                      item.labelClass || "text-[#71839E]"
                    }`}
                  >
                    {item.label}
                  </p>

                  <p
                    className={`mt-1 text-[24px] font-bold leading-none tracking-[-0.5px] sm:text-[26px] ${item.valueClass}`}
                  >
                    {loading ? "—" : item.value.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* AI Screening Overview */}
        <section className="mt-4 rounded-[12px] border border-[#DDD2FF] bg-[#F7F3FF] p-3.5 shadow-[0_3px_10px_rgba(124,58,237,0.05)] sm:p-4 lg:mt-5 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#EEE7FF] text-[#7C3AED] sm:h-9 sm:w-9">
                <Sparkles size={17} strokeWidth={1.7} />
              </div>

              <div className="min-w-0">
                <h2 className="text-[14px] font-bold leading-5 text-[#172033] sm:text-[15px] lg:text-[16px]">
                  AI Screening Overview
                </h2>

                <p className="mt-0.5 max-w-[720px] text-[10px] leading-4 text-[#52627B] sm:text-[11px] lg:text-[12px]">
                  ResumeAI has analyzed recent applications and identified the
                  strongest candidates based on job requirements.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRankings}
              className="flex h-[34px] w-full shrink-0 items-center justify-center gap-2 rounded-[7px] bg-[#7C3AED] px-4 text-[10px] font-bold text-white transition hover:bg-[#6D28D9] sm:w-auto sm:text-[11px]"
            >
              <ListFilter size={14} strokeWidth={1.8} />
              View AI Rankings
            </button>
          </div>

          {/* Screening metrics */}
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2.5 lg:mt-4 lg:gap-3">
            {screeningCards.map((stat) => (
              <div
                key={stat.label}
                className={`min-w-0 rounded-[8px] border p-2 sm:p-3 ${
                  stat.type === "strong"
                    ? "border-[#4ADE80] bg-[#DDFBE8]"
                    : stat.type === "low"
                      ? "border-[#F59E0B] bg-[#FFF3C7]"
                      : stat.type === "medium"
                        ? "border-[#C7D2FE] bg-[#EEF1FF]"
                        : "border-[#D8CCFF] bg-white"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${stat.dot}`}
                  />

                  <span
                    className={`text-[16px] font-bold leading-none sm:text-[19px] lg:text-[21px] ${stat.valueColor}`}
                  >
                    {loading ? "—" : stat.value.toLocaleString("en-IN")}
                  </span>
                </div>

                <p
                  className={`mt-1 truncate text-[7px] font-medium sm:text-[9px] lg:text-[10px] ${
                    stat.type === "strong"
                      ? "text-[#187343]"
                      : stat.type === "low"
                        ? "text-[#A85A00]"
                        : stat.type === "medium"
                          ? "text-[#4B45B7]"
                          : "text-[#71839E]"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom dashboard */}
        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-5">
          {/* Recent Applications */}
          <div className="min-w-0 overflow-hidden rounded-[12px] border border-[#DCE4EE] bg-white shadow-[0_2px_7px_rgba(15,23,42,0.03)]">
            {/* Section header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#E5EAF1] px-4 py-3.5 sm:px-5 sm:py-4">
              <div>
                <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                  Recent Applications
                </h2>

                <p className="mt-0.5 text-[10px] text-[#71839E] sm:text-[11px]">
                  Latest candidates who applied to your jobs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/dashboard/recruiter/applications")}
                className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#5146E5] sm:text-[11px]"
              >
                View all
                <ArrowRight size={13} strokeWidth={1.8} />
              </button>
            </div>

            {/* Search / filter */}
            <div className="hidden border-b border-[#E5EAF1] px-4 py-2.5 sm:flex sm:items-center sm:justify-between sm:px-5">
              <div className="flex h-[34px] w-[235px] items-center gap-2 rounded-[7px] border border-[#DCE4EE] bg-[#F8FAFC] px-2.5">
                <Search size={14} className="text-[#8FA0B8]" />

                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search candidates..."
                  aria-label="Search candidates"
                  className="min-w-0 flex-1 bg-transparent text-[10px] text-[#172033] outline-none placeholder:text-[#9AA8BC]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[#8FA0B8]"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <span className="text-[10px] text-[#8FA0B8]">
                {filteredApplications.length} candidates
              </span>
            </div>

            {/* Column heading */}
            <div className="hidden grid-cols-12 border-b border-[#E5EAF1] bg-[#F8FAFC] px-4 py-2.5 text-[9px] font-semibold text-[#71839E] sm:grid sm:px-5">
              <span className="col-span-3">Candidate</span>
              <span className="col-span-2">Applied For</span>
              <span className="col-span-1">AI Match</span>
              <span className="col-span-1">Assessment</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-1">Applied</span>
              <span className="col-span-2 text-right">Action</span>
            </div>

            {/* Loading rows */}
            {loading && (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex animate-pulse items-center gap-3"
                  >
                    <div className="h-9 w-9 rounded-full bg-[#EEF1F6]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-[#EEF1F6]" />
                      <div className="h-2.5 w-1/4 rounded bg-[#F1F4F8]" />
                    </div>
                    <div className="h-7 w-16 rounded bg-[#EEF1F6]" />
                  </div>
                ))}
              </div>
            )}

            {/* Application rows */}
            {!loading && (
              <div>
                {visibleApplications.map((candidate, index) => (
                  <div
                    key={candidate.applicationId || candidate.id}
                    className="grid grid-cols-12 gap-x-2 gap-y-2 border-b border-[#E5EAF1] px-3.5 py-3.5 last:border-b-0 sm:items-center sm:gap-0 sm:px-5 sm:py-3"
                  >
                    {/* Candidate */}
                    <div className="col-span-8 flex min-w-0 items-center gap-2.5 sm:col-span-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                          AVATAR_CLASSES[index % AVATAR_CLASSES.length]
                        }`}
                      >
                        {candidate.initials || "C"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-[#172033] sm:text-[10px]">
                          {candidate.name}
                        </p>

                        <p className="truncate text-[9px] text-[#71839E] sm:hidden">
                          {candidate.role}
                        </p>
                      </div>
                    </div>

                    {/* Status - mobile top right */}
                    <div className="col-span-4 flex justify-end sm:hidden">
                      <span
                        className={`inline-flex h-[24px] items-center rounded-full px-2.5 text-[8px] font-semibold ${getStatusClasses(
                          candidate.status,
                        )}`}
                      >
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getStatusDot(
                            candidate.status,
                          )}`}
                        />
                        {candidate.status}
                      </span>
                    </div>

                    {/* Applied For */}
                    <div className="col-span-12 min-w-0 sm:col-span-2">
                      <p className="text-[8px] text-[#8FA0B8] sm:hidden">
                        Applied For
                      </p>

                      <p className="mt-0.5 truncate text-[10px] font-medium text-[#52627B] sm:mt-0">
                        {candidate.appliedFor}
                      </p>
                    </div>

                    {/* AI Match */}
                    <div className="col-span-4 rounded-[7px] bg-[#F7F9FF] px-2.5 py-2 sm:col-span-1 sm:bg-transparent sm:px-0 sm:py-0">
                      <p className="text-[8px] text-[#8FA0B8] sm:hidden">
                        AI Match
                      </p>

                      <p
                        className={`mt-0.5 text-[12px] font-bold sm:mt-0 sm:text-[10px] ${getMatchColor(
                          candidate.match,
                        )}`}
                      >
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current" />
                        {candidate.match}%
                      </p>
                    </div>

                    {/* Assessment */}
                    <div className="col-span-4 rounded-[7px] bg-[#F7F9FF] px-2.5 py-2 sm:col-span-1 sm:bg-transparent sm:px-0 sm:py-0">
                      <p className="text-[8px] text-[#8FA0B8] sm:hidden">
                        Assessment
                      </p>

                      <p
                        className={`mt-0.5 text-[10px] font-semibold sm:mt-0 ${
                          candidate.assessment === "Pending"
                            ? "text-[#F59E0B]"
                            : candidate.assessment === "Completed"
                              ? "text-[#5146E5]"
                              : "text-[#16A34A]"
                        }`}
                      >
                        {candidate.assessment}
                      </p>
                    </div>

                    {/* Status desktop */}
                    <div className="col-span-2 hidden sm:block">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[8px] font-semibold ${getStatusClasses(
                          candidate.status,
                        )}`}
                      >
                        {candidate.status}
                      </span>
                    </div>

                    {/* Applied */}
                    <div className="col-span-4 rounded-[7px] bg-[#F7F9FF] px-2.5 py-2 sm:col-span-1 sm:bg-transparent sm:px-0 sm:py-0">
                      <p className="text-[8px] text-[#8FA0B8] sm:hidden">
                        Applied
                      </p>

                      <p className="mt-0.5 text-[9px] font-medium text-[#52627B] sm:mt-0">
                        <span className="sm:hidden">
                          {formatMobileDate(candidate.appliedAt)}
                        </span>
                        <span className="hidden sm:inline">
                          {formatDate(candidate.appliedAt)}
                        </span>
                      </p>
                    </div>

                    {/* Action */}
                    <div className="col-span-12 mt-1 sm:col-span-2 sm:mt-0 sm:text-right">
                      <button
                        type="button"
                        onClick={() => handleViewProfile(candidate)}
                        className="flex h-[31px] w-full items-center justify-center gap-1.5 rounded-[7px] bg-[#EEF1FF] text-[9px] font-bold text-[#5146E5] transition hover:bg-[#E3E7FF] sm:ml-auto sm:h-[27px] sm:w-[58px]"
                      >
                        <Eye size={12} strokeWidth={1.8} />
                        <span className="sm:hidden">View Profile</span>
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </div>
                  </div>
                ))}

                {filteredApplications.length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <UsersRound
                      size={26}
                      className="mx-auto text-[#B4C0D0]"
                      strokeWidth={1.5}
                    />

                    <p className="mt-2 text-[11px] font-semibold text-[#52627B]">
                      {searchQuery
                        ? "No candidates found"
                        : "No applications yet"}
                    </p>

                    <p className="mt-1 text-[9px] text-[#8FA0B8]">
                      {searchQuery
                        ? "Try another search term."
                        : "Applications submitted to your jobs will appear here."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!loading && filteredApplications.length > 4 && (
              <div className="border-t border-[#E5EAF1] px-4 py-3 text-center sm:px-5">
                <button
                  type="button"
                  onClick={() => setShowAllApplications((current) => !current)}
                  className="text-[10px] font-bold text-[#5146E5] hover:text-[#453BCF]"
                >
                  {showAllApplications
                    ? "Show less"
                    : `Show all ${filteredApplications.length} recent candidates`}
                </button>
              </div>
            )}
          </div>

          {/* Active Jobs */}
          <aside className="rounded-[12px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_2px_7px_rgba(15,23,42,0.03)] sm:p-4 lg:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-bold text-[#172033] sm:text-[15px]">
                  Active Jobs
                </h2>

                <p className="mt-0.5 text-[10px] text-[#71839E] sm:text-[11px]">
                  Open positions.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#D9FBE8] px-2.5 py-1 text-[8px] font-bold text-[#0B9A4A]">
                {loading ? "—" : jobs.length} Active
              </span>
            </div>

            {loading ? (
              <div className="mt-3 space-y-2.5">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-[9px] border border-[#DCE4EE] p-3"
                  >
                    <div className="h-3 w-2/3 rounded bg-[#EEF1F6]" />
                    <div className="mt-2 h-2.5 w-1/3 rounded bg-[#F1F4F8]" />
                    <div className="mt-4 h-8 rounded bg-[#EEF1F6]" />
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="mt-3 space-y-2.5">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-[9px] border border-[#DCE4EE] bg-[#F8FAFC] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[11px] font-bold leading-4 text-[#172033] sm:text-[12px]">
                          {job.title}
                        </h3>

                        <p className="mt-0.5 text-[9px] text-[#71839E] sm:text-[10px]">
                          {job.applications} Applications
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#D9FBE8] px-2.5 py-1 text-[8px] font-bold text-[#0B9A4A]">
                        Active
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[9px] font-semibold text-[#7C3AED] sm:text-[10px]">
                      <Sparkles size={12} strokeWidth={1.7} />
                      {job.match}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewApplications(job)}
                      className="mt-2.5 flex h-[32px] w-full items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[9px] font-bold text-[#5146E5] transition hover:bg-[#E3E7FF] sm:text-[10px]"
                    >
                      View Applications
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-9 text-center">
                <BriefcaseBusiness
                  size={25}
                  className="mx-auto text-[#B4C0D0]"
                  strokeWidth={1.5}
                />

                <p className="mt-2 text-[11px] font-semibold text-[#52627B]">
                  No active jobs
                </p>

                <p className="mt-1 text-[9px] text-[#8FA0B8]">
                  Create a job to start receiving applications.
                </p>

                <button
                  type="button"
                  onClick={handleCreateJob}
                  className="mt-3 text-[10px] font-bold text-[#5146E5]"
                >
                  Post a job
                </button>
              </div>
            )}
          </aside>
        </section>

        {/* Refresh action */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing || loading}
            className="text-[10px] font-semibold text-[#71839E] transition hover:text-[#5146E5] disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh dashboard"}
          </button>
        </div>
      </div>
    </main>
  );
}
