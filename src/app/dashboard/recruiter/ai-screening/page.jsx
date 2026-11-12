"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileSearch,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const PAGE_SIZE = 9;

const STATUS_OPTIONS = [
  { label: "All jobs", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Draft", value: "Draft" },
  { label: "Closed", value: "Closed" },
];

function formatDate(date) {
  if (!date) return "Recently created";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "Closed":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    case "Draft":
    default:
      return "bg-amber-50 text-amber-700 ring-amber-200";
  }
}

function StatCard({ icon: Icon, label, value, detail, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {Number(value || 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onOpen }) {
  const progress = Math.min(100, Math.max(0, job.analysisProgress || 0));

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BriefcaseBusiness size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold text-slate-900">
              {job.title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {job.industry || "Industry not specified"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
            job.status,
          )}`}
        >
          {job.status}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          {job.location || "Location not specified"}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={14} />
          {job.employmentType || "Employment type not specified"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[11px] font-medium text-slate-500">Applicants</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {job.applicants || 0}
          </p>
        </div>

        <div className="border-x border-slate-200 px-3">
          <p className="text-[11px] font-medium text-slate-500">Analyzed</p>
          <p className="mt-1 text-xl font-bold text-indigo-600">
            {job.analyzed || 0}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-slate-500">Strong match</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {job.strongMatches || 0}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            AI analysis progress
          </span>
          <span className="text-xs font-bold text-slate-700">{progress}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {job.analyzed || 0} of {job.applicants || 0} applications analyzed
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-[11px] text-slate-500">Average AI score</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">
            {job.analyzed > 0 ? `${job.averageScore}%` : "—"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpen(job.id)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        >
          View rankings
          <ArrowRight size={16} />
        </button>
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        Created {formatDate(job.createdAt)}
      </p>
    </article>
  );
}

export default function AIScreeningDashboardPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    analyzed: 0,
    strongMatches: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search,
          status: activeStatus,
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        const response = await fetch(
          `/api/recruiter/ai-screening?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load AI screening data.");
        }

        setJobs(data.jobs || []);
        setStats(
          data.stats || {
            totalJobs: 0,
            totalApplicants: 0,
            analyzed: 0,
            strongMatches: 0,
          },
        );
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [search, activeStatus, page],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal);

    return () => controller.abort();
  }, [fetchDashboard]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, search]);

  const openRanking = (jobId) => {
    router.push(`/dashboard/recruiter/ai-screening/${jobId}/ranking`);
  };

  const pageNumbers = Array.from(
    { length: pagination.totalPages || 1 },
    (_, index) => index + 1,
  ).filter(
    (number) =>
      number === 1 ||
      number === pagination.totalPages ||
      Math.abs(number - page) <= 1,
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <Sparkles size={14} />
              AI-powered recruitment
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              AI Screening
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Review applicant analysis, compare candidate scores, and find the
              strongest matches for your open positions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/recruiter/jobs")}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <BriefcaseBusiness size={16} />
            Manage jobs
          </button>
        </div>

        {/* Summary cards */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={BriefcaseBusiness}
            label="Total job postings"
            value={stats.totalJobs}
            detail="Jobs posted by you"
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <StatCard
            icon={Users}
            label="Total applicants"
            value={stats.totalApplicants}
            detail="Across all your jobs"
            iconClass="bg-sky-50 text-sky-600"
          />

          <StatCard
            icon={FileSearch}
            label="Applications analyzed"
            value={stats.analyzed}
            detail="Applications with an AI score"
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            icon={CheckCircle2}
            label="Strong matches"
            value={stats.strongMatches}
            detail="Candidates scoring 85 or higher"
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* Intro banner */}
        <section className="relative mt-7 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3730a3] via-[#5145cd] to-[#6d45d8] p-5 text-white shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 right-40 h-56 w-56 rounded-full border-[30px] border-white/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-100">
                <Sparkles size={16} />
                Smarter candidate discovery
              </div>

              <h2 className="text-xl font-bold sm:text-2xl">
                Let AI help you find the right talent
              </h2>

              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Compare resume relevance, skills, experience, education, and
                assessment performance in one candidate ranking view.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="rounded-lg bg-white/15 p-2">
                <BarChart3 size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {stats.analyzed.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-indigo-100">Applications analyzed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs and filters */}
        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your job screenings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a job to view its AI-ranked candidates.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative flex-1 lg:w-[290px]">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search job title, industry..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="relative sm:w-[170px]">
                <SlidersHorizontal
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={activeStatus}
                  onChange={(event) => setActiveStatus(event.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  aria-label="Filter jobs by status"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => fetchDashboard()}
                className="w-fit font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex gap-3">
                    <div className="h-11 w-11 rounded-xl bg-slate-100" />
                    <div className="flex-1">
                      <div className="h-4 w-3/4 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="mt-6 h-16 rounded-xl bg-slate-100" />
                  <div className="mt-5 h-2 rounded bg-slate-100" />
                  <div className="mt-6 h-10 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onOpen={openRanking} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row">
                  <p className="text-sm text-slate-500">
                    Showing page{" "}
                    <span className="font-semibold text-slate-800">
                      {pagination.page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-800">
                      {pagination.totalPages}
                    </span>{" "}
                    · {pagination.total} jobs
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    {pageNumbers.map((number) => (
                      <button
                        type="button"
                        key={number}
                        onClick={() => setPage(number)}
                        className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                          page === number
                            ? "bg-indigo-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={page >= pagination.totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(pagination.totalPages, current + 1),
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <FileSearch size={25} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {search || activeStatus !== "all"
                  ? "No matching jobs found"
                  : "No jobs available for AI screening"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search || activeStatus !== "all"
                  ? "Try changing your search or status filter."
                  : "Once you create a job and receive applications, its AI screening results will appear here."}
              </p>

              {(search || activeStatus !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveStatus("all");
                    setPage(1);
                  }}
                  className="mt-5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear filters
                </button>
              )}

              {!search && activeStatus === "all" && (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/recruiter/jobs")}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Manage jobs
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
