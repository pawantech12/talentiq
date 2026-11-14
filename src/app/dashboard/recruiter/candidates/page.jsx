"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  Search,
  Users,
  BriefcaseBusiness,
  Clock3,
  UserCheck,
  UserX,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  FileText,
  RefreshCw,
  X,
  Mail,
  Phone,
  Loader2,
  Sparkles,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "All applications" },
  { value: "pending", label: "Pending" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "rejected", label: "Rejected" },
  { value: "interview", label: "Interview" },
  { value: "selected", label: "Selected" },
];

const getStatusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (["shortlisted", "selected"].includes(value)) {
    return "bg-[#dcfce7] text-[#16a34a]";
  }

  if (value === "rejected") {
    return "bg-[#fee2e2] text-[#dc2626]";
  }

  if (value === "interview") {
    return "bg-[#f0eaff] text-[#7c3aed]";
  }

  return "bg-[#fff3cf] text-[#b7791f]";
};

const formatStatus = (status) => {
  if (!status) return "Pending";

  return String(status)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const StatCard = ({
  icon,
  title,
  value,
  iconClass,
  valueClass,
  mobileOrder,
}) => (
  <div
    className={`rounded-[12px] border border-[#dce3ed] bg-white px-[15px] py-[15px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-[18px] sm:py-[17px] ${mobileOrder}`}
  >
    <div className="flex items-center gap-[12px] sm:gap-[14px]">
      <div
        className={`flex h-[39px] w-[39px] shrink-0 items-center justify-center rounded-[10px] sm:h-[42px] sm:w-[42px] ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[12px] font-normal leading-[18px] text-[#64748b] sm:text-[13px]">
          {title}
        </p>

        <p
          className={`mt-[1px] text-[24px] font-bold leading-[29px] sm:text-[27px] sm:leading-[31px] ${valueClass}`}
        >
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default function RecruiterCandidatesPage() {
  const router = useRouter();

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [jobId, setJobId] = useState("all");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCandidates = useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) setLoading(true);
        else setRefreshing(true);

        setError("");

        const response = await axios.get("/api/recruiter/candidates", {
          params: {
            search: search.trim(),
            status,
            jobId: jobId === "all" ? "" : jobId,
            page,
            limit: 10,
          },
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        const data = response.data;

        if (!data?.success) {
          throw new Error(data?.message || "Unable to load candidates.");
        }

        setCandidates(data.candidates || []);
        setJobs(data.jobs || []);

        setStats(
          data.stats || {
            total: 0,
            pending: 0,
            shortlisted: 0,
            rejected: 0,
          },
        );

        setPagination(
          data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (err) {
        console.error("Candidates fetch error:", err);

        if (err.response?.status === 401) {
          router.replace("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load candidates. Please try again.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status, jobId, page, router],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCandidates();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchCandidates]);

  const openCandidate = (candidate) => {
    const query = new URLSearchParams({
      jobId: candidate.job.id,
      applicationId: candidate.applicationId,
    });

    router.push(
      `/dashboard/recruiter/candidates/${candidate.id}?${query.toString()}`,
    );
  };

  const changeFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setJobId("all");
    setPage(1);
  };

  const hasFilters =
    search.trim() !== "" || status !== "all" || jobId !== "all";

  const formatAppliedDate = (value) => value || "Recently";

  const safeTotalPages = Math.max(1, pagination.totalPages || 1);
  const safePage = Math.min(page, safeTotalPages);

  const getMatchClass = (match) => {
    if (match >= 84) {
      return {
        text: "text-[#16a34a]",
        background: "bg-[#dcfce7]",
        dot: "bg-[#16a34a]",
      };
    }

    if (match >= 80) {
      return {
        text: "text-[#4f46e5]",
        background: "bg-[#eef2ff]",
        dot: "bg-[#4f46e5]",
      };
    }

    return {
      text: "text-[#b7791f]",
      background: "bg-[#fff3cf]",
      dot: "bg-[#f59e0b]",
    };
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto w-full px-[16px] pb-[32px] pt-[22px] sm:px-[20px] lg:px-[24px] lg:pt-[30px]">
        {/* Breadcrumb and heading */}
        <div>
          <div className="mb-[22px] flex items-center gap-[10px] text-[14px] font-normal">
            <span className="text-[#64748b]">Recruiter</span>

            <ChevronRight
              size={15}
              strokeWidth={1.7}
              className="text-[#94a3b8]"
            />

            <span className="font-medium text-[#4f46e5]">Candidates</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-[25px] font-bold leading-[32px] tracking-[-0.5px] text-[#111827] sm:text-[27px]">
                Candidates
              </h1>

              <p className="mt-[3px] text-[13px] leading-[20px] text-[#475569] sm:text-[14px]">
                Manage and review candidates who applied to your jobs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchCandidates({ showLoader: false })}
              disabled={refreshing || loading}
              className="inline-flex h-[40px] shrink-0 items-center justify-center gap-[8px] self-start rounded-[9px] border border-[#d9e1eb] bg-white px-[16px] text-[13px] font-semibold text-[#475569] shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Mobile title card */}
        <div className="mt-[18px] flex items-center justify-between rounded-[11px] border border-[#dce3ed] bg-white px-[15px] py-[13px] shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:hidden">
          <div>
            <h2 className="text-[17px] font-bold leading-[23px] text-[#172033]">
              Applicant overview
            </h2>

            <p className="mt-[2px] text-[11px] text-[#64748b]">
              Review your applicants
            </p>
          </div>

          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-[#eef2ff] text-[#4f46e5]">
            <Users size={19} />
          </div>
        </div>

        {/* Statistics */}
        <section className="mt-[20px] grid grid-cols-2 gap-[10px] lg:mt-[23px] lg:grid-cols-4 lg:gap-[16px]">
          <StatCard
            mobileOrder="order-1"
            icon={
              <Users size={21} strokeWidth={1.8} className="text-[#64748b]" />
            }
            title="Total Applicants"
            value={stats.total}
            iconClass="bg-[#f1f5f9]"
            valueClass="text-[#172033]"
          />

          <StatCard
            mobileOrder="order-3 lg:order-2"
            icon={
              <Clock3 size={21} strokeWidth={1.8} className="text-[#b7791f]" />
            }
            title="Pending Review"
            value={stats.pending}
            iconClass="bg-[#fff3cf]"
            valueClass="text-[#b7791f]"
          />

          <StatCard
            mobileOrder="order-2 lg:order-3"
            icon={
              <UserCheck
                size={21}
                strokeWidth={1.8}
                className="text-[#16a34a]"
              />
            }
            title="Shortlisted"
            value={stats.shortlisted}
            iconClass="bg-[#dcfce7]"
            valueClass="text-[#16a34a]"
          />

          <StatCard
            mobileOrder="order-4"
            icon={
              <UserX size={21} strokeWidth={1.8} className="text-[#dc2626]" />
            }
            title="Rejected"
            value={stats.rejected}
            iconClass="bg-[#fee2e2]"
            valueClass="text-[#dc2626]"
          />
        </section>

        {/* Candidates container */}
        <section className="mt-[23px] overflow-hidden rounded-[12px] border border-[#dce3ed] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
          {/* Filters */}
          <div className="border-b border-[#dce3ed] px-[15px] py-[14px] sm:px-[19px] lg:px-[20px] lg:py-[15px]">
            <div className="flex flex-col gap-[12px] lg:flex-row lg:items-center lg:justify-between">
              <div className="hidden lg:block">
                <h2 className="text-[16px] font-bold leading-[20px] text-[#172033]">
                  All Candidates
                </h2>

                <p className="mt-[2px] text-[12px] leading-[17px] text-[#64748b]">
                  {pagination.total === 0
                    ? "No candidates found"
                    : `${pagination.total} applicants found`}
                </p>
              </div>

              <div className="flex w-full flex-col gap-[9px] lg:w-auto lg:flex-row lg:items-center">
                {/* Search */}
                <div className="relative w-full lg:w-[270px]">
                  <Search
                    size={17}
                    strokeWidth={1.7}
                    className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      changeFilter(setSearch, event.target.value)
                    }
                    placeholder="Search candidates..."
                    className="h-[40px] w-full rounded-[9px] border border-[#d9e1eb] bg-[#f8fafc] pl-[37px] pr-[35px] text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => changeFilter(setSearch, "")}
                      aria-label="Clear search"
                      className="absolute right-[11px] top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#334155]"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Job filter */}
                <div className="relative w-full lg:w-[190px]">
                  <select
                    value={jobId}
                    onChange={(event) =>
                      changeFilter(setJobId, event.target.value)
                    }
                    className="h-[40px] w-full appearance-none rounded-[9px] border border-[#d9e1eb] bg-[#f8fafc] px-[13px] pr-[34px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
                  >
                    <option value="all">All Jobs</option>

                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    strokeWidth={1.6}
                    className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>

                {/* Status filter */}
                <div className="relative w-full lg:w-[155px]">
                  <select
                    value={status}
                    onChange={(event) =>
                      changeFilter(setStatus, event.target.value)
                    }
                    className="h-[40px] w-full appearance-none rounded-[9px] border border-[#d9e1eb] bg-[#f8fafc] px-[13px] pr-[34px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    strokeWidth={1.6}
                    className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-[40px] shrink-0 items-center justify-center gap-[5px] rounded-[9px] px-[10px] text-[12px] font-semibold text-[#4f46e5] transition hover:bg-[#eef2ff]"
                  >
                    <X size={14} />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile results heading */}
          <div className="flex items-center justify-between border-b border-[#dce3ed] px-[15px] py-[13px] lg:hidden">
            <h2 className="text-[15px] font-bold leading-[20px] text-[#172033]">
              All Candidates
            </h2>

            <span className="text-[11px] text-[#64748b]">
              {pagination.total} results
            </span>
          </div>

          {/* Desktop column heading */}
          <div className="hidden grid-cols-[2.1fr_1.35fr_1.15fr_0.9fr_0.9fr_1fr] border-b border-[#dce3ed] bg-[#f8fafc] px-[19px] py-[11px] text-[11px] font-semibold text-[#64748b] lg:grid">
            <div>Candidate</div>
            <div>Job Applied</div>
            <div>Contact</div>
            <div>AI Match</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Error */}
          {error && !loading && (
            <div className="flex flex-col gap-3 border-b border-[#dce3ed] bg-[#fffafa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => fetchCandidates()}
                className="text-left text-[12px] font-semibold text-red-700 underline sm:text-right"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-16 text-center">
              <Loader2 size={29} className="animate-spin text-[#4f46e5]" />

              <p className="mt-3 text-[13px] text-[#64748b]">
                Loading candidates...
              </p>
            </div>
          ) : candidates.length > 0 ? (
            <div>
              {candidates.map((candidate) => {
                const matchClass = getMatchClass(candidate.aiMatch || 0);

                return (
                  <article
                    key={candidate.applicationId}
                    className="border-b border-[#dce3ed] bg-white px-[15px] py-[15px] last:border-b-0 sm:px-[19px] lg:grid lg:grid-cols-[2.1fr_1.35fr_1.15fr_0.9fr_1fr_1fr] lg:items-center lg:gap-0 lg:px-[19px] lg:py-[14px]"
                  >
                    {/* Candidate */}
                    <div className="flex min-w-0 items-start gap-[11px]">
                      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#eef2ff] text-[13px] font-bold text-[#4f46e5] sm:h-[45px] sm:w-[45px]">
                        {candidate.initials || "C"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-[7px]">
                          <h3 className="max-w-full truncate text-[14px] font-semibold leading-[19px] text-[#172033]">
                            {candidate.name || "Candidate"}
                          </h3>

                          <span
                            className={`inline-flex rounded-full px-[9px] py-[3px] text-[10px] font-semibold ${getStatusStyle(candidate.status)}`}
                          >
                            {formatStatus(candidate.status)}
                          </span>
                        </div>

                        <p className="mt-[2px] truncate text-[11px] leading-[16px] text-[#64748b]">
                          {candidate.role || "Candidate"}
                        </p>

                        <div className="mt-[5px] flex flex-wrap items-center gap-x-[10px] gap-y-[4px] text-[11px] text-[#64748b] lg:hidden">
                          {candidate.location && (
                            <span className="flex items-center gap-[4px]">
                              <MapPin size={12} />
                              {candidate.location}
                            </span>
                          )}

                          <span className="flex items-center gap-[4px]">
                            <CalendarDays size={12} />
                            Applied {formatAppliedDate(candidate.appliedDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Job applied */}
                    <div className="mt-[13px] flex items-start gap-[9px] lg:mt-0">
                      <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[8px] bg-[#f1f5f9] lg:hidden">
                        <BriefcaseBusiness
                          size={15}
                          className="text-[#64748b]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-[#334155] lg:text-[13px]">
                          {candidate.job?.title || "Job"}
                        </p>

                        <p className="mt-[3px] text-[11px] text-[#94a3b8]">
                          Applied {formatAppliedDate(candidate.appliedDate)}
                        </p>

                        {candidate.location && (
                          <p className="mt-[2px] hidden truncate text-[11px] text-[#94a3b8] lg:block">
                            {candidate.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="mt-[10px] flex min-w-0 flex-wrap gap-x-[12px] gap-y-[6px] text-[11px] text-[#64748b] lg:mt-0 lg:flex-col lg:gap-[5px]">
                      {candidate.email && (
                        <span className="flex min-w-0 items-center gap-[5px]">
                          <Mail size={13} className="shrink-0 text-[#94a3b8]" />
                          <span className="max-w-[210px] truncate">
                            {candidate.email}
                          </span>
                        </span>
                      )}

                      {candidate.phone && (
                        <span className="flex items-center gap-[5px]">
                          <Phone
                            size={13}
                            className="shrink-0 text-[#94a3b8]"
                          />
                          {candidate.phone}
                        </span>
                      )}
                    </div>

                    {/* AI Match */}
                    <div className="mt-[12px] flex items-center gap-[8px] lg:mt-0">
                      <div
                        className={`flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-[8px] lg:hidden ${matchClass.background}`}
                      >
                        <Sparkles size={15} className={matchClass.text} />
                      </div>

                      <div>
                        <div
                          className={`flex items-center gap-[6px] text-[13px] font-bold ${matchClass.text}`}
                        >
                          <span
                            className={`hidden h-[7px] w-[7px] rounded-full lg:block ${matchClass.dot}`}
                          />
                          {candidate.aiMatch > 0
                            ? `${candidate.aiMatch}%`
                            : "—"}
                        </div>

                        <p className="text-[10px] text-[#94a3b8] lg:hidden">
                          AI Match
                        </p>
                      </div>
                    </div>

                    {/* Status and resume */}
                    <div className="mt-[12px] flex flex-wrap items-center gap-[7px] lg:mt-0 lg:flex-col lg:items-start">
                      <span
                        className={`inline-flex rounded-full px-[10px] py-[4px] text-[10px] font-semibold ${getStatusStyle(candidate.status)}`}
                      >
                        {formatStatus(candidate.status)}
                      </span>

                      {candidate.resume?.pdfAvailable ? (
                        <span className="inline-flex items-center gap-[4px] rounded-[6px] bg-[#fee2e2] px-[7px] py-[4px] text-[10px] font-semibold text-[#dc2626]">
                          <FileText size={11} />
                          PDF Resume
                        </span>
                      ) : candidate.resume?.available ? (
                        <span className="inline-flex items-center gap-[4px] rounded-[6px] bg-[#eef2ff] px-[7px] py-[4px] text-[10px] font-semibold text-[#4f46e5]">
                          <FileText size={11} />
                          Resume
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#94a3b8]">
                          No resume
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-[13px] flex items-center gap-[9px] border-t border-[#edf0f5] pt-[12px] lg:mt-0 lg:justify-start lg:border-0 lg:pt-0">
                      <button
                        type="button"
                        onClick={() => openCandidate(candidate)}
                        className="flex h-[35px] flex-1 items-center justify-center gap-[6px] rounded-[8px] bg-[#eef2ff] px-[13px] text-[12px] font-semibold text-[#4f46e5] transition hover:bg-[#e0e7ff] lg:h-[29px] lg:flex-none"
                      >
                        <Eye size={14} />
                        View Profile
                      </button>
                    </div>

                    {/* Mobile skills */}
                    {candidate.skills?.length > 0 && (
                      <div className="mt-[11px] flex flex-wrap gap-[5px] lg:col-span-6">
                        {candidate.skills.slice(0, 5).map((skill, index) => {
                          const skillName =
                            typeof skill === "string"
                              ? skill
                              : skill?.name || skill?.skill || "Skill";

                          return (
                            <span
                              key={`${skillName}-${index}`}
                              className="rounded-[5px] bg-[#f1f5f9] px-[7px] py-[4px] text-[10px] font-medium text-[#52617a]"
                            >
                              {skillName}
                            </span>
                          );
                        })}

                        {candidate.skills.length > 5 && (
                          <span className="rounded-[5px] bg-[#f1f5f9] px-[7px] py-[4px] text-[10px] font-medium text-[#71809a]">
                            +{candidate.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#eef2ff]">
                <Users size={22} strokeWidth={1.7} className="text-[#4f46e5]" />
              </div>

              <h3 className="mt-3 text-[15px] font-semibold text-[#172033]">
                {hasFilters ? "No matching candidates" : "No applicants yet"}
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-[12px] leading-[19px] text-[#64748b]">
                {hasFilters
                  ? "Try changing your search or filters to find candidates."
                  : "Candidates who apply to your published jobs will appear here."}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex h-[35px] items-center justify-center rounded-[8px] bg-[#4f46e5] px-[14px] text-[12px] font-semibold text-white transition hover:bg-[#4338ca]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Server-side pagination */}
          {!loading && pagination.totalPages > 0 && (
            <div className="flex flex-col items-center justify-between gap-[11px] border-t border-[#dce3ed] px-[15px] py-[12px] sm:flex-row sm:px-[19px]">
              <p className="text-[11px] text-[#64748b]">
                Showing{" "}
                <span className="font-semibold text-[#172033]">
                  {pagination.total === 0
                    ? 0
                    : (safePage - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-[#172033]">
                  {Math.min(safePage * pagination.limit, pagination.total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#172033]">
                  {pagination.total}
                </span>{" "}
                candidates
              </p>

              <div className="flex items-center gap-[5px]">
                <button
                  type="button"
                  disabled={safePage <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="flex h-[29px] w-[35px] items-center justify-center rounded-[7px] border border-[#dce3ed] bg-white text-[#64748b] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} strokeWidth={1.7} />
                </button>

                <span className="min-w-[90px] text-center text-[11px] font-medium text-[#475569]">
                  Page {safePage} of {safeTotalPages}
                </span>

                <button
                  type="button"
                  disabled={safePage >= safeTotalPages || loading}
                  onClick={() =>
                    setPage((current) => Math.min(safeTotalPages, current + 1))
                  }
                  className="flex h-[29px] w-[35px] items-center justify-center rounded-[7px] border border-[#dce3ed] bg-white text-[#64748b] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={15} strokeWidth={1.7} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
