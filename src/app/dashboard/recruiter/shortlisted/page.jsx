"use client";

import { useMemo, useState } from "react";
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
  FileText,
  CheckCircle2,
} from "lucide-react";

const candidates = [
  {
    id: "rahul-sharma",
    name: "Rahul Sharma",
    initials: "RS",
    avatarClass: "bg-[#4f46e5]",
    job: "Full Stack Dev",
    experience: "2 Years",
    aiMatch: 89,
    skills: 94,
    assessment: 84,
    assessmentStatus: "completed",
    shortlistedDate: "14 Aug 2026",
    shortlistedDateValue: "2026-08-14",
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    initials: "PP",
    avatarClass: "bg-[#7c3aed]",
    job: "Frontend Dev",
    experience: "1.5 Years",
    aiMatch: 86,
    skills: 90,
    assessment: null,
    assessmentStatus: "pending",
    shortlistedDate: "13 Aug 2026",
    shortlistedDateValue: "2026-08-13",
  },
  {
    id: "amit-verma",
    name: "Amit Verma",
    initials: "AV",
    avatarClass: "bg-[#16a34a]",
    job: "Backend Dev",
    experience: "2 Years",
    aiMatch: 81,
    skills: 86,
    assessment: 78,
    assessmentStatus: "completed",
    shortlistedDate: "12 Aug 2026",
    shortlistedDateValue: "2026-08-12",
  },
  {
    id: "sneha-shah",
    name: "Sneha Shah",
    initials: "SS",
    avatarClass: "bg-[#f59e0b]",
    job: "Full Stack Dev",
    experience: "1 Year",
    aiMatch: 76,
    skills: 79,
    assessment: 72,
    assessmentStatus: "completed",
    shortlistedDate: "11 Aug 2026",
    shortlistedDateValue: "2026-08-11",
  },
  {
    id: "vikram-joshi",
    name: "Vikram Joshi",
    initials: "VJ",
    avatarClass: "bg-[#0f172a]",
    job: "Backend Dev",
    experience: "3 Years",
    aiMatch: 73,
    skills: 76,
    assessment: 68,
    assessmentStatus: "completed",
    shortlistedDate: "10 Aug 2026",
    shortlistedDateValue: "2026-08-10",
  },
  {
    id: "neha-desai",
    name: "Neha Desai",
    initials: "ND",
    avatarClass: "bg-[#ef4444]",
    job: "Frontend Dev",
    experience: "1 Year",
    aiMatch: 64,
    skills: 68,
    assessment: 61,
    assessmentStatus: "completed",
    shortlistedDate: "09 Aug 2026",
    shortlistedDateValue: "2026-08-09",
  },
  {
    id: "rohan-mehta",
    name: "Rohan Mehta",
    initials: "RM",
    avatarClass: "bg-[#0891b2]",
    job: "Full Stack Dev",
    experience: "2.5 Years",
    aiMatch: 72,
    skills: 75,
    assessment: 70,
    assessmentStatus: "completed",
    shortlistedDate: "08 Aug 2026",
    shortlistedDateValue: "2026-08-08",
  },
  {
    id: "ananya-kulkarni",
    name: "Ananya Kulkarni",
    initials: "AK",
    avatarClass: "bg-[#db2777]",
    job: "Frontend Dev",
    experience: "2 Years",
    aiMatch: 78,
    skills: 82,
    assessment: null,
    assessmentStatus: "pending",
    shortlistedDate: "07 Aug 2026",
    shortlistedDateValue: "2026-08-07",
  },
  {
    id: "karan-shah",
    name: "Karan Shah",
    initials: "KS",
    avatarClass: "bg-[#6366f1]",
    job: "Backend Dev",
    experience: "3 Years",
    aiMatch: 75,
    skills: 78,
    assessment: 74,
    assessmentStatus: "completed",
    shortlistedDate: "06 Aug 2026",
    shortlistedDateValue: "2026-08-06",
  },
  {
    id: "meera-nair",
    name: "Meera Nair",
    initials: "MN",
    avatarClass: "bg-[#059669]",
    job: "Full Stack Dev",
    experience: "2 Years",
    aiMatch: 82,
    skills: 88,
    assessment: 81,
    assessmentStatus: "completed",
    shortlistedDate: "05 Aug 2026",
    shortlistedDateValue: "2026-08-05",
  },
  {
    id: "aditya-singh",
    name: "Aditya Singh",
    initials: "AS",
    avatarClass: "bg-[#9333ea]",
    job: "Backend Dev",
    experience: "2 Years",
    aiMatch: 70,
    skills: 74,
    assessment: 69,
    assessmentStatus: "completed",
    shortlistedDate: "04 Aug 2026",
    shortlistedDateValue: "2026-08-04",
  },
  {
    id: "isha-gupta",
    name: "Isha Gupta",
    initials: "IG",
    avatarClass: "bg-[#ea580c]",
    job: "Frontend Dev",
    experience: "1.5 Years",
    aiMatch: 68,
    skills: 72,
    assessment: null,
    assessmentStatus: "pending",
    shortlistedDate: "03 Aug 2026",
    shortlistedDateValue: "2026-08-03",
  },
  {
    id: "arjun-kapoor",
    name: "Arjun Kapoor",
    initials: "AK",
    avatarClass: "bg-[#1d4ed8]",
    job: "Full Stack Dev",
    experience: "3 Years",
    aiMatch: 79,
    skills: 83,
    assessment: 77,
    assessmentStatus: "completed",
    shortlistedDate: "02 Aug 2026",
    shortlistedDateValue: "2026-08-02",
  },
  {
    id: "simran-kaur",
    name: "Simran Kaur",
    initials: "SK",
    avatarClass: "bg-[#be123c]",
    job: "Frontend Dev",
    experience: "2 Years",
    aiMatch: 74,
    skills: 80,
    assessment: 73,
    assessmentStatus: "completed",
    shortlistedDate: "01 Aug 2026",
    shortlistedDateValue: "2026-08-01",
  },
  {
    id: "rohit-jain",
    name: "Rohit Jain",
    initials: "RJ",
    avatarClass: "bg-[#334155]",
    job: "Backend Dev",
    experience: "3 Years",
    aiMatch: 71,
    skills: 77,
    assessment: 67,
    assessmentStatus: "completed",
    shortlistedDate: "31 Jul 2026",
    shortlistedDateValue: "2026-07-31",
  },
  {
    id: "kavya-reddy",
    name: "Kavya Reddy",
    initials: "KR",
    avatarClass: "bg-[#c026d3]",
    job: "Full Stack Dev",
    experience: "2 Years",
    aiMatch: 77,
    skills: 81,
    assessment: 76,
    assessmentStatus: "completed",
    shortlistedDate: "30 Jul 2026",
    shortlistedDateValue: "2026-07-30",
  },
  {
    id: "manish-yadav",
    name: "Manish Yadav",
    initials: "MY",
    avatarClass: "bg-[#15803d]",
    job: "Backend Dev",
    experience: "2.5 Years",
    aiMatch: 69,
    skills: 73,
    assessment: 65,
    assessmentStatus: "completed",
    shortlistedDate: "29 Jul 2026",
    shortlistedDateValue: "2026-07-29",
  },
  {
    id: "pooja-iyer",
    name: "Pooja Iyer",
    initials: "PI",
    avatarClass: "bg-[#4f46e5]",
    job: "Frontend Dev",
    experience: "1 Year",
    aiMatch: 67,
    skills: 70,
    assessment: null,
    assessmentStatus: "pending",
    shortlistedDate: "28 Jul 2026",
    shortlistedDateValue: "2026-07-28",
  },
];

