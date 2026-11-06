"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Archive,
  Pencil,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyJobsPage() {
  const router = useRouter();

  const jobs = [
    {
      id: 1,
      title: "Full Stack Developer",
      email: "mumbai.careers@resumeai.com",
      department: "Engineering",
      location: "Mumbai, MH",
      mobileLocation: "Mumbai, MH",
      applications: 42,
      aiMatch: 89,
      status: "Active",
      created: "12 Aug 2026",
      mobileCreated: "12 Aug 2026",
    },
    {
      id: 2,
      title: "Frontend Developer",
      email: "mumbai.careers@resumeai.com",
      department: "Engineering",
      location: "Mumbai / Remote",
      mobileLocation: "Mumbai / Remote",
      applications: 31,
      aiMatch: 84,
      status: "Active",
      created: "08 Aug 2026",
      mobileCreated: "08 Aug 2026",
    },
    {
      id: 3,
      title: "Node.js Developer",
      email: "mumbai.careers@resumeai.com",
      department: "Engineering",
      location: "Mumbai, MH",
      mobileLocation: "Mumbai, MH",
      applications: 24,
      aiMatch: 81,
      status: "Active",
      created: "05 Aug 2026",
      mobileCreated: "05 Aug 2026",
    },
    {
      id: 4,
      title: "React Developer Intern",
      email: "mumbai.careers@resumeai.com",
      department: "Engineering",
      location: "Remote",
      mobileLocation: "Remote",
      applications: 18,
      aiMatch: 76,
      status: "Closed",
      created: "25 Jul 2026",
      mobileCreated: "25 Jul 2026",
    },
    {
      id: 5,
      title: "Backend Developer",
      email: "mumbai.careers@resumeai.com",
      department: "Technology",
      location: "Navi Mumbai",
      mobileLocation: "Navi Mumbai",
      applications: 11,
      aiMatch: 79,
      status: "Draft",
      created: "20 Jul 2026",
      mobileCreated: "20 Jul 2026",
    },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    window.clearTimeout(window.__resumeAiToastTimer);

    window.__resumeAiToastTimer = window.setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.department.toLowerCase().includes(query) ||
          job.location.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter((job) => job.status === statusFilter);
    }

    if (sortBy === "Newest First") {
      result.sort((a, b) => b.id - a.id);
    }

    if (sortBy === "Oldest First") {
      result.sort((a, b) => a.id - b.id);
    }

    if (sortBy === "Applications") {
      result.sort((a, b) => b.applications - a.applications);
    }

    if (sortBy === "AI Match") {
      result.sort((a, b) => b.aiMatch - a.aiMatch);
    }

    return result;
  }, [search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / 5));

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * 5,
    currentPage * 5,
  );

  const handleSearch = (value) => {
    setSearch(value);
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

  const handleCreateJob = () => {
    router.push("/dashboard/recruiter/jobs/create");
  };

  const handleView = (job) => {
    router.push(`/dashboard/recruiter/jobs/${job.id}/applicants`);
  };

  const handleEdit = (job) => {
    router.push(`/dashboard/recruiter/jobs/${job.id}/edit`);
  };

  const getMatchClass = (match) => {
    if (match >= 84) {
      return {
        text: "text-[#16a34a]",
        dot: "bg-[#16a34a]",
      };
    }

    if (match >= 80) {
      return {
        text: "text-[#4f46e5]",
        dot: "bg-[#4f46e5]",
      };
    }

    return {
      text: "text-[#f59e0b]",
      dot: "bg-[#f59e0b]",
    };
  };

  const getStatusClass = (status) => {
    if (status === "Active") {
      return "bg-[#dcfce7] text-[#16a34a]";
    }

    if (status === "Closed") {
      return "bg-[#f1f5f9] text-[#64748b]";
    }

    return "bg-[#eef2ff] text-[#4f46e5]";
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
      className={`rounded-[12px] border border-[#dce3ed] bg-white px-[18px] py-[17px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] ${mobileOrder}`}
    >
      <div className="flex items-center gap-[14px]">
        <div
          className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-normal leading-[18px] text-[#64748b]">
            {title}
          </p>

          <p
            className={`mt-[1px] text-[27px] font-bold leading-[31px] ${valueClass}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {/* Toast */}
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-[10px] bg-[#172033] px-4 py-3 text-[13px] font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="mx-auto w-full px-[20px] pb-[32px] pt-[28px] lg:pt-[30px]">
        {/* Breadcrumb + Create Job */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="mb-[27px] flex items-center gap-[10px] text-[14px] font-normal">
              <span className="text-[#64748b]">Jobs</span>

              <ChevronRight
                size={15}
                strokeWidth={1.7}
                className="text-[#94a3b8]"
              />

              <span className="font-medium text-[#4f46e5]">My Jobs</span>
            </div>

            <h1 className="text-[27px] font-bold leading-[32px] tracking-[-0.5px] text-[#111827]">
              My Jobs
            </h1>

            <p className="mt-[3px] text-[14px] font-normal leading-[20px] text-[#475569]">
              Manage your job postings and review candidate applications.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateJob}
            className="mt-[62px] hidden h-[43px] shrink-0 items-center justify-center gap-[8px] rounded-[9px] bg-[#4f46e5] px-[22px] text-[14px] font-semibold text-white shadow-[0_3px_7px_rgba(79,70,229,0.22)] transition hover:bg-[#4338ca] active:scale-[0.98] lg:flex"
          >
            <Plus size={17} strokeWidth={2} />
            <span>Create New Job</span>
          </button>
        </div>

        {/* Mobile page title card */}
        <div className="mt-[20px] flex items-center justify-between rounded-[11px] border border-[#dce3ed] bg-white px-[15px] py-[14px] shadow-[0_1px_2px_rgba(15,23,42,0.02)] lg:hidden">
          <div>
            <h1 className="text-[21px] font-bold leading-[26px] text-[#172033]">
              My Jobs
            </h1>

            <p className="mt-[2px] text-[13px] leading-[18px] text-[#475569]">
              Manage your job postings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateJob}
            className="flex h-[39px] items-center gap-[6px] rounded-[8px] bg-[#4f46e5] px-[14px] text-[13px] font-semibold text-white shadow-[0_3px_7px_rgba(79,70,229,0.2)]"
          >
            <Plus size={16} />
            <span>New Job</span>
          </button>
        </div>

        {/* Stats */}
        <section className="mt-[23px] grid grid-cols-2 gap-[10px] lg:grid-cols-4 lg:gap-[16px]">
          <StatCard
            mobileOrder="order-1"
            icon={
              <BriefcaseBusiness
                size={21}
                strokeWidth={1.8}
                className="text-[#64748b]"
              />
            }
            title="Total Jobs"
            value="12"
            iconClass="bg-[#f1f5f9]"
            valueClass="text-[#172033]"
          />

          <StatCard
            mobileOrder="order-3 lg:order-2"
            icon={
              <CheckCircle2
                size={21}
                strokeWidth={1.8}
                className="text-[#4f46e5]"
              />
            }
            title="Active Jobs"
            value="8"
            iconClass="bg-[#eef2ff]"
            valueClass="text-[#4f46e5]"
          />

          <StatCard
            mobileOrder="order-2 lg:order-3"
            icon={
              <Users size={21} strokeWidth={1.8} className="text-[#7c3aed]" />
            }
            title="Total Applications"
            value="126"
            iconClass="bg-[#f0eaff]"
            valueClass="text-[#7c3aed]"
          />

          <StatCard
            mobileOrder="order-4"
            icon={
              <Archive size={21} strokeWidth={1.8} className="text-[#64748b]" />
            }
            title="Closed Jobs"
            value="4"
            iconClass="bg-[#f1f5f9]"
            valueClass="text-[#64748b]"
          />
        </section>

        {/* Jobs container */}
        <section className="mt-[23px] overflow-hidden rounded-[12px] border border-[#dce3ed] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
          {/* Desktop / mobile filters */}
          <div className="border-b border-[#dce3ed] px-[19px] py-[14px] lg:px-[20px] lg:py-[15px]">
            <div className="flex flex-col gap-[12px] lg:flex-row lg:items-center lg:justify-between">
              {/* Heading */}
              <div className="hidden lg:block">
                <h2 className="text-[16px] font-bold leading-[20px] text-[#172033]">
                  All Jobs
                </h2>

                <p className="mt-[2px] text-[12px] leading-[17px] text-[#64748b]">
                  {filteredJobs.length === jobs.length
                    ? "5 jobs found"
                    : `${filteredJobs.length} jobs found`}
                </p>
              </div>

              {/* Filters */}
              <div className="flex w-full flex-col gap-[9px] lg:w-auto lg:flex-row lg:items-center">
                {/* Search */}
                <div className="relative w-full lg:w-[220px]">
                  <Search
                    size={17}
                    strokeWidth={1.7}
                    className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search jobs..."
                    className="h-[40px] w-full rounded-[9px] border border-[#d9e1eb] bg-[#f8fafc] pl-[37px] pr-[12px] text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
                  />
                </div>

                {/* Status */}
                <div className="relative w-full lg:w-[131px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="h-[40px] w-full appearance-none rounded-[9px] border border-[#d9e1eb] bg-[#f8fafc] px-[13px] pr-[34px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Closed</option>
                    <option>Draft</option>
                  </select>

                  <ChevronDown
                    size={15}
                    strokeWidth={1.6}
                    className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>

                {/* Sort */}
                <div className="relative w-full lg:w-[130px]">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="h-[40px] w-full appearance-none rounded-[9px] border border-[#d9e1eb] bg-[#f8fafc] px-[13px] pr-[34px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
                  >
                    <option>Newest First</option>
                    <option>Oldest First</option>
                    <option>Applications</option>
                    <option>AI Match</option>
                  </select>

                  <ChevronDown
                    size={15}
                    strokeWidth={1.6}
                    className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile heading */}
          <div className="flex items-center justify-between px-[1px] py-[14px] lg:hidden">
            <h2 className="text-[16px] font-bold leading-[20px] text-[#172033]">
              All Jobs
            </h2>

            <span className="pr-[1px] text-[12px] text-[#64748b]">
              {filteredJobs.length} of 12 jobs
            </span>
          </div>

          {/* Desktop column heading */}
          <div className="hidden grid-cols-[2.55fr_1.05fr_1.3fr_0.85fr_0.85fr_0.9fr_0.9fr_0.95fr] border-b border-[#dce3ed] bg-[#f8fafc] px-[19px] py-[11px] text-[11px] font-semibold text-[#64748b] lg:grid">
            <div>Job</div>
            <div>Department</div>
            <div>Location</div>
            <div>Applications</div>
            <div>AI Match</div>
            <div>Status</div>
            <div>Created</div>
            <div>Actions</div>
          </div>

          {/* Jobs */}
          <div>
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => {
                const matchClass = getMatchClass(job.aiMatch);

                return (
                  <article
                    key={job.id}
                    className={`border-b border-[#dce3ed] px-[19px] py-[14px] last:border-b-0 lg:grid lg:grid-cols-[2.55fr_1.05fr_1.3fr_0.85fr_0.85fr_0.9fr_0.9fr_0.95fr] lg:items-center lg:gap-0 lg:px-[19px] lg:py-[14px] ${
                      job.status === "Closed"
                        ? "bg-[#fffafa]"
                        : job.status === "Draft"
                          ? "bg-[#fffdf4]"
                          : "bg-white"
                    }`}
                  >
                    {/* Job */}
                    <div className="flex min-w-0 items-start gap-[11px]">
                      <div
                        className={`flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-[9px] ${
                          job.status === "Draft"
                            ? "bg-[#fff1c2]"
                            : job.status === "Closed"
                              ? "bg-[#f1f5f9]"
                              : "bg-[#eef2ff]"
                        }`}
                      >
                        <BriefcaseBusiness
                          size={19}
                          strokeWidth={1.7}
                          className={
                            job.status === "Draft"
                              ? "text-[#f59e0b]"
                              : job.status === "Closed"
                                ? "text-[#64748b]"
                                : "text-[#4f46e5]"
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-semibold leading-[19px] text-[#172033]">
                          {job.title}
                        </h3>

                        <p className="mt-[1px] truncate text-[11px] leading-[16px] text-[#94a3b8]">
                          {job.email}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Department */}
                    <div className="hidden text-[13px] text-[#475569] lg:block">
                      {job.department}
                    </div>

                    {/* Desktop Location */}
                    <div className="hidden text-[13px] text-[#475569] lg:block">
                      {job.location}
                    </div>

                    {/* Desktop Applications */}
                    <div className="hidden items-center gap-[6px] text-[13px] font-semibold text-[#172033] lg:flex">
                      <Users
                        size={15}
                        strokeWidth={1.7}
                        className="text-[#64748b]"
                      />
                      {job.applications}
                    </div>

                    {/* Desktop AI Match */}
                    <div
                      className={`hidden items-center gap-[6px] text-[13px] font-semibold lg:flex ${matchClass.text}`}
                    >
                      <span
                        className={`h-[7px] w-[7px] rounded-full ${matchClass.dot}`}
                      />
                      {job.aiMatch}%
                    </div>

                    {/* Desktop Status */}
                    <div className="hidden lg:block">
                      <span
                        className={`inline-flex rounded-full px-[11px] py-[4px] text-[11px] font-semibold ${getStatusClass(
                          job.status,
                        )}`}
                      >
                        {job.status}
                      </span>
                    </div>

                    {/* Desktop Created */}
                    <div className="hidden text-[12px] text-[#64748b] lg:block">
                      {job.created}
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden items-center gap-[8px] lg:flex">
                      {job.status !== "Draft" && (
                        <button
                          type="button"
                          onClick={() => handleView(job)}
                          className="flex h-[26px] items-center justify-center rounded-[7px] bg-[#eef2ff] px-[13px] text-[11px] font-semibold text-[#4f46e5] transition hover:bg-[#e0e7ff]"
                        >
                          View
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleEdit(job)}
                        className={`flex h-[26px] items-center justify-center rounded-[7px] px-[12px] text-[11px] font-semibold ${
                          job.status === "Draft"
                            ? "bg-[#eef2ff] text-[#4f46e5]"
                            : "bg-[#f1f5f9] text-[#475569]"
                        }`}
                      >
                        Edit
                      </button>
                    </div>

                    {/* Mobile details */}
                    <div className="mt-[12px] lg:hidden">
                      <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[7px] text-[12px] text-[#64748b]">
                        <span className="flex items-center gap-[5px]">
                          <MapPin
                            size={14}
                            strokeWidth={1.7}
                            className="text-[#64748b]"
                          />
                          {job.mobileLocation}
                        </span>

                        <span className="flex items-center gap-[5px]">
                          <CalendarDays
                            size={14}
                            strokeWidth={1.7}
                            className="text-[#64748b]"
                          />
                          {job.mobileCreated}
                        </span>
                      </div>

                      <div className="mt-[10px] flex items-stretch">
                        {/* Applications */}
                        <div className="flex min-w-0 flex-1 items-center gap-[7px] border-r border-[#dce3ed] pr-[12px]">
                          <div className="flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-[8px] bg-[#f1f5f9]">
                            <Users
                              size={15}
                              strokeWidth={1.7}
                              className="text-[#64748b]"
                            />
                          </div>

                          <div>
                            <p className="text-[14px] font-bold leading-[17px] text-[#172033]">
                              {job.applications}
                            </p>

                            <p className="text-[10px] leading-[14px] text-[#64748b]">
                              Applications
                            </p>
                          </div>
                        </div>

                        {/* AI Match */}
                        <div className="flex min-w-0 flex-1 items-center gap-[7px] border-r border-[#dce3ed] px-[12px]">
                          <div
                            className={`flex h-[33px] w-[33px] shrink-0 items-center justify-center rounded-[8px] ${
                              job.aiMatch >= 84
                                ? "bg-[#dcfce7]"
                                : job.aiMatch >= 80
                                  ? "bg-[#eef2ff]"
                                  : "bg-[#fff3cf]"
                            }`}
                          >
                            <Sparkles
                              size={15}
                              strokeWidth={1.7}
                              className={matchClass.text}
                            />
                          </div>

                          <div>
                            <p
                              className={`text-[14px] font-bold leading-[17px] ${matchClass.text}`}
                            >
                              {job.aiMatch}%
                            </p>

                            <p className="text-[10px] leading-[14px] text-[#64748b]">
                              AI Match
                            </p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex min-w-[82px] flex-1 flex-col items-end justify-center pl-[12px]">
                          <p
                            className={`text-[14px] font-bold leading-[17px] ${
                              job.status === "Active"
                                ? "text-[#16a34a]"
                                : job.status === "Closed"
                                  ? "text-[#64748b]"
                                  : "text-[#4f46e5]"
                            }`}
                          >
                            {job.status}
                          </p>

                          <p className="text-[10px] leading-[14px] text-[#64748b]">
                            Status
                          </p>
                        </div>
                      </div>

                      {/* Mobile buttons */}
                      <div className="mt-[11px] grid grid-cols-[1fr_80px] gap-[10px]">
                        <button
                          type="button"
                          onClick={() => handleView(job)}
                          disabled={job.status === "Draft"}
                          className={`flex h-[36px] items-center justify-center rounded-[8px] text-[13px] font-semibold ${
                            job.status === "Draft"
                              ? "bg-[#f1f5f9] text-[#94a3b8]"
                              : "bg-[#eef2ff] text-[#4f46e5]"
                          }`}
                        >
                          View Applications
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(job)}
                          className="flex h-[36px] items-center justify-center rounded-[8px] bg-[#f1f5f9] text-[13px] font-semibold text-[#475569]"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
                  <Search
                    size={21}
                    strokeWidth={1.7}
                    className="text-[#4f46e5]"
                  />
                </div>

                <h3 className="mt-3 text-[15px] font-semibold text-[#172033]">
                  No jobs found
                </h3>

                <p className="mt-1 text-[12px] text-[#64748b]">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#dce3ed] px-[19px] py-[12px]">
            <p className="text-[12px] text-[#64748b]">
              Showing {paginatedJobs.length} of {jobs.length} jobs
            </p>

            <div className="flex items-center gap-[5px]">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="flex h-[28px] w-[38px] items-center justify-center rounded-[7px] border border-[#dce3ed] bg-white text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={15} strokeWidth={1.7} />
              </button>

              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-[28px] w-[33px] items-center justify-center rounded-[7px] border text-[12px] font-medium ${
                    currentPage === page
                      ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                      : "border-[#dce3ed] bg-white text-[#475569]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="flex h-[28px] w-[38px] items-center justify-center rounded-[7px] border border-[#dce3ed] bg-white text-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={15} strokeWidth={1.7} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
