"use client";

import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Timer,
  Play,
  RotateCcw,
  AlertCircle,
  ClipboardCheck,
  Eye,
  Trophy,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { label: "All Assessments", value: "all" },
  { label: "Not Started", value: "not_started" },
  { label: "In Progress", value: "in_progress" },
  { label: "Expired", value: "expired" },
  { label: "Completed", value: "submitted" },
];

function formatDate(date) {
  if (!date) return "Recently";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(seconds = 900) {
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} min`;
}

function getAssessmentStatus(job) {
  if (!job.assessment) return "not_started";

  if (
    job.assessment.status === "in_progress" &&
    job.assessment.expiresAt &&
    new Date(job.assessment.expiresAt) <= new Date()
  ) {
    return "expired";
  }

  return job.assessment.status || "not_started";
}

// Safely read common score properties from the saved result.
// Adjust these keys if your Assessment.result schema uses different names.
function getResultScore(result) {
  if (!result || typeof result !== "object") return null;

  const value =
    result.percentage ??
    result.scorePercentage ??
    result.score ??
    result.marksObtained;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function StatusBadge({ status }) {
  const styles = {
    not_started: "bg-amber-50 text-amber-600 border-amber-100",
    in_progress: "bg-blue-50 text-blue-600 border-blue-100",
    expired: "bg-red-50 text-red-600 border-red-100",
    submitted: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  const labels = {
    not_started: "Not Started",
    in_progress: "In Progress",
    expired: "Expired",
    submitted: "Completed",
  };

  const icons = {
    not_started: Clock3,
    in_progress: RotateCcw,
    expired: AlertCircle,
    submitted: CheckCircle2,
  };

  const Icon = icons[status] || Clock3;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold sm:text-[10px] ${
        styles[status] || styles.not_started
      }`}
    >
      <Icon size={11} strokeWidth={2} />
      {labels[status] || "Not Started"}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-[#8493a8] sm:text-[11px]">
            {title}
          </p>

          <h3 className="mt-1.5 text-[23px] font-bold leading-7 text-[#172033] sm:text-[26px]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] sm:h-10 sm:w-10 ${iconBg} ${iconColor}`}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-2 text-[9px] font-normal text-[#94a3b8] sm:text-[10px]">
        {description}
      </p>
    </div>
  );
}