export default function ShortlistedCandidatesPage() {
  const [jobFilter, setJobFilter] = useState("All Jobs");
  const [statusFilter, setStatusFilter] = useState("Shortlisted");
  const [sortBy, setSortBy] = useState("Recently Shortlisted");
  const [currentPage, setCurrentPage] = useState(1);

  const candidatesPerPage = 5;

  const filteredCandidates = useMemo(() => {
    let result = [...candidates];

    if (jobFilter !== "All Jobs") {
      result = result.filter((candidate) => candidate.job === jobFilter);
    }

    if (statusFilter === "Shortlisted") {
      result = result.filter(() => true);
    }

    if (sortBy === "Recently Shortlisted") {
      result.sort(
        (a, b) =>
          new Date(b.shortlistedDateValue) - new Date(a.shortlistedDateValue),
      );
    }

    if (sortBy === "Highest AI Match") {
      result.sort((a, b) => b.aiMatch - a.aiMatch);
    }

    if (sortBy === "Highest Skills Match") {
      result.sort((a, b) => b.skills - a.skills);
    }

    return result;
  }, [jobFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  const safePage = Math.min(currentPage, Math.max(totalPages, 1));

  const startIndex = (safePage - 1) * candidatesPerPage;

  const visibleCandidates = filteredCandidates.slice(
    startIndex,
    startIndex + candidatesPerPage,
  );

  const handleJobChange = (value) => {
    setJobFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const getAssessmentClasses = (candidate) => {
    if (candidate.assessmentStatus === "pending") {
      return "bg-[#fff2c7] text-[#f59e0b]";
    }

    if (candidate.assessment >= 80) {
      return "bg-[#dcfce7] text-[#16a34a]";
    }

    return "bg-[#eef2ff] text-[#4f46e5]";
  };

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
                18 Shortlisted
              </span>
            </div>

            <p className="mt-0.5 text-[14px] leading-5 text-[#64748b]">
              Review candidates shortlisted by your recruitment team.
            </p>
          </div>

          <Link
            href="/recruiter/candidates"
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
                18
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
                12
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
                6
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
                className="h-10 w-full appearance-none rounded-lg border border-[#dbe3ee] bg-white pl-9 pr-9 text-[13px] font-medium text-[#475569] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 sm:w-[120px]"
              >
                <option value="All Jobs">All Jobs</option>
                <option value="Full Stack Dev">Full Stack Dev</option>
                <option value="Frontend Dev">Frontend Dev</option>
                <option value="Backend Dev">Backend Dev</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#16a34a]" />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-[#dbe3ee] bg-white pl-7 pr-9 text-[13px] font-medium text-[#475569] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10 sm:w-[132px]"
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
              Shortlisted Candidates
            </h2>

            <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold text-[#4f46e5]">
              18 Total
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

          {/* Candidates */}
          <div>
            {visibleCandidates.map((candidate, index) => {
              const isFirstCandidate =
                startIndex + index === 0 && currentPage === 1;

              return (
                <article
                  key={candidate.id}
                  className={`relative border-b border-[#dbe3ee] px-3.5 py-4 last:border-b-0 sm:px-5 lg:px-5 lg:py-3.5 ${
                    isFirstCandidate ? "bg-[#eef2ff]/70" : "bg-white"
                  }`}
                >
                  {/* Desktop/table layout */}
                  <div className="hidden lg:grid lg:grid-cols-[2.1fr_1.7fr_.9fr_.8fr_.95fr_1.15fr_1.1fr_.75fr] lg:items-center lg:gap-4">
                    {/* Candidate */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white ${candidate.avatarClass}`}
                      >
                        {candidate.initials}
                      </div>

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
                    <div>
                      <span className="inline-flex rounded-full bg-[#eef2ff] px-2.5 py-1 text-[11px] font-medium text-[#4f46e5]">
                        {candidate.job}
                      </span>
                    </div>

                    {/* AI match */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          candidate.aiMatch >= 85
                            ? "bg-[#16a34a]"
                            : candidate.aiMatch >= 75
                              ? "bg-[#4f46e5]"
                              : "bg-[#f59e0b]"
                        }`}
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
                      {candidate.assessmentStatus === "pending" ? (
                        <span className="inline-flex rounded-full bg-[#fff2c7] px-2.5 py-1 text-[11px] font-semibold text-[#f59e0b]">
                          Pending
                        </span>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getAssessmentClasses(
                            candidate,
                          )}`}
                        >
                          {candidate.assessment}%
                        </span>
                      )}
                    </div>

                    {/* Shortlisted date */}
                    <div className="flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#64748b]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {candidate.shortlistedDate}
                    </div>

                    {/* Status */}
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                        Shortlisted
                      </span>
                    </div>

                    {/* Action */}
                    <div>
                      <Link
                        href={`/recruiter/candidates/${candidate.id}`}
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
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white ${candidate.avatarClass}`}
                        >
                          {candidate.initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold leading-5 text-[#111827]">
                            {candidate.name}
                          </p>

                          <div className="mt-0.5 flex items-center gap-1">
                            <span className="inline-flex rounded-full bg-[#eef2ff] px-2 py-0.5 text-[11px] font-medium text-[#4f46e5]">
                              {candidate.job}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#dcfce7] px-2.5 py-1 text-[11px] font-semibold text-[#16a34a]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                        Shortlisted
                      </span>
                    </div>

                    {/* Match metrics */}
                    <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-xl border border-[#dbe3ee] bg-[#f8fafc]">
                      <div className="border-r border-[#dbe3ee] px-2.5 py-2.5">
                        <p className="text-[11px] leading-4 text-[#64748b]">
                          AI Match
                        </p>

                        <p className="mt-0.5 flex items-center gap-1 text-[15px] font-semibold leading-5 text-[#111827]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              candidate.aiMatch >= 85
                                ? "bg-[#16a34a]"
                                : candidate.aiMatch >= 75
                                  ? "bg-[#4f46e5]"
                                  : "bg-[#f59e0b]"
                            }`}
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

                        {candidate.assessmentStatus === "pending" ? (
                          <span className="mt-0.5 inline-flex rounded-full bg-[#fff2c7] px-2 py-0.5 text-[12px] font-medium leading-4 text-[#f59e0b]">
                            Pending
                          </span>
                        ) : (
                          <span
                            className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium leading-4 ${getAssessmentClasses(
                              candidate,
                            )}`}
                          >
                            {candidate.assessment}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {candidate.shortlistedDate}
                      </div>

                      <Link
                        href={`/recruiter/candidates/${candidate.id}`}
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

            {visibleCandidates.length === 0 && (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2ff]">
                  <UserRound className="h-5 w-5 text-[#4f46e5]" />
                </div>

                <h3 className="mt-3 text-[15px] font-semibold text-[#111827]">
                  No shortlisted candidates found
                </h3>

                <p className="mt-1 max-w-sm text-[13px] text-[#64748b]">
                  Try changing the job or sorting filters.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-[12px] text-[#64748b] sm:text-left sm:text-[13px]">
            Showing{" "}
            <span className="font-medium text-[#475569]">
              {filteredCandidates.length === 0 ? 0 : startIndex + 1}–
              {Math.min(
                startIndex + candidatesPerPage,
                filteredCandidates.length,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[#475569]">
              {filteredCandidates.length}
            </span>{" "}
            shortlisted candidates
          </p>

          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[12px] font-medium text-[#475569] transition hover:border-[#4f46e5] hover:text-[#4f46e5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
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
              ),
            )}

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
      </div>
    </main>
  );
}
