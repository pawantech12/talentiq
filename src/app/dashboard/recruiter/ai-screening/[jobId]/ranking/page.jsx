"use client";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Info,
  Layers3,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function CandidateRankingPage() {
  const [sortBy, setSortBy] = useState("overall-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([
    "Rahul Sharma",
  ]);
  const [toast, setToast] = useState("");
  const router = useRouter();

  const candidatesPerPage = 6;

  const candidates = [
    {
      rank: 1,
      name: "Rahul Sharma",
      initials: "RS",
      role: "Full Stack Developer",
      experience: "2 Years",
      overall: 91,
      aiMatch: 89,
      skills: 94,
      experienceMatch: 85,
      assessment: 84,
      status: "Strong Match",
      recommended: true,
      color: "bg-[#5046e5]",
    },
    {
      rank: 2,
      name: "Priya Patel",
      initials: "PP",
      role: "Full Stack Developer",
      experience: "1.5 Years",
      overall: 87,
      aiMatch: 86,
      skills: 90,
      experienceMatch: 82,
      assessment: "Pending",
      status: "Strong Match",
      recommended: false,
      color: "bg-[#7c3aed]",
    },
    {
      rank: 3,
      name: "Amit Verma",
      initials: "AV",
      role: "Full Stack Developer",
      experience: "2 Years",
      overall: 83,
      aiMatch: 81,
      skills: 86,
      experienceMatch: 84,
      assessment: 78,
      status: "Good Match",
      recommended: false,
      color: "bg-[#16a34a]",
    },
    {
      rank: 4,
      name: "Sneha Shah",
      initials: "SS",
      role: "Full Stack Developer",
      experience: "1 Year",
      overall: 77,
      aiMatch: 76,
      skills: 79,
      experienceMatch: 72,
      assessment: 72,
      status: "Good Match",
      recommended: false,
      color: "bg-[#f59e0b]",
    },
    {
      rank: 5,
      name: "Vikram Joshi",
      initials: "VJ",
      role: "Full Stack Developer",
      experience: "3 Years",
      overall: 74,
      aiMatch: 73,
      skills: 76,
      experienceMatch: 85,
      assessment: 68,
      status: "Potential Match",
      recommended: false,
      color: "bg-[#172033]",
    },
    {
      rank: 6,
      name: "Neha Desai",
      initials: "ND",
      role: "Full Stack Developer",
      experience: "1 Year",
      overall: 65,
      aiMatch: 64,
      skills: 68,
      experienceMatch: 70,
      assessment: 61,
      status: "Moderate Match",
      recommended: false,
      color: "bg-[#ef4444]",
    },
    {
      rank: 7,
      name: "Arjun Mehta",
      initials: "AM",
      role: "Full Stack Developer",
      experience: "2.5 Years",
      overall: 63,
      aiMatch: 62,
      skills: 66,
      experienceMatch: 68,
      assessment: 59,
      status: "Moderate Match",
      recommended: false,
      color: "bg-[#0f766e]",
    },
    {
      rank: 8,
      name: "Karan Singh",
      initials: "KS",
      role: "Full Stack Developer",
      experience: "1.8 Years",
      overall: 61,
      aiMatch: 60,
      skills: 64,
      experienceMatch: 65,
      assessment: 57,
      status: "Potential Match",
      recommended: false,
      color: "bg-[#0891b2]",
    },
    {
      rank: 9,
      name: "Ananya Rao",
      initials: "AR",
      role: "Full Stack Developer",
      experience: "2 Years",
      overall: 59,
      aiMatch: 58,
      skills: 62,
      experienceMatch: 63,
      assessment: 55,
      status: "Potential Match",
      recommended: false,
      color: "bg-[#db2777]",
    },
    {
      rank: 10,
      name: "Rohan Kulkarni",
      initials: "RK",
      role: "Full Stack Developer",
      experience: "1 Year",
      overall: 56,
      aiMatch: 55,
      skills: 59,
      experienceMatch: 60,
      assessment: 51,
      status: "Moderate Match",
      recommended: false,
      color: "bg-[#9333ea]",
    },
    {
      rank: 11,
      name: "Meera Nair",
      initials: "MN",
      role: "Full Stack Developer",
      experience: "2 Years",
      overall: 54,
      aiMatch: 53,
      skills: 57,
      experienceMatch: 61,
      assessment: 48,
      status: "Moderate Match",
      recommended: false,
      color: "bg-[#475569]",
    },
    {
      rank: 12,
      name: "Aditya Shah",
      initials: "AS",
      role: "Full Stack Developer",
      experience: "1.5 Years",
      overall: 52,
      aiMatch: 51,
      skills: 54,
      experienceMatch: 58,
      assessment: 46,
      status: "Potential Match",
      recommended: false,
      color: "bg-[#0284c7]",
    },
  ];

  const showToast = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const sortedCandidates = useMemo(() => {
    const data = [...candidates];

    if (sortBy === "overall-desc") {
      return data.sort((a, b) => b.overall - a.overall);
    }

    if (sortBy === "overall-asc") {
      return data.sort((a, b) => a.overall - b.overall);
    }

    if (sortBy === "ai-desc") {
      return data.sort((a, b) => b.aiMatch - a.aiMatch);
    }

    if (sortBy === "skills-desc") {
      return data.sort((a, b) => b.skills - a.skills);
    }

    return data;
  }, [sortBy]);

  const totalPages = Math.ceil(sortedCandidates.length / candidatesPerPage);

  const startIndex = (currentPage - 1) * candidatesPerPage;

  const paginatedCandidates = sortedCandidates.slice(
    startIndex,
    startIndex + candidatesPerPage,
  );

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handleViewCandidate = (candidate) => {
    router.push(`/dashboard/recruiter/candidates/${candidate.id}`);
  };

  const handleShortlist = (candidate) => {
    setShortlistedCandidates((previous) => {
      if (previous.includes(candidate.name)) {
        return previous.filter((name) => name !== candidate.name);
      }

      return [...previous, candidate.name];
    });

    const isAlreadyShortlisted = shortlistedCandidates.includes(candidate.name);

    showToast(
      isAlreadyShortlisted
        ? `${candidate.name} removed from shortlist.`
        : `${candidate.name} shortlisted successfully.`,
    );
  };

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
      return "bg-[#fef3c7] text-[#f59e0b]";
    }

    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-[100] flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-lg">
          <Check className="h-5 w-5 shrink-0 text-[#4f46e5]" />
          <span>{toast}</span>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1170px] px-4 py-5 sm:px-6 lg:px-0 lg:py-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <div className="hidden items-center gap-2 text-xs text-[#71809a] lg:flex">
            <button
              type="button"
              onClick={() => showToast("Opening AI Screening...")}
              className="transition hover:text-[#4f46e5]"
            >
              AI Screening
            </button>

            <ChevronRight className="h-3.5 w-3.5" />

            <button
              type="button"
              onClick={() => showToast("Opening Full Stack Developer...")}
              className="transition hover:text-[#4f46e5]"
            >
              Full Stack Developer
            </button>

            <ChevronRight className="h-3.5 w-3.5" />

            <span className="font-semibold text-[#4f46e5]">
              Candidate Ranking
            </span>
          </div>

          <button
            type="button"
            onClick={() => showToast("Returning to AI Screening...")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4f46e5] transition hover:text-[#4338ca] lg:mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="lg:hidden">Back</span>
            <span className="hidden lg:inline">Back to AI Screening</span>
          </button>
        </div>

        {/* Page heading */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-[-0.02em] text-[#172033] sm:text-2xl lg:text-2xl">
              Candidate Ranking
            </h1>

            <p className="mt-1 text-sm text-[#71809a]">
              AI-ranked candidates for Full Stack Developer
              <span className="hidden lg:inline">
                {" "}
                based on skills, experience, education and assessment
                performance.
              </span>
              <span className="lg:hidden">.</span>
            </p>

            {/* Job tags */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[11px] font-medium text-[#4f46e5]">
                <BriefcaseBusiness className="h-3 w-3" />
                Full Stack Developer
              </span>

              <span className="hidden items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-medium text-[#52617a] sm:inline-flex">
                <Layers3 className="h-3 w-3" />
                Engineering
              </span>

              <span className="hidden items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-medium text-[#52617a] sm:inline-flex">
                <MapPin className="h-3 w-3" />
                Mumbai, Maharashtra
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-medium text-[#52617a]">
                <Users className="h-3 w-3" />
                42 Applicants
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast("Opening all applicants...")}
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
                  <span className="lg:hidden">
                    42 applicants analyzed and ranked.
                  </span>

                  <span className="hidden lg:inline">
                    ResumeAI analyzed 42 applicants and ranked candidates based
                    on their overall suitability for this job.
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 rounded-lg border border-[#d9d2ff] bg-white px-2 py-2 lg:min-w-[365px]">
              <div className="border-r border-[#e5e1ff] text-center">
                <p className="text-xl font-bold leading-6 text-[#5046e5] sm:text-2xl">
                  42
                </p>
                <p className="mt-0.5 text-[10px] text-[#71809a] sm:text-xs">
                  Analyzed
                </p>
              </div>

              <div className="border-r border-[#e5e1ff] text-center">
                <p className="text-xl font-bold leading-6 text-[#16a34a] sm:text-2xl">
                  18
                </p>
                <p className="mt-0.5 text-[10px] text-[#71809a] sm:text-xs">
                  Strong Matches
                </p>
              </div>

              <div className="text-center">
                <p className="text-xl font-bold leading-6 text-[#7c3aed] sm:text-2xl">
                  6
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

          {/* Desktop factor bar */}
          <div className="mt-3 hidden lg:block">
            <div className="relative flex h-2 overflow-hidden rounded-full bg-[#e2e8f0]">
              <div className="h-full w-[40%] bg-[#5046e5]" />
              <div className="h-full w-[25%] bg-[#7c3aed]" />
              <div className="h-full w-[20%] bg-[#16a34a]" />
              <div className="h-full w-[10%] bg-[#f59e0b]" />
              <div className="h-full w-[5%] bg-[#94a3b8]" />
            </div>

            <div className="grid grid-cols-5">
              <div className="border-r border-[#dce3ee] pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#52617a]">
                  <span className="h-2 w-2 rounded-full bg-[#5046e5]" />
                  Resume Match
                </div>

                <span className="mt-1 inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-semibold text-[#4f46e5]">
                  40%
                </span>
              </div>

              <div className="border-r border-[#dce3ee] pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#52617a]">
                  <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
                  Skills Match
                </div>

                <span className="mt-1 inline-flex rounded-full bg-[#f3e8ff] px-3 py-1 text-[10px] font-semibold text-[#7c3aed]">
                  25%
                </span>
              </div>

              <div className="border-r border-[#dce3ee] pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#52617a]">
                  <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                  Experience
                </div>

                <span className="mt-1 inline-flex rounded-full bg-[#dcfce7] px-3 py-1 text-[10px] font-semibold text-[#16a34a]">
                  20%
                </span>
              </div>

              <div className="border-r border-[#dce3ee] pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#52617a]">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  Assessment
                </div>

                <span className="mt-1 inline-flex rounded-full bg-[#fef3c7] px-3 py-1 text-[10px] font-semibold text-[#f59e0b]">
                  10%
                </span>
              </div>

              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#52617a]">
                  <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
                  Education
                </div>

                <span className="mt-1 inline-flex rounded-full bg-[#f1f5f9] px-3 py-1 text-[10px] font-semibold text-[#64748b]">
                  5%
                </span>
              </div>
            </div>
          </div>

          {/* Mobile factor pills */}
          <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[11px] font-semibold text-[#4f46e5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5046e5]" />
              Resume Match 40%
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3e8ff] px-3 py-1.5 text-[11px] font-semibold text-[#7c3aed]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
              Skills 25%
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3 py-1.5 text-[11px] font-semibold text-[#16a34a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
              Experience 20%
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3 py-1.5 text-[11px] font-semibold text-[#f59e0b]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
              Assessment 10%
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3 py-1.5 text-[11px] font-semibold text-[#64748b]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#94a3b8]" />
              Education 5%
            </span>
          </div>
        </section>

        {/* Candidates heading */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#172033] sm:text-lg">
              Top Candidates
            </h2>

            <p className="hidden text-xs text-[#71809a] sm:block">
              Candidates ranked by overall suitability.
            </p>
          </div>

          <div className="relative shrink-0">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 hidden h-3.5 w-3.5 -translate-y-1/2 text-[#71809a] sm:block" />

            <select
              value={sortBy}
              onChange={handleSortChange}
              className="h-9 appearance-none rounded-lg border border-[#dce3ee] bg-white px-3 pr-8 text-xs font-medium text-[#52617a] outline-none transition focus:border-[#5046e5] focus:ring-1 focus:ring-[#5046e5] sm:h-10 sm:pl-8 sm:pr-9"
            >
              <option value="overall-desc">Overall Score — High to Low</option>
              <option value="overall-asc">Overall Score — Low to High</option>
              <option value="ai-desc">AI Match — High to Low</option>
              <option value="skills-desc">Skills — High to Low</option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71809a]" />
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <section className="mt-3 hidden lg:block">
          {/* Table header */}
          <div className="grid grid-cols-[54px_235px_100px_95px_88px_100px_115px_1fr] items-center px-5 pb-3 text-[11px] font-medium text-[#71809a]">
            <span>Rank</span>
            <span>Candidate</span>
            <span>Overall Score</span>
            <span>AI Match</span>
            <span>Skills</span>
            <span>Experience</span>
            <span>Assessment</span>
            <span className="flex items-center justify-between">
              <span>Status</span>
              <span>Action</span>
            </span>
          </div>

          <div className="space-y-2">
            {paginatedCandidates.map((candidate) => {
              const shortlisted = shortlistedCandidates.includes(
                candidate.name,
              );

              return (
                <div
                  key={candidate.name}
                  className={`rounded-xl border px-5 py-3.5 transition ${
                    candidate.recommended
                      ? "border-[#bfc7ff] bg-[#eef2ff]"
                      : "border-[#dce3ee] bg-white hover:border-[#cbd5e1]"
                  }`}
                >
                  <div className="grid grid-cols-[54px_235px_100px_95px_88px_100px_115px_1fr] items-center">
                    {/* Rank */}
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

                    {/* Candidate */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${candidate.color}`}
                      >
                        {candidate.initials}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#172033]">
                          {candidate.name}
                        </p>

                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#71809a]">
                          <BriefcaseBusiness className="h-3 w-3" />
                          {candidate.experience}
                        </p>
                      </div>
                    </div>

                    {/* Overall */}
                    <div>
                      <p
                        className={`text-lg font-bold ${getScoreColor(
                          candidate.overall,
                        )}`}
                      >
                        {candidate.overall}%
                      </p>

                      <p className="text-[10px] text-[#71809a]">
                        Overall Score
                      </p>
                    </div>

                    {/* AI */}
                    <div className="text-sm font-bold text-[#172033]">
                      <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#16a34a]" />
                      {candidate.aiMatch}%
                    </div>

                    {/* Skills */}
                    <div className="text-sm font-bold text-[#172033]">
                      {candidate.skills}%
                    </div>

                    {/* Experience */}
                    <div className="text-sm font-bold text-[#172033]">
                      {candidate.experienceMatch}%
                    </div>

                    {/* Assessment */}
                    <div>
                      {typeof candidate.assessment === "number" ? (
                        <span className="text-sm font-bold text-[#172033]">
                          {candidate.assessment}%
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-[10px] font-semibold text-[#f59e0b]">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Status / actions */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                          candidate.status,
                        )}`}
                      >
                        {candidate.status}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewCandidate(candidate)}
                          className="rounded-lg border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-medium text-[#52617a] transition hover:border-[#5046e5] hover:text-[#5046e5]"
                        >
                          View
                        </button>

                        {candidate.rank === 1 && (
                          <button
                            type="button"
                            onClick={() => handleShortlist(candidate)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              shortlisted
                                ? "bg-[#5046e5] text-white"
                                : "bg-[#5046e5] text-white hover:bg-[#4338ca]"
                            }`}
                          >
                            {shortlisted ? "Shortlisted" : "Shortlist"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
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

        {/* MOBILE CARDS */}
        <section className="mt-3 space-y-3 lg:hidden">
          {paginatedCandidates.map((candidate) => {
            const shortlisted = shortlistedCandidates.includes(candidate.name);

            return (
              <article
                key={candidate.name}
                className={`rounded-xl border p-4 ${
                  candidate.recommended
                    ? "border-[#bfc7ff] bg-[#eef2ff]"
                    : "border-[#dce3ee] bg-white"
                }`}
              >
                {/* Candidate top */}
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
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white ${candidate.color}`}
                  >
                    {candidate.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#172033]">
                      {candidate.name}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#71809a]">
                      <BriefcaseBusiness className="h-3 w-3" />
                      {candidate.experience}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-2xl font-bold leading-6 ${getScoreColor(
                        candidate.overall,
                      )}`}
                    >
                      {candidate.overall}%
                    </p>

                    <p className="mt-1 text-[10px] text-[#71809a]">Overall</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 flex items-start">
                  <div className="min-w-0 pr-3">
                    <p className="text-[10px] text-[#71809a]">AI Match</p>

                    <p className="mt-0.5 text-sm font-bold text-[#172033]">
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                      {candidate.aiMatch}%
                    </p>
                  </div>

                  <div className="border-l border-[#cbd5e1] px-3">
                    <p className="text-[10px] text-[#71809a]">Skills</p>

                    <p className="mt-0.5 text-sm font-bold text-[#172033]">
                      {candidate.skills}%
                    </p>
                  </div>

                  <div className="border-l border-[#cbd5e1] px-3">
                    <p className="text-[10px] text-[#71809a]">Experience</p>

                    <p className="mt-0.5 text-sm font-bold text-[#172033]">
                      {candidate.experienceMatch}%
                    </p>
                  </div>

                  <div className="border-l border-[#cbd5e1] pl-3">
                    <p className="text-[10px] text-[#71809a]">Assessment</p>

                    {typeof candidate.assessment === "number" ? (
                      <p className="mt-0.5 text-sm font-bold text-[#172033]">
                        {candidate.assessment}%
                      </p>
                    ) : (
                      <span className="mt-0.5 inline-block rounded-full bg-[#fef3c7] px-2 py-0.5 text-[9px] font-semibold text-[#f59e0b]">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Recommendation / match */}
                <div className="mt-3">
                  {candidate.recommended ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f3ff] px-3 py-1.5 text-[10px] font-medium text-[#7c3aed]">
                      <Sparkles className="h-3 w-3" />
                      AI Recommended
                    </span>
                  ) : (
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold ${getStatusClasses(
                        candidate.status,
                      )}`}
                    >
                      {candidate.status}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 grid grid-cols-[1fr_1fr] gap-2">
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

                  {candidate.recommended ? (
                    <button
                      type="button"
                      onClick={() => handleShortlist(candidate)}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#5046e5] px-3 text-xs font-semibold text-white transition hover:bg-[#4338ca]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {shortlisted ? "Shortlisted" : "Shortlist"}
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </article>
            );
          })}
        </section>

        {/* Pagination */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#71809a]">
            Showing{" "}
            <span className="font-medium text-[#52617a]">
              {startIndex + 1}–
              {Math.min(
                startIndex + candidatesPerPage,
                sortedCandidates.length,
              )}
            </span>{" "}
            of <span className="font-medium text-[#52617a]">42</span> candidates
          </p>

          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#dce3ee] bg-white px-3 text-xs font-medium text-[#52617a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="hidden items-center gap-1.5 sm:flex">
              {[1, 2, 3, 4, 5].map((page) => (
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
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#dce3ee] bg-white px-3 text-xs font-medium text-[#52617a] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
