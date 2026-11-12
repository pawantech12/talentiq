"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  BriefcaseBusiness,
  FileText,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  CalendarDays,
  Mail,
  Phone,
  ClipboardList,
  Loader2,
  Filter,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

const STATUS_OPTIONS = ["Submitted", "Under Review", "Shortlisted", "Rejected"];

const STATUS_STYLES = {
  Submitted: "bg-blue-50 text-blue-700 border-blue-200",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
  Shortlisted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="rounded-xl border border-[#dce3ed] bg-white px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:px-5">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-slate-500 sm:text-[13px]">
          {title}
        </p>
        <p className="mt-2 text-[25px] font-bold tracking-tight text-[#172033] sm:text-[28px]">
          {value}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">{description}</p>
      </div>

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={21} />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex whitespace-nowrap items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
      STATUS_STYLES[status] || "border-slate-200 bg-slate-50 text-slate-600"
    }`}
  >
    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
    {status || "Submitted"}
  </span>
);

const MatchScore = ({ score }) => {
  const value = Math.min(100, Math.max(0, Number(score) || 0));

  return (
    <div className="min-w-[90px]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold text-[#172033]">{value}%</span>
        <span className="text-[10px] text-slate-400">Match</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            value >= 75
              ? "bg-emerald-500"
              : value >= 50
                ? "bg-amber-500"
                : "bg-rose-400"
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default function RecruiterApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    shortlisted: 0,
    rejected: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [jobId, setJobId] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState("");

  const fetchApplications = useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) setLoading(true);
        else setRefreshing(true);

        setError("");

        const response = await axios.get("/api/recruiter/applications", {
          params: {
            search: search.trim(),
            status,
            jobId,
            page: pagination.page,
            limit: 10,
          },
        });

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Unable to load applications",
          );
        }

        setApplications(response.data.applications || []);
        setJobs(response.data.jobs || []);
        setStats(
          response.data.stats || {
            total: 0,
            submitted: 0,
            underReview: 0,
            shortlisted: 0,
            rejected: 0,
          },
        );
        setPagination(
          response.data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Something went wrong while loading applications.";

        setError(message);

        if (err.response?.status === 401) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status, jobId, pagination.page, router],
  );

  // Debounce search and filter requests.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const changeSearch = (value) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const changeStatusFilter = (value) => {
    setStatus(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const changeJobFilter = (value) => {
    setJobId(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const openCandidate = (application) => {
    const candidateId = application.student?.id;

    if (!candidateId) return;

    const params = new URLSearchParams({
      jobId: application.job?.id || "",
      applicationId: application.applicationId || application.id,
    });

    router.push(
      `/dashboard/recruiter/candidates/${candidateId}?${params.toString()}`,
    );
  };

  const goToPage = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === pagination.page
    ) {
      return;
    }

    setPagination((prev) => ({ ...prev, page: nextPage }));
  };

  const pageNumbers = Array.from(
    { length: pagination.totalPages },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 ||
      number === pagination.totalPages ||
      Math.abs(number - pagination.page) <= 1,
  );

  const startRecord =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const endRecord = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* Breadcrumb and heading */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-[12px] text-slate-400">
            <span>Recruiter Dashboard</span>
            <ChevronRight size={14} />
            <span className="font-medium text-slate-600">Applications</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-[25px] font-bold tracking-tight text-[#172033] sm:text-[29px]">
                Applications
              </h1>
              <p className="mt-1 text-[13px] text-slate-500">
                Review, manage and track candidates applying to your jobs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchApplications({ showLoader: false })}
              disabled={refreshing || loading}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-[#dce3ed] bg-white px-4 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-5">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={Users}
            color="bg-indigo-50 text-indigo-600"
            description="Across all your jobs"
          />
          <StatCard
            title="Submitted"
            value={stats.submitted}
            icon={FileText}
            color="bg-blue-50 text-blue-600"
            description="New applications"
          />
          <StatCard
            title="Under Review"
            value={stats.underReview}
            icon={Clock3}
            color="bg-amber-50 text-amber-600"
            description="Currently reviewing"
          />
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-600"
            description="Selected for next stage"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="bg-rose-50 text-rose-600"
            description="Not moving forward"
          />
        </div>

        {/* Main content */}
        <section className="overflow-hidden rounded-xl border border-[#dce3ed] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
          {/* Filters */}
          <div className="border-b border-[#e8edf4] px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center gap-2">
              <Filter size={15} className="text-slate-500" />
              <h2 className="text-[13px] font-semibold text-[#172033]">
                All Applications
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {pagination.total}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(220px,1fr)_190px_220px]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => changeSearch(event.target.value)}
                  placeholder="Search candidate, email, job..."
                  className="h-10 w-full rounded-lg border border-[#dce3ed] bg-[#f8fafc] pl-9 pr-3 text-[12px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-50"
                />
              </div>

              <div className="relative">
                <select
                  value={status}
                  onChange={(event) => changeStatusFilter(event.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[#dce3ed] bg-[#f8fafc] px-3 pr-9 text-[12px] font-medium text-slate-600 outline-none focus:border-indigo-400 focus:bg-white"
                >
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative">
                <select
                  value={jobId}
                  onChange={(event) => changeJobFilter(event.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[#dce3ed] bg-[#f8fafc] px-3 pr-9 text-[12px] font-medium text-slate-600 outline-none focus:border-indigo-400 focus:bg-white"
                >
                  <option value="all">All jobs</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3 text-[12px] text-rose-700 sm:mx-5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => fetchApplications()}
                className="ml-auto shrink-0 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <Loader2 size={27} className="animate-spin text-indigo-600" />
              <p className="text-[12px] text-slate-500">
                Loading applications...
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ClipboardList size={25} />
              </div>
              <h3 className="text-[15px] font-semibold text-[#172033]">
                No applications found
              </h3>
              <p className="mt-1 max-w-sm text-[12px] leading-5 text-slate-500">
                {search || status !== "all" || jobId !== "all"
                  ? "Try changing your search or filters to find applications."
                  : "Applications submitted for your published jobs will appear here."}
              </p>

              {(search || status !== "all" || jobId !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    setJobId("all");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-[12px] font-semibold text-white hover:bg-indigo-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#e8edf4] bg-[#f8fafc]">
                      {[
                        "CANDIDATE",
                        "JOB",
                        "APPLIED DATE",
                        "AI MATCH",
                        "ASSESSMENT",
                        "STATUS",
                        "ACTION",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-[10px] font-bold tracking-wider text-slate-400"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#edf1f6]">
                    {applications.map((application) => {
                      const student = application.student || {};
                      const assessment = application.assessment;

                      return (
                        <tr
                          key={application.id}
                          className="transition hover:bg-[#fafbfe]"
                        >
                          <td className="px-4 py-4">
                            <div className="flex min-w-[210px] items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[12px] font-bold text-indigo-600">
                                {student.initials || "ST"}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-[12px] font-semibold text-[#172033]">
                                  {student.name || "Unknown student"}
                                </p>
                                <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-400">
                                  <Mail size={11} />
                                  {student.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="max-w-[190px]">
                              <p className="truncate text-[12px] font-semibold text-slate-700">
                                {application.job?.title || "—"}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                                <BriefcaseBusiness size={11} />
                                {application.job?.employmentType || "—"}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="whitespace-nowrap text-[11px] text-slate-600">
                              {formatDate(application.appliedDate)}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <MatchScore score={application.aiMatch} />
                          </td>

                          <td className="px-4 py-4">
                            {assessment ? (
                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  assessment.status === "submitted"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : assessment.status === "expired"
                                      ? "bg-rose-50 text-rose-700"
                                      : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {assessment.status === "submitted"
                                  ? "Completed"
                                  : assessment.status === "in_progress"
                                    ? "In progress"
                                    : "Expired"}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Not assigned
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <div className="min-w-[135px]">
                              <StatusBadge status={application.status} />
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => openCandidate(application)}
                              className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                            >
                              <Eye size={13} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile and tablet application cards */}
              <div className="grid grid-cols-1 gap-3 p-3 lg:hidden sm:p-4">
                {applications.map((application) => {
                  const student = application.student || {};
                  const assessment = application.assessment;

                  return (
                    <article
                      key={application.id}
                      className="rounded-xl border border-[#e5eaf1] bg-white p-4 transition hover:border-indigo-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[12px] font-bold text-indigo-600">
                            {student.initials || "ST"}
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-[13px] font-bold text-[#172033]">
                              {student.name || "Unknown student"}
                            </h3>
                            <p className="mt-1 truncate text-[11px] text-slate-400">
                              {student.email || "No email"}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>

                      <div className="mt-4 rounded-lg bg-[#f8fafc] p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Applied for
                        </p>
                        <p className="mt-1 text-[12px] font-semibold text-slate-700">
                          {application.job?.title || "—"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {application.job?.employmentType || "—"}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-400">
                            Applied date
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                            <CalendarDays size={12} />
                            {formatDate(application.appliedDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] text-slate-400">
                            Assessment
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-slate-600">
                            {assessment
                              ? assessment.status === "submitted"
                                ? "Completed"
                                : assessment.status === "in_progress"
                                  ? "In progress"
                                  : "Expired"
                              : "Not assigned"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <MatchScore score={application.aiMatch} />
                      </div>

                      {student.location && (
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin size={12} />
                          {student.location}
                        </p>
                      )}

                      {student.phone && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Phone size={12} />
                          {student.phone}
                        </p>
                      )}

                      {student.skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {student.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}
                          {student.skills.length > 5 && (
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                              +{student.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() => openCandidate(application)}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-[11px] font-semibold text-white transition hover:bg-indigo-700"
                        >
                          <Eye size={13} />
                          View application
                        </button>
                      </div>

                      {updatingId === application.id && (
                        <p className="mt-2 flex items-center gap-1 text-[10px] text-indigo-600">
                          <Loader2 size={11} className="animate-spin" />
                          Updating application...
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && pagination.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#e8edf4] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-[11px] text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startRecord}-{endRecord}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.total}
                </span>{" "}
                applications
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex h-8 items-center gap-1 rounded-lg border border-[#dce3ed] bg-white px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                {pageNumbers.map((number, index) => {
                  const previousNumber = pageNumbers[index - 1];
                  const showGap = previousNumber && number - previousNumber > 1;

                  return (
                    <span key={number} className="contents">
                      {showGap && (
                        <span className="px-1 text-[11px] text-slate-400">
                          ...
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => goToPage(number)}
                        className={`h-8 min-w-8 rounded-lg border px-2 text-[11px] font-semibold transition ${
                          pagination.page === number
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-[#dce3ed] bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {number}
                      </button>
                    </span>
                  );
                })}

                <button
                  type="button"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex h-8 items-center gap-1 rounded-lg border border-[#dce3ed] bg-white px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-5 right-4 z-50 max-w-[calc(100%-2rem)] rounded-lg border border-slate-200 bg-white px-4 py-3 text-[12px] font-medium text-slate-700 shadow-lg sm:right-6">
            {toast}
          </div>
        )}
      </div>
    </main>
  );
}
