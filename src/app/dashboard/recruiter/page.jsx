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
  CalendarDays,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function RecruiterDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllApplications, setShowAllApplications] = useState(false);
  const [showToast, setShowToast] = useState("");

  const router = useRouter();

  const [jobs, setJobs] = useState([
    {
      title: "Full Stack Developer",
      applications: 42,
      match: "89% Avg Match",
      status: "Active",
    },
    {
      title: "Frontend Developer",
      applications: 31,
      match: "84% Avg Match",
      status: "Active",
    },
    {
      title: "Node.js Developer",
      applications: 24,
      match: "AI Screening Active",
      status: "Active",
    },
  ]);

  const applications = [
    {
      id: 1,
      initials: "RS",
      name: "Rahul Sharma",
      role: "Full Stack Developer",
      appliedFor: "Full Stack Dev",
      match: 89,
      assessment: "84%",
      status: "Shortlisted",
      applied: "14 Aug 2026",
      mobileDate: "14 Aug",
      avatarClass: "bg-[#EEF1FF] text-[#5146E5]",
    },
    {
      id: 2,
      initials: "PP",
      name: "Priya Patel",
      role: "Frontend Developer",
      appliedFor: "Frontend Dev",
      match: 86,
      assessment: "Pending",
      status: "Under Review",
      applied: "13 Aug 2026",
      mobileDate: "13 Aug",
      avatarClass: "bg-[#F0E9FF] text-[#7C3AED]",
    },
    {
      id: 3,
      initials: "AV",
      name: "Amit Verma",
      role: "Node.js Developer",
      appliedFor: "Node.js Dev",
      match: 81,
      assessment: "78%",
      status: "Under Review",
      applied: "13 Aug 2026",
      mobileDate: "13 Aug",
      avatarClass: "bg-[#DCFCE7] text-[#16A34A]",
    },
    {
      id: 4,
      initials: "SS",
      name: "Sneha Shah",
      role: "React Developer",
      appliedFor: "React Developer",
      match: 76,
      assessment: "72%",
      status: "New",
      applied: "12 Aug 2026",
      mobileDate: "12 Aug",
      avatarClass: "bg-[#FFF3C4] text-[#F59E0B]",
    },
  ];

  const screeningStats = [
    {
      value: "126",
      label: "Analyzed",
      type: "analyzed",
      dot: "bg-[#7C3AED]",
      valueColor: "text-[#172033]",
    },
    {
      value: "32",
      label: "Strong Matches",
      type: "strong",
      dot: "bg-[#16A34A]",
      valueColor: "text-[#16A34A]",
    },
    {
      value: "18",
      label: "Medium Matches",
      type: "medium",
      dot: "bg-[#5146E5]",
      valueColor: "text-[#5146E5]",
    },
    {
      value: "76",
      label: "Low Matches",
      type: "low",
      dot: "bg-[#F59E0B]",
      valueColor: "text-[#C86A00]",
    },
  ];

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter((candidate) =>
      [candidate.name, candidate.role, candidate.appliedFor, candidate.status]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  const notify = (message) => {
    setShowToast(message);

    window.clearTimeout(window.__resumeAiRecruiterToast);

    window.__resumeAiRecruiterToast = window.setTimeout(() => {
      setShowToast("");
    }, 2200);
  };

  const handleViewProfile = (name) => {
    notify(`Opening ${name}'s profile`);
  };

  const handleViewApplications = (title) => {
    notify(`Opening applications for ${title}`);
  };

  const handleRankings = () => {
    notify("AI rankings opened");
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-[#172033]">
      {/* Toast */}
      {showToast && (
        <div className="fixed left-1/2 top-4 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-[9px] bg-[#172033] px-4 py-2.5 text-[12px] font-semibold text-white shadow-xl">
          <CheckCircle2 size={15} className="text-[#4ADE80]" />
          {showToast}
        </div>
      )}

      {/* Main container */}
      <div className="mx-auto w-full px-4 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
        {/* Dashboard Intro */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold leading-[1.2] tracking-[-0.35px] text-[#172033] sm:text-[27px] lg:text-[28px]">
              Good morning, Anita 👋
            </h1>

            <p className="mt-1 text-[12px] leading-[1.45] text-[#52627B] sm:text-[13px] lg:text-[14px]">
              Here's an overview of your recruitment activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard/recruiter/jobs/create")}
            className="flex h-[40px] w-full shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#5146E5] px-5 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(79,70,229,0.20)] transition hover:bg-[#453BCF] active:scale-[0.98] sm:w-auto sm:min-w-[145px] sm:text-[13px]"
          >
            <Plus size={16} strokeWidth={2.1} />
            Post New Job
          </button>
        </section>

        {/* Search */}
        <section className="mt-4 sm:hidden">
          <div className="flex h-[40px] items-center gap-2 rounded-[8px] border border-[#DCE4EE] bg-white px-3">
            <Search size={15} className="shrink-0 text-[#8FA0B8]" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search candidates..."
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

        {/* Summary cards */}
        <section className="mt-5 grid grid-cols-2 gap-3 lg:mt-6 lg:grid-cols-4 lg:gap-4">
          {/* Active Jobs */}
          <div className="flex min-h-[112px] flex-col justify-between rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:min-h-[116px] sm:p-4 lg:min-h-[90px] lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EEF1FF] text-[#5146E5] sm:h-10 sm:w-10">
              <BriefcaseBusiness size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-medium text-[#71839E] sm:text-[11px]">
                Active Jobs
              </p>

              <p className="mt-1 text-[24px] font-bold leading-none tracking-[-0.5px] text-[#172033] sm:text-[26px]">
                8
              </p>
            </div>
          </div>

          {/* Applications */}
          <div className="flex min-h-[112px] flex-col justify-between rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_2px_6px_rgba(15,23,42,0.03)] sm:min-h-[116px] sm:p-4 lg:min-h-[90px] lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#EEF1FF] text-[#5146E5] sm:h-10 sm:w-10">
              <FileText size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-medium text-[#71839E] sm:text-[11px]">
                Total Applications
              </p>

              <p className="mt-1 text-[24px] font-bold leading-none tracking-[-0.5px] text-[#172033] sm:text-[26px]">
                126
              </p>
            </div>
          </div>

          {/* To Review */}
          <div className="flex min-h-[112px] flex-col justify-between rounded-[11px] border border-[#F59E0B] bg-[#FFF3C7] p-3.5 shadow-[0_2px_6px_rgba(245,158,11,0.05)] sm:min-h-[116px] sm:p-4 lg:min-h-[90px] lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#FFF9E9] text-[#F59E0B] sm:h-10 sm:w-10">
              <Clock3 size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-medium text-[#A85A00] sm:text-[11px]">
                To Review
              </p>

              <p className="mt-1 text-[24px] font-bold leading-none tracking-[-0.5px] text-[#F59E0B] sm:text-[26px]">
                32
              </p>
            </div>
          </div>

          {/* Shortlisted */}
          <div className="flex min-h-[112px] flex-col justify-between rounded-[11px] border border-[#22C55E] bg-[#DDFBE8] p-3.5 shadow-[0_2px_6px_rgba(34,197,94,0.05)] sm:min-h-[116px] sm:p-4 lg:min-h-[90px] lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#ECFFF2] text-[#16A34A] sm:h-10 sm:w-10">
              <UserRound size={18} strokeWidth={1.7} />
            </div>

            <div>
              <p className="text-[10px] font-medium text-[#187343] sm:text-[11px]">
                Shortlisted
              </p>

              <p className="mt-1 text-[24px] font-bold leading-none tracking-[-0.5px] text-[#16A34A] sm:text-[26px]">
                14
              </p>
            </div>
          </div>
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
            {screeningStats.map((stat) => (
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
                    {stat.value}
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
                onClick={() => setShowAllApplications((current) => !current)}
                className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#5146E5] sm:text-[11px]"
              >
                {showAllApplications ? "Show less" : "View all"}
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
                  className="min-w-0 flex-1 bg-transparent text-[10px] text-[#172033] outline-none placeholder:text-[#9AA8BC]"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[#8FA0B8]"
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

            {/* Applications */}
            <div>
              {(showAllApplications
                ? filteredApplications
                : filteredApplications.slice(0, 4)
              ).map((candidate) => (
                <div
                  key={candidate.id}
                  className="grid grid-cols-12 gap-x-2 gap-y-2 border-b border-[#E5EAF1] px-3.5 py-3.5 last:border-b-0 sm:items-center sm:gap-0 sm:px-5 sm:py-3"
                >
                  {/* Candidate */}
                  <div className="col-span-8 flex min-w-0 items-center gap-2.5 sm:col-span-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${candidate.avatarClass}`}
                    >
                      {candidate.initials}
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
                      className={`inline-flex h-[24px] items-center rounded-full px-2.5 text-[8px] font-semibold ${
                        candidate.status === "Shortlisted"
                          ? "bg-[#D9FBE8] text-[#0B9A4A]"
                          : candidate.status === "Under Review"
                            ? "bg-[#FFF0C2] text-[#A85A00]"
                            : "bg-[#EEF1FF] text-[#5146E5]"
                      }`}
                    >
                      <span
                        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                          candidate.status === "Shortlisted"
                            ? "bg-[#16A34A]"
                            : candidate.status === "Under Review"
                              ? "bg-[#F59E0B]"
                              : "bg-[#5146E5]"
                        }`}
                      />
                      {candidate.status}
                    </span>
                  </div>

                  {/* Applied For */}
                  <div className="col-span-12 sm:col-span-2">
                    <p className="text-[8px] text-[#8FA0B8] sm:hidden">
                      Applied For
                    </p>

                    <p className="mt-0.5 truncate text-[10px] font-medium text-[#52627B] sm:mt-0 sm:text-[10px]">
                      {candidate.appliedFor}
                    </p>
                  </div>

                  {/* AI Match */}
                  <div className="col-span-4 rounded-[7px] bg-[#F7F9FF] px-2.5 py-2 sm:col-span-1 sm:bg-transparent sm:px-0 sm:py-0">
                    <p className="text-[8px] text-[#8FA0B8] sm:hidden">
                      AI Match
                    </p>

                    <p
                      className={`mt-0.5 text-[12px] font-bold sm:mt-0 sm:text-[10px] ${
                        candidate.match >= 85
                          ? "text-[#16A34A]"
                          : candidate.match >= 80
                            ? "text-[#5146E5]"
                            : "text-[#F59E0B]"
                      }`}
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
                          : candidate.assessment === "78%"
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
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[8px] font-semibold ${
                        candidate.status === "Shortlisted"
                          ? "bg-[#D9FBE8] text-[#0B9A4A]"
                          : candidate.status === "Under Review"
                            ? "bg-[#FFF0C2] text-[#A85A00]"
                            : "bg-[#EEF1FF] text-[#5146E5]"
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </div>

                  {/* Applied */}
                  <div className="col-span-4 rounded-[7px] bg-[#F7F9FF] px-2.5 py-2 sm:col-span-1 sm:bg-transparent sm:px-0 sm:py-0">
                    <p className="text-[8px] text-[#8FA0B8] sm:hidden">
                      Applied
                    </p>

                    <p className="mt-0.5 text-[9px] font-medium text-[#52627B] sm:mt-0 sm:text-[9px]">
                      <span className="sm:hidden">{candidate.mobileDate}</span>
                      <span className="hidden sm:inline">
                        {candidate.applied}
                      </span>
                    </p>
                  </div>

                  {/* Action */}
                  <div className="col-span-12 mt-1 sm:col-span-2 sm:mt-0 sm:text-right">
                    <button
                      type="button"
                      onClick={() => handleViewProfile(candidate.name)}
                      className="flex h-[31px] w-full items-center justify-center gap-1.5 rounded-[7px] bg-[#EEF1FF] text-[9px] font-bold text-[#5146E5] transition hover:bg-[#E3E7FF] sm:ml-auto sm:h-[27px] sm:w-[58px] sm:text-[9px]"
                    >
                      <Eye size={12} strokeWidth={1.8} />
                      <span className="sm:hidden">View Profile</span>
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="px-5 py-10 text-center">
                <UsersRound
                  size={26}
                  className="mx-auto text-[#B4C0D0]"
                  strokeWidth={1.5}
                />

                <p className="mt-2 text-[11px] font-semibold text-[#52627B]">
                  No candidates found
                </p>

                <p className="mt-1 text-[9px] text-[#8FA0B8]">
                  Try another search term.
                </p>
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
                {jobs.length} Active
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {jobs.map((job, index) => (
                <div
                  key={`${job.title}-${index}`}
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
                    onClick={() => handleViewApplications(job.title)}
                    className="mt-2.5 flex h-[32px] w-full items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[9px] font-bold text-[#5146E5] transition hover:bg-[#E3E7FF] sm:text-[10px]"
                  >
                    View Applications
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