function AssessmentCard({ job, onAction }) {
  const status = getAssessmentStatus(job);

  const isInProgress = status === "in_progress";
  const isExpired = status === "expired";
  const isCompleted = status === "submitted";

  const resultScore = getResultScore(job.assessment?.result);

  const accentColor = isCompleted
    ? "bg-emerald-500"
    : isExpired
      ? "bg-red-400"
      : isInProgress
        ? "bg-blue-500"
        : "bg-[#5146e5]";

  const assessmentIcon = isCompleted
    ? Trophy
    : isExpired
      ? AlertCircle
      : isInProgress
        ? RotateCcw
        : ClipboardCheck;

  const AssessmentIcon = assessmentIcon;

  return (
    <article className="group overflow-hidden rounded-[10px] border border-[#dce4ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:border-[#c7c4fa] hover:shadow-[0_5px_16px_rgba(79,70,229,0.07)]">
      <div className={`h-[3px] w-full ${accentColor}`} />

      <div className="p-3.5 sm:p-4 lg:p-5">
        {/* Company and status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-indigo-50 text-[12px] font-bold text-[#5146e5] sm:h-10 sm:w-10 sm:text-[13px]">
              {job.companyInitials || "CO"}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[12px] font-bold text-[#172033] sm:text-[13px]">
                {job.company}
              </h3>

              <p className="mt-0.5 truncate text-[10px] font-medium text-[#8493a8] sm:text-[11px]">
                {job.industry || "Company"}
              </p>
            </div>
          </div>

          <StatusBadge status={status} />
        </div>

        {/* Job details */}
        <div className="mt-4">
          <h2 className="text-[14px] font-bold leading-5 text-[#172033] transition-colors group-hover:text-[#5146e5] sm:text-[15px]">
            {job.title}
          </h2>

          <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2 text-[10px] font-medium text-[#8190a5] sm:text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin size={12} strokeWidth={1.7} />
              {job.location || "Location not specified"}
            </span>

            <span className="flex items-center gap-1">
              <BriefcaseBusiness size={12} strokeWidth={1.7} />
              {job.employmentType || "Not specified"}
            </span>

            <span className="flex items-center gap-1">
              <GraduationCap size={13} strokeWidth={1.7} />
              {job.experienceLevel || "Not specified"}
            </span>
          </div>
        </div>

        {/* Required skills */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <Target size={12} className="text-[#8493a8]" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.7px] text-[#94a3b8]">
              Assessment Skills
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(job.requiredSkills || []).slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-[5px] bg-indigo-50 px-2.5 py-1 text-[9px] font-medium text-[#5146e5] sm:text-[10px]"
              >
                {skill}
              </span>
            ))}

            {(job.requiredSkills || []).length > 4 && (
              <span className="rounded-[5px] bg-[#f1f5f9] px-2.5 py-1 text-[9px] font-medium text-[#71829a] sm:text-[10px]">
                +{job.requiredSkills.length - 4} more
              </span>
            )}

            {!job.requiredSkills?.length && (
              <span className="text-[10px] text-[#94a3b8]">
                No specific skills listed
              </span>
            )}
          </div>
        </div>

        {/* Assessment information */}
        <div className="mt-4 rounded-[8px] border border-[#e5eaf2] bg-[#f8fafc] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] ${
                  isCompleted
                    ? "bg-emerald-50 text-emerald-600"
                    : isExpired
                      ? "bg-red-50 text-red-500"
                      : isInProgress
                        ? "bg-blue-50 text-blue-500"
                        : "bg-indigo-50 text-[#5146e5]"
                }`}
              >
                <AssessmentIcon size={15} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-medium text-[#8493a8] sm:text-[10px]">
                  {job.assessmentType || "Skill Assessment"}
                </p>

                <p className="mt-0.5 truncate text-[10px] font-semibold text-[#172033] sm:text-[11px]">
                  {isCompleted
                    ? "You have completed this assessment"
                    : isExpired
                      ? "Your assessment time has expired"
                      : isInProgress
                        ? "Continue your assessment"
                        : "Test your job-related skills"}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="flex items-center justify-end gap-1 text-[#8493a8]">
                <Clock3 size={11} />

                <p className="text-[9px] font-medium sm:text-[10px]">
                  Duration
                </p>
              </div>

              <p className="mt-0.5 text-[11px] font-bold text-[#172033]">
                {formatDuration(job.assessment?.durationSeconds || 900)}
              </p>
            </div>
          </div>

          {/* Completed result preview */}
          {isCompleted && (
            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-[#e5eaf2] pt-2.5">
              <div className="flex items-center gap-1.5 text-[9px] font-medium text-emerald-600 sm:text-[10px]">
                <CheckCircle2 size={12} />
                Submitted on {formatDate(job.assessment?.submittedAt)}
              </div>

              {resultScore !== null && (
                <div className="shrink-0 rounded-[5px] bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  Score: {resultScore}
                  {resultScore <= 100 ? "%" : ""}
                </div>
              )}
            </div>
          )}

          {isInProgress && job.assessment?.expiresAt && (
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-[#e5eaf2] pt-2.5 text-[9px] font-medium text-blue-600 sm:text-[10px]">
              <Timer size={11} />
              Expires: {formatDate(job.assessment.expiresAt)}
            </div>
          )}

          {isExpired && (
            <div className="mt-2.5 flex items-center gap-1.5 border-t border-[#e5eaf2] pt-2.5 text-[9px] font-medium text-red-600 sm:text-[10px]">
              <AlertCircle size={11} />
              Attempt expired: {formatDate(job.assessment?.expiresAt)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-col gap-3 border-t border-[#edf1f6] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#94a3b8] sm:text-[10px]">
            <FileText size={12} />
            Applied on {formatDate(job.appliedAt)}
          </div>

          <button
            type="button"
            onClick={() => onAction(job)}
            className={`flex h-8 w-full items-center justify-center gap-2 rounded-[7px] px-4 text-[10px] font-semibold transition sm:w-auto sm:text-[11px] ${
              isCompleted
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : isExpired
                  ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                  : isInProgress
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-[#5146e5] text-white shadow-[0_3px_8px_rgba(79,70,229,0.16)] hover:bg-[#453bcf]"
            }`}
          >
            {isCompleted ? (
              <Eye size={13} />
            ) : isExpired || isInProgress ? (
              <RotateCcw size={13} />
            ) : (
              <Play size={12} fill="currentColor" />
            )}

            {isCompleted
              ? "View Result"
              : isExpired
                ? "Restart Assessment"
                : isInProgress
                  ? "Resume Assessment"
                  : "Start Assessment"}

            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-[10px] border border-[#dce4ef] bg-white p-4">
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-[8px] bg-slate-200" />

        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-slate-200" />
          <div className="h-2.5 w-24 rounded bg-slate-100" />
        </div>

        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>

      <div className="mt-5 h-4 w-2/3 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-full rounded bg-slate-100" />
      <div className="mt-5 h-16 rounded-[8px] bg-slate-100" />
      <div className="mt-4 h-8 rounded-[7px] bg-slate-100" />
    </div>
  );
}

export default function StudentAssessmentsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    expired: 0,
    completed: 0,
    pending: 0,
  });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/assessments", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load assessments.");
      }

      setJobs(data.jobs || []);

      setStats(
        data.stats || {
          total: 0,
          notStarted: 0,
          inProgress: 0,
          expired: 0,
          completed: 0,
          pending: 0,
        },
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Search and filter all assessments, including completed assessments.
  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const status = getAssessmentStatus(job);

      const matchesFilter = activeFilter === "all" || status === activeFilter;

      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.industry?.toLowerCase().includes(query) ||
        job.assessmentType?.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [jobs, search, activeFilter]);

  // Completed assessments open in result view.
  const handleAction = (job) => {
    const status = getAssessmentStatus(job);

    if (status === "submitted") {
      router.push(`/dashboard/student/jobs/${job.jobId}/assessment/result`);
      return;
    }

    router.push(`/dashboard/student/jobs/${job.jobId}/assessment`);
  };

  const filterCounts = {
    all: stats.total,
    not_started: stats.notStarted,
    in_progress: stats.inProgress,
    expired: stats.expired,
    submitted: stats.completed,
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-5">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1 text-[11px] font-medium text-[#71829a] sm:text-[12px] lg:mb-4 lg:text-[13px]">
          <button
            type="button"
            onClick={() => router.push("/dashboard/student")}
            className="transition hover:text-[#5146e5]"
          >
            Dashboard
          </button>

          <ChevronRight size={13} strokeWidth={1.7} className="shrink-0" />

          <span className="font-semibold text-[#5146e5]">Assessments</span>
        </div>

        {/* Page heading */}
        <section className="mb-4">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#ede9fe] px-2.5 py-1 text-[10px] font-semibold text-[#7c3aed] sm:text-[11px]">
            <Sparkles size={12} strokeWidth={1.8} />
            Skill Evaluation
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-[21px] font-bold leading-7 tracking-[-0.3px] text-[#172033] sm:text-[24px] lg:text-[26px]">
                My Assessments
              </h1>

              <p className="mt-1 max-w-[760px] text-[12px] leading-5 text-[#71829a] sm:text-[13px] lg:text-[14px]">
                Complete job-specific skill assessments for the positions you
                have applied for. Demonstrate your knowledge and strengthen your
                applications.
              </p>
            </div>

            <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-indigo-50 text-[#5146e5] sm:flex">
              <ClipboardCheck size={21} strokeWidth={1.7} />
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="relative mb-4 overflow-hidden rounded-[12px] bg-gradient-to-r from-[#39328f] to-[#5146e5] px-4 py-5 text-white shadow-[0_4px_12px_rgba(79,70,229,0.12)] sm:px-6 sm:py-6 lg:px-7 lg:py-7">
          <div className="relative z-10 max-w-[680px]">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-indigo-100 sm:text-[10px]">
              <Sparkles size={11} />
              Job-specific skill assessments
            </div>

            <h2 className="text-[18px] font-bold leading-6 sm:text-[21px] lg:text-[23px]">
              Show employers what you can do
            </h2>

            <p className="mt-1.5 max-w-[570px] text-[10px] leading-5 text-indigo-100 sm:text-[11px] lg:text-[12px]">
              Complete the assessments linked to your job applications. Test
              your technical knowledge, demonstrate your skills, and make your
              profile stand out.
            </p>

            <div className="mt-3 hidden items-center gap-3 text-[10px] font-medium text-indigo-100 sm:flex sm:text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Skill-based questions
              </span>

              <span className="h-3 w-px bg-white/30" />

              <span className="flex items-center gap-1.5">
                <Clock3 size={12} />
                Timed assessments
              </span>

              <span className="h-3 w-px bg-white/30" />

              <span className="flex items-center gap-1.5">
                <Target size={12} />
                Job-specific
              </span>
            </div>
          </div>

          <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
            <div className="relative flex h-[100px] w-[110px] items-center justify-center rounded-[14px] bg-white/10">
              <div className="absolute inset-3 rounded-[11px] border border-white/10 bg-white/5" />

              <div className="relative flex h-12 w-12 items-center justify-center rounded-[14px] bg-white/15">
                <CheckCircle2 size={25} strokeWidth={1.6} />
              </div>

              <div className="absolute bottom-3 left-[23px] flex gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-white/40" />
                <span className="h-1.5 w-4 rounded-full bg-white/20" />
                <span className="h-1.5 w-4 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

          {/* Mobile hero details */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/20 text-center sm:hidden">
            <div>
              <div className="text-[16px] font-bold">Skill</div>
              <div className="mt-0.5 text-[9px] text-indigo-100">Based</div>
            </div>

            <div>
              <div className="text-[16px] font-bold">Timed</div>
              <div className="mt-0.5 text-[9px] text-indigo-100">Tests</div>
            </div>

            <div>
              <div className="text-[16px] font-bold">Job</div>
              <div className="mt-0.5 text-[9px] text-indigo-100">Specific</div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
          <StatCard
            title="Assessment Required"
            value={stats.total}
            description="Applied jobs requiring assessment"
            icon={FileText}
            iconBg="bg-indigo-50"
            iconColor="text-[#5146e5]"
          />

          <StatCard
            title="Not Started"
            value={stats.notStarted}
            description="Assessments waiting for you"
            icon={Clock3}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            description="Assessments you can resume"
            icon={RotateCcw}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            description="Submitted assessments and results"
            icon={CheckCircle2}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
          />
        </section>

        {/* Search and filters */}
        <section className="mb-4 rounded-[10px] border border-[#dce4ef] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[420px]">
              <Search
                size={15}
                strokeWidth={1.8}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title, company or location..."
                className="h-9 w-full rounded-[7px] border border-[#dce4ef] bg-[#f8fafc] pl-10 pr-3 text-[10px] text-[#172033] outline-none transition placeholder:text-[#a0adbd] focus:border-[#a5a0f5] focus:bg-white focus:ring-2 focus:ring-indigo-50 sm:text-[11px]"
              />
            </div>

            <button
              type="button"
              onClick={fetchAssessments}
              disabled={loading}
              className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#dce4ef] bg-white px-4 text-[10px] font-semibold text-[#64748b] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11px]"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`rounded-[6px] px-3 py-2 text-[9px] font-semibold transition sm:text-[10px] ${
                  activeFilter === option.value
                    ? "bg-[#5146e5] text-white shadow-sm"
                    : "bg-[#f1f5f9] text-[#71829a] hover:bg-[#e8edf5]"
                }`}
              >
                {option.label}

                <span
                  className={`ml-1.5 ${
                    activeFilter === option.value
                      ? "text-indigo-100"
                      : "text-[#a0adbd]"
                  }`}
                >
                  {filterCounts[option.value]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Results heading */}
        <section className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[13px] font-semibold text-[#172033] sm:text-[14px]">
              {activeFilter === "submitted"
                ? "Completed Assessments"
                : activeFilter === "all"
                  ? "All Assessments"
                  : "Assessments To Complete"}
            </h2>

            <p className="mt-0.5 text-[10px] text-[#8a99ad] sm:text-[11px]">
              {loading
                ? "Loading your assessments..."
                : `${filteredJobs.length} ${
                    filteredJobs.length === 1 ? "assessment" : "assessments"
                  } found`}
            </p>
          </div>

          {!loading && jobs.length > 0 && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-semibold text-[#5146e5] sm:text-[10px]">
              {stats.pending} Pending · {stats.completed} Completed
            </span>
          )}
        </section>

        {/* Error */}
        {error && (
          <div className="mb-4 flex flex-col gap-3 rounded-[9px] border border-red-200 bg-red-50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchAssessments}
              className="rounded-[6px] bg-red-100 px-3 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        )}

        {/* Assessment cards */}
        {!loading && !error && filteredJobs.length > 0 && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <AssessmentCard
                key={job.applicationId}
                job={job}
                onAction={handleAction}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredJobs.length === 0 && (
          <section className="rounded-[10px] border border-dashed border-[#cbd5e1] bg-white px-5 py-12 text-center sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[10px] bg-indigo-50 text-[#5146e5]">
              {jobs.length === 0 ? (
                <ClipboardCheck size={22} strokeWidth={1.6} />
              ) : (
                <Search size={22} strokeWidth={1.6} />
              )}
            </div>

            <h3 className="mt-4 text-[14px] font-bold text-[#172033]">
              {jobs.length === 0
                ? "No assessments found"
                : "No matching assessments"}
            </h3>

            <p className="mx-auto mt-1.5 max-w-md text-[10px] leading-5 text-[#8493a8] sm:text-[11px]">
              {jobs.length === 0
                ? "When you apply for a job that requires an assessment, it will appear here. Completed assessments and their results will also remain available here."
                : "Try changing your search or selecting a different assessment status."}
            </p>

            {jobs.length === 0 ? (
              <button
                type="button"
                onClick={() => router.push("/dashboard/student/jobs")}
                className="mt-5 inline-flex h-9 items-center justify-center gap-2 rounded-[7px] bg-[#5146e5] px-5 text-[10px] font-semibold text-white transition hover:bg-[#453bcf] sm:text-[11px]"
              >
                Explore Jobs
                <ChevronRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("all");
                }}
                className="mt-5 h-9 rounded-[7px] border border-[#dce4ef] bg-white px-5 text-[10px] font-semibold text-[#64748b] transition hover:bg-[#f8fafc] sm:text-[11px]"
              >
                Clear Filters
              </button>
            )}
          </section>
        )}

        {/* Bottom note */}
        {!loading && jobs.length > 0 && (
          <section className="mt-4 flex flex-col gap-3 rounded-[10px] border border-[#e5defd] bg-[#f6f2ff] p-3.5 sm:flex-row sm:items-center sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#ede9fe] text-[#7c3aed]">
              <Sparkles size={18} strokeWidth={1.7} />
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-[#172033] sm:text-[12px]">
                Give your skills the spotlight
              </h3>

              <p className="mt-0.5 text-[10px] leading-5 text-[#7c3aed] sm:text-[11px]">
                Complete each assessment carefully and manage your time. You can
                also revisit completed assessments to check your results.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
