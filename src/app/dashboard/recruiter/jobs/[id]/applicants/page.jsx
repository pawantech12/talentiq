"use client";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Eye,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ApplicantsPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params?.id;

  const applicants = [
    {
      id: 1,
      initials: "RS",
      name: "Rahul Sharma",
      experience: "2 Years",
      aiMatch: 89,
      assessment: 84,
      status: "Shortlisted",
      applied: "14 Aug 2026",
      appliedMobile: "14 Aug",
      color: "bg-[#4f46e5]",
      matchColor: "green",
    },
    {
      id: 2,
      initials: "PP",
      name: "Priya Patel",
      experience: "1.5 Years",
      aiMatch: 86,
      assessment: null,
      status: "Under Review",
      applied: "13 Aug 2026",
      appliedMobile: "13 Aug",
      color: "bg-[#7c3aed]",
      matchColor: "green",
    },
    {
      id: 3,
      initials: "AV",
      name: "Amit Verma",
      experience: "2 Years",
      aiMatch: 81,
      assessment: 78,
      status: "Under Review",
      applied: "13 Aug 2026",
      appliedMobile: "13 Aug",
      color: "bg-[#16a34a]",
      matchColor: "indigo",
    },
    {
      id: 4,
      initials: "SS",
      name: "Sneha Shah",
      experience: "1 Year",
      aiMatch: 76,
      assessment: 72,
      status: "New",
      applied: "12 Aug 2026",
      appliedMobile: "12 Aug",
      color: "bg-[#f59e0b]",
      matchColor: "orange",
    },
    {
      id: 5,
      initials: "VJ",
      name: "Vikram Joshi",
      experience: "3 Years",
      aiMatch: 73,
      assessment: 68,
      status: "New",
      applied: "11 Aug 2026",
      appliedMobile: "11 Aug",
      color: "bg-[#172033]",
      matchColor: "orange",
    },
    {
      id: 6,
      initials: "ND",
      name: "Neha Desai",
      experience: "1 Year",
      aiMatch: 64,
      assessment: 61,
      status: "Under Review",
      applied: "10 Aug 2026",
      appliedMobile: "10 Aug",
      color: "bg-[#ef4444]",
      matchColor: "orange",
    },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [matchFilter, setMatchFilter] = useState("AI Match");
  const [sortBy, setSortBy] = useState("AI Match: High to Low");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);

    window.clearTimeout(window.__resumeAiApplicantsToast);

    window.__resumeAiApplicantsToast = window.setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const filteredApplicants = useMemo(() => {
    let result = [...applicants];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(query) ||
          candidate.experience.toLowerCase().includes(query) ||
          candidate.status.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "All Status") {
      result = result.filter((candidate) => candidate.status === statusFilter);
    }

    if (matchFilter === "Strong Matches") {
      result = result.filter((candidate) => candidate.aiMatch >= 84);
    }

    if (matchFilter === "Medium Matches") {
      result = result.filter(
        (candidate) => candidate.aiMatch >= 80 && candidate.aiMatch < 84,
      );
    }

    if (matchFilter === "Low Matches") {
      result = result.filter((candidate) => candidate.aiMatch < 80);
    }

    if (sortBy === "AI Match: High to Low") {
      result.sort((a, b) => b.aiMatch - a.aiMatch);
    }

    if (sortBy === "AI Match: Low to High") {
      result.sort((a, b) => a.aiMatch - b.aiMatch);
    }

    if (sortBy === "Newest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [search, statusFilter, matchFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / 6));

  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * 6,
    currentPage * 6,
  );

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleMatchChange = (value) => {
    setMatchFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const getMatchClasses = (match) => {
    if (match >= 84) {
      return {
        text: "text-[#16a34a]",
        bg: "bg-[#dcfce7]",
        border: "border-[#bbf7d0]",
        iconBg: "bg-[#dcfce7]",
        dot: "bg-[#16a34a]",
      };
    }

    if (match >= 80) {
      return {
        text: "text-[#4f46e5]",
        bg: "bg-[#eef2ff]",
        border: "border-[#e0e7ff]",
        iconBg: "bg-[#eef2ff]",
        dot: "bg-[#4f46e5]",
      };
    }

    return {
      text: "text-[#f59e0b]",
      bg: "bg-[#fff3cf]",
      border: "border-[#fde68a]",
      iconBg: "bg-[#fff3cf]",
      dot: "bg-[#f59e0b]",
    };
  };

  const getStatusClasses = (status) => {
    if (status === "Shortlisted") {
      return "bg-[#dcfce7] text-[#16a34a]";
    }

    if (status === "Under Review") {
      return "bg-[#fff3cf] text-[#f59e0b]";
    }

    return "bg-[#eef2ff] text-[#4f46e5]";
  };

  const getAssessmentClasses = (candidate) => {
    if (candidate.assessment === null) {
      return {
        text: "text-[#f59e0b]",
        bg: "bg-[#fff3cf]",
      };
    }

    if (candidate.assessment >= 80) {
      return {
        text: "text-[#16a34a]",
        bg: "bg-[#dcfce7]",
      };
    }

    return {
      text: "text-[#4f46e5]",
      bg: "bg-[#eef2ff]",
    };
  };

  const handleViewCandidate = (candidate) => {
    router.push(`/dashboard/recruiter/candidates/${candidate.id}`);
  };

  const handleViewJob = () => {
    showToast("Opening Full Stack Developer");
  };

  const handleShortlist = () => {
    showToast("Shortlisted candidates opened");
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-[9px] bg-[#172033] px-4 py-3 text-[13px] font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="w-full px-[20px] pb-[32px] pt-[24px] lg:px-[28px] lg:pb-[28px] lg:pt-[26px]">
        {/* Breadcrumb */}
        <div className="mb-[30px] flex items-center gap-[9px] text-[14px]">
          <span className="text-[#64748b]">Jobs</span>

          <ChevronRight
            size={15}
            strokeWidth={1.7}
            className="text-[#94a3b8]"
          />

          <span className="text-[#64748b]">Full Stack Developer</span>

          <ChevronRight
            size={15}
            strokeWidth={1.7}
            className="text-[#94a3b8]"
          />

          <span className="font-semibold text-[#4f46e5]">Applicants</span>
        </div>

        {/* Page heading */}
        <div className="flex flex-col gap-[18px] lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-[27px] font-bold leading-[32px] tracking-[-0.5px] text-[#111827]">
              Applicants
            </h1>

            <p className="mt-[2px] text-[14px] leading-[20px] text-[#475569]">
              Review candidates who applied for Full Stack Developer.
            </p>

            {/* Job information */}
            <div className="mt-[7px] hidden h-[33px] items-center overflow-hidden rounded-[8px] border border-[#dce3ed] bg-white lg:flex">
              <div className="flex items-center gap-[7px] px-[13px] text-[13px] font-semibold text-[#172033]">
                <BriefcaseBusiness
                  size={15}
                  strokeWidth={1.7}
                  className="text-[#4f46e5]"
                />
                Full Stack Developer
              </div>

              <div className="h-[20px] w-px bg-[#dce3ed]" />

              <div className="px-[13px] text-[13px] text-[#64748b]">
                Engineering
              </div>

              <div className="h-[20px] w-px bg-[#dce3ed]" />

              <div className="flex items-center gap-[6px] px-[13px] text-[13px] text-[#64748b]">
                <MapPin size={15} strokeWidth={1.7} />
                Mumbai, Maharashtra
              </div>

              <div className="h-[20px] w-px bg-[#dce3ed]" />

              <div className="flex items-center gap-[6px] px-[13px] text-[13px] text-[#4f46e5]">
                <Users size={15} strokeWidth={1.7} />
                42 Applications
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-[9px] lg:flex">
            <button
              type="button"
              onClick={handleViewJob}
              className="flex h-[39px] items-center gap-[8px] rounded-[8px] border border-[#dce3ed] bg-white px-[16px] text-[13px] font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
            >
              <ExternalLink size={15} strokeWidth={1.8} />
              View Job
            </button>

            <button
              type="button"
              onClick={handleShortlist}
              className="flex h-[39px] items-center gap-[8px] rounded-[8px] bg-[#4f46e5] px-[18px] text-[13px] font-semibold text-white shadow-[0_3px_7px_rgba(79,70,229,0.2)] transition hover:bg-[#4338ca]"
            >
              <Star size={15} strokeWidth={1.8} />
              Shortlisted (8)
            </button>
          </div>
        </div>

        {/* Mobile job card */}
        <div className="mt-[18px] rounded-[11px] border border-[#dce3ed] bg-white px-[15px] py-[14px] lg:hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[21px] font-bold leading-[26px] text-[#172033]">
                Applicants
              </h2>

              <p className="mt-[1px] text-[14px] font-semibold leading-[19px] text-[#4f46e5]">
                Full Stack Developer
              </p>
            </div>

            <button
              type="button"
              onClick={handleViewJob}
              className="flex h-[35px] shrink-0 items-center gap-[6px] rounded-[8px] border border-[#dce3ed] bg-white px-[12px] text-[12px] font-semibold text-[#475569]"
            >
              <ExternalLink size={14} />
              View Job
            </button>
          </div>

          <div className="mt-[9px] flex h-[35px] items-center overflow-hidden rounded-[8px] border border-[#dce3ed] bg-[#f8fafc]">
            <div className="flex items-center gap-[6px] px-[11px] text-[12px] font-semibold text-[#4f46e5]">
              <Users size={14} />
              42 Applications
            </div>

            <div className="h-[20px] w-px bg-[#dce3ed]" />

            <div className="flex items-center gap-[6px] px-[11px] text-[12px] text-[#64748b]">
              <MapPin size={14} />
              Mumbai, Maharashtra
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="mt-[20px] grid grid-cols-2 gap-[10px] lg:mt-[22px] lg:grid-cols-4 lg:gap-[16px]">
          <div className="rounded-[12px] border border-[#dce3ed] bg-white px-[17px] py-[17px] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-[14px]">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#f1f5f9]">
                <Users size={21} strokeWidth={1.8} className="text-[#64748b]" />
              </div>

              <div>
                <p className="text-[12px] leading-[17px] text-[#64748b] lg:text-[13px]">
                  Total Applicants
                </p>

                <p className="mt-[1px] text-[27px] font-bold leading-[31px] text-[#172033]">
                  42
                </p>
              </div>
            </div>
          </div>

          <div className="order-3 rounded-[12px] border border-[#dce3ed] bg-white px-[17px] py-[17px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] lg:order-none">
            <div className="flex items-center gap-[14px]">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#eef2ff]">
                <UserRoundPlus
                  size={21}
                  strokeWidth={1.8}
                  className="text-[#4f46e5]"
                />
              </div>

              <div>
                <p className="text-[12px] leading-[17px] text-[#4f46e5] lg:text-[13px]">
                  New
                </p>

                <p className="mt-[1px] text-[27px] font-bold leading-[31px] text-[#4f46e5]">
                  12
                </p>
              </div>
            </div>
          </div>

          <div className="order-2 rounded-[12px] border border-[#dce3ed] bg-white px-[17px] py-[17px] shadow-[0_1px_2px_rgba(15,23,42,0.03)] lg:order-none">
            <div className="flex items-center gap-[14px]">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#fff3cf]">
                <svg
                  className="h-[21px] w-[21px] text-[#f59e0b]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div>
                <p className="text-[12px] leading-[17px] text-[#92400e] lg:text-[13px]">
                  Under Review
                </p>

                <p className="mt-[1px] text-[27px] font-bold leading-[31px] text-[#b45309]">
                  18
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#dce3ed] bg-white px-[17px] py-[17px] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <div className="flex items-center gap-[14px]">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#dcfce7]">
                <UserRoundPlus
                  size={21}
                  strokeWidth={1.8}
                  className="text-[#16a34a]"
                />
              </div>

              <div>
                <p className="text-[12px] leading-[17px] text-[#166534] lg:text-[13px]">
                  Shortlisted
                </p>

                <p className="mt-[1px] text-[27px] font-bold leading-[31px] text-[#16a34a]">
                  8
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Screening banner */}
        <section className="mt-[21px] rounded-[11px] border border-[#ddd6fe] bg-[#f7f4ff] px-[15px] py-[13px] lg:mt-[22px] lg:px-[18px] lg:py-[13px]">
          <div className="flex flex-col gap-[12px] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-[#ede9fe]">
                <Sparkles
                  size={19}
                  strokeWidth={1.8}
                  className="text-[#7c3aed]"
                />
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

            <div className="flex items-center gap-[10px] lg:pr-[2px]">
              <div className="flex h-[30px] flex-1 items-center justify-center gap-[7px] rounded-[7px] border border-[#ddd6fe] bg-white px-[11px] text-[12px] font-semibold text-[#172033] lg:flex-none lg:px-[15px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#7c3aed]" />
                42 Resumes Analyzed
              </div>

              <div className="flex h-[30px] flex-1 items-center justify-center gap-[7px] rounded-[7px] border border-[#86efac] bg-white px-[11px] text-[12px] font-semibold text-[#172033] lg:flex-none lg:px-[15px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#16a34a]" />
                18 Strong Matches
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-[21px] rounded-[11px] border border-[#dce3ed] bg-white p-[13px] lg:mt-[22px] lg:px-[19px] lg:py-[13px]">
          <div className="flex flex-col gap-[9px] lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-[240px]">
              <Search
                size={17}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search candidates..."
                className="h-[40px] w-full rounded-[8px] border border-[#d9e1eb] bg-[#f8fafc] pl-[38px] pr-[12px] text-[13px] text-[#334155] outline-none placeholder:text-[#94a3b8] focus:border-[#6366f1] focus:ring-[2px] focus:ring-[#e0e7ff]"
              />
            </div>

            <div className="relative w-full lg:w-[145px]">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#d9e1eb] bg-[#f8fafc] px-[12px] pr-[32px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1]"
              >
                <option>All Status</option>
                <option>New</option>
                <option>Under Review</option>
                <option>Shortlisted</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </div>

            <div className="relative w-full lg:w-[130px]">
              <select
                value={matchFilter}
                onChange={(e) => handleMatchChange(e.target.value)}
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
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-[40px] w-full appearance-none rounded-[8px] border border-[#d9e1eb] bg-[#f8fafc] px-[12px] text-[13px] font-medium text-[#475569] outline-none focus:border-[#6366f1]"
              >
                <option>AI Match: High to Low</option>
                <option>AI Match: Low to High</option>
                <option>Newest</option>
              </select>

              <SlidersHorizontal
                size={15}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-[12px] top-1/2 hidden -translate-y-1/2 text-[#64748b] lg:block"
              />

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-[11px] top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
            </div>
          </div>
        </section>

        {/* Mobile heading */}
        <div className="mt-[16px] flex items-center justify-between lg:hidden">
          <h2 className="text-[16px] font-bold text-[#172033]">
            All Applicants
          </h2>

          <span className="text-[12px] text-[#64748b]">
            {filteredApplicants.length} of 42 shown
          </span>
        </div>

        {/* Applicants table/card */}
        <section className="mt-[21px] overflow-hidden rounded-[12px] border border-[#dce3ed] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)] lg:mt-[22px]">
          {/* Desktop table heading */}
          <div className="hidden items-center justify-between px-[19px] py-[15px] lg:flex">
            <div>
              <h2 className="text-[16px] font-bold leading-[20px] text-[#172033]">
                All Applicants
              </h2>

              <p className="mt-[2px] text-[12px] leading-[17px] text-[#64748b]">
                Candidates applying for Full Stack Developer.
              </p>
            </div>

            <span className="rounded-full bg-[#eef2ff] px-[12px] py-[5px] text-[11px] font-semibold text-[#4f46e5]">
              42 Total
            </span>
          </div>

          {/* Desktop columns */}
          <div className="hidden grid-cols-[2.1fr_1fr_1fr_0.95fr_1fr_0.9fr_0.7fr] border-y border-[#dce3ed] bg-[#f8fafc] px-[19px] py-[11px] text-[11px] font-semibold text-[#64748b] lg:grid">
            <div>Candidate</div>
            <div>Experience</div>
            <div>AI Match</div>
            <div>Assessment</div>
            <div>Status</div>
            <div>Applied</div>
            <div>Action</div>
          </div>

          {/* Applicant rows */}
          <div>
            {paginatedApplicants.length > 0 ? (
              paginatedApplicants.map((candidate) => {
                const match = getMatchClasses(candidate.aiMatch);
                const assessment = getAssessmentClasses(candidate);

                return (
                  <article
                    key={candidate.id}
                    className="border-b border-[#dce3ed] px-[15px] py-[14px] last:border-b-0 lg:grid lg:grid-cols-[2.1fr_1fr_1fr_0.95fr_1fr_0.9fr_0.7fr] lg:items-center lg:px-[19px] lg:py-[14px]"
                  >
                    {/* Candidate */}
                    <div className="flex min-w-0 items-center gap-[11px]">
                      <div
                        className={`flex h-[37px] w-[37px] shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${candidate.color}`}
                      >
                        {candidate.initials}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-semibold leading-[19px] text-[#172033]">
                          {candidate.name}
                        </h3>

                        <p className="mt-[1px] flex items-center gap-[5px] text-[11px] leading-[16px] text-[#64748b]">
                          <BriefcaseBusiness size={12} strokeWidth={1.7} />
                          {candidate.experience}
                          <span className="lg:hidden">Experience</span>
                        </p>

                        <p className="mt-[1px] hidden text-[12px] text-[#64748b] lg:block">
                          Full Stack Developer
                        </p>
                      </div>

                      <span
                        className={`ml-auto rounded-full px-[10px] py-[4px] text-[11px] font-semibold lg:hidden ${getStatusClasses(
                          candidate.status,
                        )}`}
                      >
                        {candidate.status}
                      </span>
                    </div>

                    {/* Desktop experience */}
                    <div className="hidden items-center gap-[6px] text-[13px] text-[#475569] lg:flex">
                      <BriefcaseBusiness
                        size={14}
                        strokeWidth={1.7}
                        className="text-[#64748b]"
                      />
                      {candidate.experience}
                    </div>

                    {/* Desktop AI Match */}
                    <div className="hidden lg:flex">
                      <span
                        className={`inline-flex items-center gap-[6px] rounded-full px-[10px] py-[5px] text-[12px] font-semibold ${match.bg} ${match.text}`}
                      >
                        <span
                          className={`h-[7px] w-[7px] rounded-full ${match.dot}`}
                        />
                        {candidate.aiMatch}%
                      </span>

                      <Sparkles
                        size={14}
                        strokeWidth={1.7}
                        className={`ml-[7px] ${match.text}`}
                      />
                    </div>

                    {/* Desktop Assessment */}
                    <div
                      className={`hidden text-[13px] font-semibold lg:block ${assessment.text}`}
                    >
                      {candidate.assessment !== null
                        ? `${candidate.assessment}%`
                        : "Pending"}
                    </div>

                    {/* Desktop Status */}
                    <div className="hidden lg:block">
                      <span
                        className={`inline-flex rounded-full px-[11px] py-[5px] text-[11px] font-semibold ${getStatusClasses(
                          candidate.status,
                        )}`}
                      >
                        {candidate.status}
                      </span>
                    </div>

                    {/* Desktop Applied */}
                    <div className="hidden text-[12px] text-[#64748b] lg:block">
                      {candidate.applied}
                    </div>

                    {/* Desktop action */}
                    <div className="hidden lg:block">
                      <button
                        type="button"
                        onClick={() => handleViewCandidate(candidate)}
                        className="flex h-[28px] items-center justify-center rounded-[7px] bg-[#eef2ff] px-[14px] text-[11px] font-semibold text-[#4f46e5] transition hover:bg-[#e0e7ff]"
                      >
                        View
                      </button>
                    </div>

                    {/* Mobile details */}
                    <div className="mt-[10px] lg:hidden">
                      <div className="flex overflow-hidden rounded-[9px] border border-[#dce3ed] bg-white">
                        {/* AI Match */}
                        <div className="flex min-w-0 flex-1 items-center gap-[7px] px-[10px] py-[7px]">
                          <div
                            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] ${match.iconBg}`}
                          >
                            <Sparkles
                              size={14}
                              strokeWidth={1.7}
                              className={match.text}
                            />
                          </div>

                          <div className="min-w-0">
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

                        {/* Assessment */}
                        <div className="flex min-w-0 flex-1 items-center gap-[7px] px-[10px] py-[7px]">
                          <div
                            className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] ${assessment.bg}`}
                          >
                            <ClipboardCheck
                              size={14}
                              strokeWidth={1.7}
                              className={assessment.text}
                            />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-[14px] font-bold leading-[16px] ${assessment.text}`}
                            >
                              {candidate.assessment !== null
                                ? `${candidate.assessment}%`
                                : "Pending"}
                            </p>

                            <p className="text-[9px] leading-[13px] text-[#64748b]">
                              Assessment
                            </p>
                          </div>
                        </div>

                        <div className="my-[7px] w-px bg-[#dce3ed]" />

                        {/* Applied */}
                        <div className="flex min-w-0 flex-1 items-center gap-[7px] px-[10px] py-[7px]">
                          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] bg-[#f1f5f9]">
                            <CalendarDays
                              size={14}
                              strokeWidth={1.7}
                              className="text-[#64748b]"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold leading-[16px] text-[#475569]">
                              {candidate.appliedMobile}
                            </p>

                            <p className="text-[9px] leading-[13px] text-[#64748b]">
                              Applied
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewCandidate(candidate)}
                        className="mt-[11px] flex h-[38px] w-full items-center justify-center gap-[7px] rounded-[8px] bg-[#eef2ff] text-[13px] font-semibold text-[#4f46e5]"
                      >
                        <Eye size={15} strokeWidth={1.8} />
                        View Candidate
                      </button>
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
                  No applicants found
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
              Showing {paginatedApplicants.length}–
              {Math.min(currentPage * 6, filteredApplicants.length)} of 42
              applicants
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

              {[1, 2, 3, 4, 5].map((page) => (
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
