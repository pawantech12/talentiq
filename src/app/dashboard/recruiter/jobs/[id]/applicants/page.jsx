"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRoundPlus,
  Users,
} from "lucide-react";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const api = axios.create({ withCredentials: true });
const PAGE_SIZE = 6;

const formatDate = (value, mobile = false) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    ...(mobile ? {} : { year: "numeric" }),
  }).format(date);
};

const displayStatus = (status) => (status === "Submitted" ? "New" : status);
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

export default function ApplicantsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id;

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    shortlisted: 0,
    analyzed: 0,
    strongMatches: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [matchFilter, setMatchFilter] = useState("AI Match");
  const [sortBy, setSortBy] = useState("AI Match: High to Low");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  const loadApplicants = useCallback(
    async (quiet = false) => {
      if (!jobId) return;
      try {
        quiet ? setRefreshing(true) : setLoading(true);
        setError("");
        const { data } = await api.get(
          `/api/recruiter/jobs/${jobId}/applicants`,
        );
        if (!data?.success)
          throw new Error(data?.message || "Unable to load applicants.");
        setJob(data.job);
        setApplicants(Array.isArray(data.applicants) ? data.applicants : []);
        setStats(
          data.stats || {
            total: 0,
            submitted: 0,
            underReview: 0,
            shortlisted: 0,
            analyzed: 0,
            strongMatches: 0,
          },
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load applicants.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  const filteredApplicants = useMemo(() => {
    let result = [...applicants];
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((candidate) =>
        [
          candidate.name,
          candidate.experience,
          displayStatus(candidate.status),
          candidate.email,
          candidate.location,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        ),
      );
    }
    if (statusFilter !== "All Status") {
      result = result.filter(
        (candidate) => displayStatus(candidate.status) === statusFilter,
      );
    }
    if (matchFilter === "Strong Matches")
      result = result.filter((candidate) => candidate.aiMatch >= 84);
    if (matchFilter === "Medium Matches")
      result = result.filter(
        (candidate) => candidate.aiMatch >= 80 && candidate.aiMatch < 84,
      );
    if (matchFilter === "Low Matches")
      result = result.filter((candidate) => candidate.aiMatch < 80);
    if (sortBy === "AI Match: High to Low")
      result.sort((a, b) => b.aiMatch - a.aiMatch);
    if (sortBy === "AI Match: Low to High")
      result.sort((a, b) => a.aiMatch - b.aiMatch);
    if (sortBy === "Newest")
      result.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
    return result;
  }, [applicants, search, statusFilter, matchFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplicants.length / PAGE_SIZE),
  );
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const changeStatus = async (candidate, nextStatus) => {
    if (!candidate?.id || !nextStatus || updatingId) return;
    try {
      setUpdatingId(candidate.id);
      const { data } = await api.patch(
        `/api/recruiter/jobs/${jobId}/applicants/${candidate.id}`,
        { status: nextStatus },
      );
      if (!data?.success)
        throw new Error(
          data?.message || "Could not update application status.",
        );
      setApplicants((current) =>
        current.map((item) =>
          item.id === candidate.id
            ? { ...item, status: data.application.status }
            : item,
        ),
      );
      setStats((current) => {
        const next = { ...current };
        const old = candidate.status;
        if (old === "Submitted")
          next.submitted = Math.max(0, next.submitted - 1);
        if (old === "Under Review")
          next.underReview = Math.max(0, next.underReview - 1);
        if (old === "Shortlisted")
          next.shortlisted = Math.max(0, next.shortlisted - 1);
        if (data.application.status === "Submitted") next.submitted += 1;
        if (data.application.status === "Under Review") next.underReview += 1;
        if (data.application.status === "Shortlisted") next.shortlisted += 1;
        return next;
      });
      showToast(
        `Application ${displayStatus(data.application.status).toLowerCase()} successfully.`,
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Status update failed.",
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getMatchClasses = (match) => {
    if (match >= 84)
      return {
        text: "text-[#16a34a]",
        bg: "bg-[#dcfce7]",
        iconBg: "bg-[#dcfce7]",
        dot: "bg-[#16a34a]",
      };
    if (match >= 80)
      return {
        text: "text-[#4f46e5]",
        bg: "bg-[#eef2ff]",
        iconBg: "bg-[#eef2ff]",
        dot: "bg-[#4f46e5]",
      };
    return {
      text: "text-[#f59e0b]",
      bg: "bg-[#fff3cf]",
      iconBg: "bg-[#fff3cf]",
      dot: "bg-[#f59e0b]",
    };
  };
  const getStatusClasses = (status) => {
    const value = displayStatus(status);
    if (value === "Shortlisted") return "bg-[#dcfce7] text-[#16a34a]";
    if (value === "Under Review") return "bg-[#fff3cf] text-[#b45309]";
    if (value === "Rejected") return "bg-[#fee2e2] text-[#b91c1c]";
    return "bg-[#eef2ff] text-[#4f46e5]";
  };
  const getAssessmentClasses = (candidate) => {
    if (candidate.assessment === null || candidate.assessment === undefined)
      return { text: "text-[#f59e0b]", bg: "bg-[#fff3cf]" };
    if (candidate.assessment >= 80)
      return { text: "text-[#16a34a]", bg: "bg-[#dcfce7]" };
    return { text: "text-[#4f46e5]", bg: "bg-[#eef2ff]" };
  };
  const viewCandidate = (candidate) => {
    router.push(
      `/dashboard/recruiter/candidates/${candidate.studentId}?jobId=${jobId}&applicationId=${candidate.id}`,
    );
  };
  const viewJob = () => router.push(`/dashboard/recruiter/jobs/${jobId}`);

  const jobTitle = job?.title || "Job Applicants";
  const location = job?.location || "Location not specified";
  const appliedCount = stats.total || applicants.length;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {toast && (
        <div
          role="status"
          className="fixed right-5 top-5 z-50 max-w-[calc(100vw-40px)] rounded-[9px] bg-[#172033] px-4 py-3 text-[13px] font-medium text-white shadow-xl"
        >
          {toast}
        </div>
      )}
      <div className="w-full px-[20px] pb-[32px] pt-[24px] lg:px-[28px] lg:pb-[28px] lg:pt-[26px]">
        <div className="mb-[30px] flex flex-wrap items-center gap-[9px] text-[14px]">
          <button
            onClick={() => router.push("/dashboard/recruiter/jobs")}
            className="text-[#64748b] hover:text-[#4f46e5]"
          >
            Jobs
          </button>
          <ChevronRight size={15} className="text-[#94a3b8]" />
          <span className="max-w-[220px] truncate text-[#64748b]">
            {jobTitle}
          </span>
          <ChevronRight size={15} className="text-[#94a3b8]" />
          <span className="font-semibold text-[#4f46e5]">Applicants</span>
        </div>

        <div className="flex flex-col gap-[18px] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[27px] font-bold leading-[32px] tracking-[-0.5px] text-[#111827]">
              Applicants
            </h1>
            <p className="mt-[2px] text-[14px] leading-[20px] text-[#475569]">
              Review candidates who applied for {jobTitle}.
            </p>
            <div className="mt-[7px] hidden min-h-[33px] flex-wrap items-center overflow-hidden rounded-[8px] border border-[#dce3ed] bg-white lg:flex">
              <div className="flex items-center gap-[7px] px-[13px] py-2 text-[13px] font-semibold text-[#172033]">
                <BriefcaseBusiness size={15} className="text-[#4f46e5]" />
                {jobTitle}
              </div>
              <div className="h-[20px] w-px bg-[#dce3ed]" />
              <div className="px-[13px] py-2 text-[13px] text-[#64748b]">
                {job?.industry || "Industry not specified"}
              </div>
              <div className="h-[20px] w-px bg-[#dce3ed]" />
              <div className="flex items-center gap-[6px] px-[13px] py-2 text-[13px] text-[#64748b]">
                <MapPin size={15} />
                {location}
              </div>
              <div className="h-[20px] w-px bg-[#dce3ed]" />
              <div className="flex items-center gap-[6px] px-[13px] py-2 text-[13px] text-[#4f46e5]">
                <Users size={15} />
                {appliedCount} Applications
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-[9px] lg:flex">
            <button
              type="button"
              onClick={() => loadApplicants(true)}
              disabled={refreshing}
              className="flex h-[39px] items-center gap-[8px] rounded-[8px] border border-[#dce3ed] bg-white px-[13px] text-[13px] font-semibold text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={viewJob}
              className="flex h-[39px] items-center gap-[8px] rounded-[8px] border border-[#dce3ed] bg-white px-[16px] text-[13px] font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
            >
              <ExternalLink size={15} />
              View Job
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("Shortlisted");
                setCurrentPage(1);
              }}
              className="flex h-[39px] items-center gap-[8px] rounded-[8px] bg-[#4f46e5] px-[18px] text-[13px] font-semibold text-white shadow-[0_3px_7px_rgba(79,70,229,0.2)] transition hover:bg-[#4338ca]"
            >
              <Star size={15} />
              Shortlisted ({stats.shortlisted})
            </button>
          </div>
        </div>

        <div className="mt-[18px] rounded-[11px] border border-[#dce3ed] bg-white px-[15px] py-[14px] lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[21px] font-bold leading-[26px] text-[#172033]">
                Applicants
              </h2>
              <p className="mt-[1px] truncate text-[14px] font-semibold leading-[19px] text-[#4f46e5]">
                {jobTitle}
              </p>
            </div>
            <button
              type="button"
              onClick={viewJob}
              className="flex h-[35px] shrink-0 items-center gap-[6px] rounded-[8px] border border-[#dce3ed] px-[12px] text-[12px] font-semibold text-[#475569]"
            >
              <ExternalLink size={14} />
              View Job
            </button>
          </div>
          <div className="mt-[9px] flex min-h-[35px] flex-wrap items-center gap-y-2 rounded-[8px] border border-[#dce3ed] bg-[#f8fafc] px-[11px] py-2">
            <span className="flex items-center gap-[6px] pr-3 text-[12px] font-semibold text-[#4f46e5]">
              <Users size={14} />
              {appliedCount} Applications
            </span>
            <span className="flex items-center gap-[6px] text-[12px] text-[#64748b]">
              <MapPin size={14} />
              {location}
            </span>
          </div>
          <button
            type="button"
            onClick={() => loadApplicants(true)}
            disabled={refreshing}
            className="mt-3 flex h-[35px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#dce3ed] text-[12px] font-semibold text-[#475569]"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh applicants
          </button>
        </div>

        <section className="mt-[20px] grid grid-cols-2 gap-[10px] lg:mt-[22px] lg:grid-cols-4 lg:gap-[16px]">
          {[
            {
              label: "Total Applicants",
              value: stats.total,
              color: "text-[#64748b]",
              bg: "bg-[#f1f5f9]",
              icon: <Users size={21} />,
            },
            {
              label: "New",
              value: stats.submitted,
              color: "text-[#4f46e5]",
              bg: "bg-[#eef2ff]",
              icon: <UserRoundPlus size={21} />,
            },
            {
              label: "Under Review",
              value: stats.underReview,
              color: "text-[#b45309]",
              bg: "bg-[#fff3cf]",
              icon: <ClipboardCheck size={21} />,
            },
            {
              label: "Shortlisted",
              value: stats.shortlisted,
              color: "text-[#16a34a]",
              bg: "bg-[#dcfce7]",
              icon: <Star size={21} />,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[12px] border border-[#dce3ed] bg-white px-[17px] py-[17px] shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <div className="flex items-center gap-[14px]">
                <div
                  className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] ${item.bg} ${item.color}`}
                >
                  {item.icon}
                </div>
                <div>
                  <p
                    className={`text-[12px] leading-[17px] lg:text-[13px] ${item.color}`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`mt-[1px] text-[27px] font-bold leading-[31px] ${item.color}`}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-[21px] rounded-[11px] border border-[#ddd6fe] bg-[#f7f4ff] px-[15px] py-[13px] lg:mt-[22px] lg:px-[18px]">
          <div className="flex flex-col gap-[12px] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-[#ede9fe]">
                <Sparkles size={19} className="text-[#7c3aed]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-[18px] text-[#7c3aed] lg:text-[15px]">
                  AI Screening Active
                </p>
                <p className="mt-[1px] text-[12px] leading-[17px] text-[#64748b]">
                  Candidates are ranked using resume skills, education,
                  experience and job requirements.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              <div className="flex h-[30px] flex-1 items-center justify-center gap-[7px] rounded-[7px] border border-[#ddd6fe] bg-white px-[11px] text-[12px] font-semibold text-[#172033] lg:flex-none lg:px-[15px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#7c3aed]" />
                {stats.analyzed} Resumes Analyzed
              </div>
              <div className="flex h-[30px] flex-1 items-center justify-center gap-[7px] rounded-[7px] border border-[#86efac] bg-white px-[11px] text-[12px] font-semibold text-[#172033] lg:flex-none lg:px-[15px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#16a34a]" />
                {stats.strongMatches} Strong Matches
              </div>
            </div>
          </div>
        </section>

        <section className="mt-[21px] rounded-[11px] border border-[#dce3ed] bg-white p-[13px] lg:mt-[22px] lg:px-[19px] lg:py-[13px]">
          <div className="flex flex-col gap-[9px] lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-[240px]">
              <Search
                size={17}
                className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search candidates..."
                className="h-[40px] w-full rounded-[8px] border border-[#d9e1eb] bg-[#f8fafc] pl-[38px] pr-[12px] text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
              />
            </div>
            <div className="relative w-full lg:w-[145px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#d9e1eb] bg-[#f8fafc] px-[12px] pr-[32px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1]"
              >
                <option>All Status</option>
                <option>New</option>
                <option>Under Review</option>
                <option>Shortlisted</option>
                <option>Rejected</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </div>
            <div className="relative w-full lg:w-[150px]">
              <select
                value={matchFilter}
                onChange={(e) => {
                  setMatchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#d9e1eb] bg-[#f8fafc] px-[12px] pr-[32px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1]"
              >
                <option>AI Match</option>
                <option>Strong Matches</option>
                <option>Medium Matches</option>
                <option>Low Matches</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </div>
            <div className="relative w-full lg:ml-auto lg:w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#d9e1eb] bg-[#f8fafc] px-[12px] pl-[12px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1] lg:pl-[35px]"
              >
                <option>AI Match: High to Low</option>
                <option>AI Match: Low to High</option>
                <option>Newest</option>
              </select>
              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-[12px] top-1/2 hidden -translate-y-1/2 text-[#64748b] lg:block"
              />
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </div>
          </div>
        </section>

        <div className="mt-[16px] flex items-center justify-between lg:hidden">
          <h2 className="text-[16px] font-bold text-[#172033]">
            All Applicants
          </h2>
          <span className="text-[12px] text-[#64748b]">
            {filteredApplicants.length} of {stats.total} shown
          </span>
        </div>
        <section className="mt-[21px] overflow-hidden rounded-[12px] border border-[#dce3ed] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)] lg:mt-[22px]">
          <div className="hidden items-center justify-between px-[19px] py-[15px] lg:flex">
            <div>
              <h2 className="text-[16px] font-bold leading-[20px] text-[#172033]">
                All Applicants
              </h2>
              <p className="mt-[2px] text-[12px] leading-[17px] text-[#64748b]">
                Candidates applying for {jobTitle}.
              </p>
            </div>
            <span className="rounded-full bg-[#eef2ff] px-[12px] py-[5px] text-[11px] font-semibold text-[#4f46e5]">
              {stats.total} Total
            </span>
          </div>
          <div className="hidden grid-cols-[2.1fr_1fr_1fr_0.95fr_1fr_0.9fr_0.7fr] border-y border-[#dce3ed] bg-[#f8fafc] px-[19px] py-[11px] text-[11px] font-semibold text-[#64748b] lg:grid">
            <div>Candidate</div>
            <div>Experience</div>
            <div>AI Match</div>
            <div>Assessment</div>
            <div>Status</div>
            <div>Applied</div>
            <div>Action</div>
          </div>

          {loading ? (
            <div className="px-5 py-16 text-center text-[13px] text-[#64748b]">
              <RefreshCw
                size={20}
                className="mx-auto mb-3 animate-spin text-[#4f46e5]"
              />
              Loading applicants…
            </div>
          ) : error ? (
            <div className="px-5 py-14 text-center">
              <p className="text-[14px] font-semibold text-[#b91c1c]">
                {error}
              </p>
              <button
                onClick={() => loadApplicants()}
                className="mt-3 rounded-[8px] bg-[#4f46e5] px-4 py-2 text-[12px] font-semibold text-white"
              >
                Try again
              </button>
            </div>
          ) : paginatedApplicants.length ? (
            paginatedApplicants.map((candidate) => {
              const match = getMatchClasses(candidate.aiMatch);
              const assessment = getAssessmentClasses(candidate);
              return (
                <article
                  key={candidate.id}
                  className="border-b border-[#dce3ed] px-[15px] py-[14px] last:border-b-0 lg:grid lg:grid-cols-[2.1fr_1fr_1fr_0.95fr_1fr_0.9fr_0.7fr] lg:items-center lg:px-[19px] lg:py-[14px]"
                >
                  <div className="flex min-w-0 items-center gap-[11px]">
                    <div
                      className={`flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${candidate.avatarColor || "bg-[#4f46e5]"}`}
                    >
                      {initials(candidate.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[14px] font-semibold leading-[19px] text-[#172033]">
                        {candidate.name}
                      </h3>
                      <p className="mt-[1px] flex items-center gap-[5px] text-[11px] leading-[16px] text-[#64748b]">
                        <BriefcaseBusiness size={12} />
                        {candidate.experience}
                        <span className="lg:hidden">Experience</span>
                      </p>
                      <p className="mt-[1px] hidden truncate text-[12px] text-[#64748b] lg:block">
                        {candidate.email || jobTitle}
                      </p>
                    </div>
                    <span
                      className={`ml-auto rounded-full px-[10px] py-[4px] text-[11px] font-semibold lg:hidden ${getStatusClasses(candidate.status)}`}
                    >
                      {displayStatus(candidate.status)}
                    </span>
                  </div>
                  <div className="hidden items-center gap-[6px] text-[13px] text-[#475569] lg:flex">
                    <BriefcaseBusiness size={14} className="text-[#64748b]" />
                    {candidate.experience}
                  </div>
                  <div className="hidden lg:flex">
                    <span
                      className={`inline-flex items-center gap-[6px] rounded-full px-[10px] py-[5px] text-[12px] font-semibold ${match.bg} ${match.text}`}
                    >
                      <span
                        className={`h-[7px] w-[7px] rounded-full ${match.dot}`}
                      />
                      {candidate.aiMatch}%
                    </span>
                    <Sparkles size={14} className={`ml-[7px] ${match.text}`} />
                  </div>
                  <div
                    className={`hidden text-[13px] font-semibold lg:block ${assessment.text}`}
                  >
                    {candidate.assessment !== null &&
                    candidate.assessment !== undefined
                      ? `${candidate.assessment}%`
                      : "Pending"}
                  </div>
                  <div className="hidden lg:block">
                    <div className="hidden lg:block">
                      <span
                        className={`inline-flex rounded-full px-[11px] py-[5px] text-[11px] font-semibold ${getStatusClasses(
                          candidate.status,
                        )}`}
                      >
                        {candidate.status}
                      </span>
                    </div>
                  </div>
                  <div className="hidden text-[12px] text-[#64748b] lg:block">
                    {formatDate(candidate.appliedAt)}
                  </div>
                  <div className="hidden lg:block">
                    <button
                      type="button"
                      onClick={() => viewCandidate(candidate)}
                      className="flex h-[28px] items-center justify-center rounded-[7px] bg-[#eef2ff] px-[14px] text-[11px] font-semibold text-[#4f46e5] transition hover:bg-[#e0e7ff]"
                    >
                      View
                    </button>
                  </div>
                  <div className="mt-[10px] lg:hidden">
                    <div className="flex overflow-hidden rounded-[9px] border border-[#dce3ed] bg-white">
                      <div className="flex min-w-0 flex-1 items-center gap-[7px] px-[10px] py-[7px]">
                        <div
                          className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] ${match.iconBg}`}
                        >
                          <Sparkles size={14} className={match.text} />
                        </div>
                        <div>
                          <p
                            className={`text-[14px] font-bold leading-[16px] ${match.text}`}
                          >
                            {candidate.aiMatch}%
                          </p>
                          <p className="text-[9px] leading-[13px] text-[#64748b]">
                            AI Match
                          </p>
                        </div>
                      </div>
                      <div className="my-[7px] w-px bg-[#dce3ed]" />
                      <div className="flex min-w-0 flex-1 items-center gap-[7px] px-[10px] py-[7px]">
                        <div
                          className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] ${assessment.bg}`}
                        >
                          <ClipboardCheck
                            size={14}
                            className={assessment.text}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-[14px] font-bold leading-[16px] ${assessment.text}`}
                          >
                            {candidate.assessment ?? "Pending"}
                            {candidate.assessment !== null &&
                            candidate.assessment !== undefined
                              ? "%"
                              : ""}
                          </p>
                          <p className="text-[9px] leading-[13px] text-[#64748b]">
                            Assessment
                          </p>
                        </div>
                      </div>
                      <div className="my-[7px] w-px bg-[#dce3ed]" />
                      <div className="flex min-w-0 flex-1 items-center gap-[7px] px-[10px] py-[7px]">
                        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#f1f5f9]">
                          <CalendarDays size={14} className="text-[#64748b]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold leading-[16px] text-[#475569]">
                            {formatDate(candidate.appliedAt, true)}
                          </p>
                          <p className="text-[9px] leading-[13px] text-[#64748b]">
                            Applied
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-[10px] grid grid-cols-[1fr_auto] gap-2">
                      <div className="hidden lg:block">
                        <span
                          className={`inline-flex rounded-full px-[11px] py-[5px] text-[11px] font-semibold ${getStatusClasses(
                            candidate.status,
                          )}`}
                        >
                          {candidate.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => viewCandidate(candidate)}
                        className="flex h-[38px] items-center justify-center gap-[7px] rounded-[8px] bg-[#eef2ff] px-4 text-[13px] font-semibold text-[#4f46e5]"
                      >
                        <Eye size={15} />
                        View Candidate
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
                <Search size={21} className="text-[#4f46e5]" />
              </div>
              <h3 className="mt-3 text-[15px] font-semibold text-[#172033]">
                No applicants found
              </h3>
              <p className="mt-1 text-[12px] text-[#64748b]">
                Try changing your search or filters.
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="flex flex-col gap-3 border-t border-[#dce3ed] px-[15px] py-[12px] sm:flex-row sm:items-center sm:justify-between lg:px-[19px]">
              <p className="text-[12px] text-[#64748b]">
                Showing{" "}
                {filteredApplicants.length
                  ? (currentPage - 1) * PAGE_SIZE + 1
                  : 0}
                –{Math.min(currentPage * PAGE_SIZE, filteredApplicants.length)}{" "}
                of {filteredApplicants.length} applicants
              </p>
              <div className="flex items-center justify-end gap-[5px]">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-[30px] w-[38px] items-center justify-center rounded-[7px] border border-[#dce3ed] bg-white text-[#64748b] disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="px-2 text-[12px] text-[#64748b]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="flex h-[30px] w-[38px] items-center justify-center rounded-[7px] border border-[#dce3ed] bg-white text-[#64748b] disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
