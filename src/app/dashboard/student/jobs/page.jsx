"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Clock3,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  BarChart3,
  Code2,
  GraduationCap,
  CalendarDays,
  ArrowUpDown,
  Check,
  BriefcaseBusiness,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

function formatPostedDate(date) {
  if (!date) return "Recently posted";

  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 86400000),
  );

  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";

  return `Posted ${days} days ago`;
}

export default function FindJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const [location, setLocation] = useState("All Locations");
  const [experience, setExperience] = useState("Any Experience");
  const [jobType, setJobType] = useState("All Types");
  const [skill, setSkill] = useState("All Skills");
  const [education, setEducation] = useState("All Education");

  const [sortBy, setSortBy] = useState("Best Match");
  const [activePage, setActivePage] = useState(1);

  const [showInsight, setShowInsight] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const jobsPerPage = 4;

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const [jobsResponse, savedResponse] = await Promise.all([
          api.get("/student/jobs"),
          api.get("/student/saved-jobs"),
        ]);

        if (!active) return;

        setJobs(jobsResponse.data.jobs || []);
        setBookmarkedJobs(savedResponse.data.savedJobIds || []);
      } catch (err) {
        if (!active) return;

        if (err.response?.status === 401) {
          window.location.href = "/login";
          return;
        }

        setError(
          err.response?.data?.message || "Unable to load available jobs.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadJobs();

    return () => {
      active = false;
    };
  }, []);

  /*
   * ============================================================
   * FILTER OPTIONS
   * ============================================================
   */

  const filterOptions = {
    location: [
      "All Locations",
      "Mumbai",
      "Thane",
      "Pune",
      "Bangalore",
      "Remote",
    ],

    experience: [
      "Any Experience",
      "0–2 Years",
      "1–2 Years",
      "1–3 Years",
      "2–4 Years",
    ],

    jobType: ["All Types", "Full-time", "Contract", "Part-time"],

    skill: [
      "All Skills",
      "React",
      "Node.js",
      "JavaScript",
      "Next.js",
      "MongoDB",
      "Express.js",
      "Tailwind CSS",
      "TypeScript",
      "PostgreSQL",
    ],

    education: ["All Education", "Any Education", "Bachelor's"],
  };

  /*
   * ============================================================
   * FILTER ICONS
   * ============================================================
   */

  const filterIcons = {
    location: MapPin,
    experience: BarChart3,
    jobType: Clock3,
    skill: Code2,
    education: GraduationCap,
  };

  /*
   * ============================================================
   * ACTIVE FILTER COUNT
   * ============================================================
   */

  const activeFilterCount = [
    location !== "All Locations",
    experience !== "Any Experience",
    jobType !== "All Types",
    skill !== "All Skills",
    education !== "All Education",
  ].filter(Boolean).length;

  /*
   * ============================================================
   * FILTER + SEARCH + SORT
   * ============================================================
   */

  const filteredJobs = useMemo(() => {
    const query = appliedSearch.trim().toLowerCase();

    let result = jobs.filter((job) => {
      const skills = [
        ...(job.requiredSkills || []),
        ...(job.preferredSkills || []),
      ];

      const matchesSearch =
        !query ||
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        skills.some((item) => item.toLowerCase().includes(query));

      const matchesLocation =
        location === "All Locations" || job.location === location;

      const matchesExperience =
        experience === "Any Experience" || job.experienceLevel === experience;

      const matchesType =
        jobType === "All Types" || job.employmentType === jobType;

      const matchesSkill = skill === "All Skills" || skills.includes(skill);

      const matchesEducation =
        education === "All Education" || job.educationRequirement === education;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesExperience &&
        matchesType &&
        matchesSkill &&
        matchesEducation
      );
    });

    if (sortBy === "Most Recent") {
      result.sort(
        (a, b) =>
          new Date(b.publishedAt || b.createdAt) -
          new Date(a.publishedAt || a.createdAt),
      );
    }

    if (sortBy === "A–Z") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [
    jobs,
    appliedSearch,
    location,
    experience,
    jobType,
    skill,
    education,
    sortBy,
  ]);
  /*
   * ============================================================
   * PAGINATION
   * ============================================================
   */

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));

  const safePage = Math.min(activePage, totalPages);

  const visibleJobs = filteredJobs.slice(
    (safePage - 1) * jobsPerPage,
    safePage * jobsPerPage,
  );

  /*
   * ============================================================
   * ACTIONS
   * ============================================================
   */

  const handleSearch = () => {
    setAppliedSearch(search);
    setActivePage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setLocation("All Locations");
    setExperience("Any Experience");
    setJobType("All Types");
    setSkill("All Skills");
    setEducation("All Education");
    setSortBy("Best Match");
    setActivePage(1);
    setOpenDropdown(null);
  };

  const removeFilter = (type) => {
    if (type === "location") setLocation("All Locations");
    if (type === "experience") setExperience("Any Experience");
    if (type === "jobType") setJobType("All Types");
    if (type === "skill") setSkill("All Skills");
    if (type === "education") setEducation("All Education");

    setActivePage(1);
  };

  const toggleBookmark = async (jobId) => {
    const isSaved = bookmarkedJobs.includes(jobId);

    try {
      if (isSaved) {
        await api.delete(`/student/saved-jobs/${jobId}`);

        setBookmarkedJobs((current) => current.filter((id) => id !== jobId));
      } else {
        await api.post("/student/saved-jobs", { jobId });

        setBookmarkedJobs((current) => [...current, jobId]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = "/login";
        return;
      }

      alert(err.response?.data?.message || "Unable to update saved jobs.");
    }
  };
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setActivePage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  console.log("Jobs: ", visibleJobs);

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <section className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto w-full px-5 pt-5 pb-14 sm:px-6 lg:px-7 lg:py-8">
        {/* ======================================================
            PAGE HEADING
        ======================================================= */}

        <div>
          <h1 className="text-[20px] font-bold leading-7 tracking-[-0.02em] text-[#111827] sm:text-[24px] lg:text-[26px] lg:leading-8">
            Find Your Next Opportunity
          </h1>

          <p className="mt-0.5 text-[13px] text-[#64748B] sm:text-[14px]">
            <span className="sm:hidden">
              Discover jobs that match your skills.
            </span>

            <span className="hidden sm:inline">
              Search jobs that match your skills, education and career goals.
            </span>
          </p>
        </div>

        {/* ======================================================
            SEARCH BOX
            SAME MARKUP / RESPONSIVE
        ======================================================= */}

        <div className="mt-4 rounded-[14px] border border-[#DCE3EE] bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.02)] sm:mt-5 sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActivePage(1);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Search jobs, skills or companies"
                className="h-12 w-full rounded-[9px] border border-[#DCE3EE] bg-[#F8FAFC] pl-11 pr-4 text-[14px] text-[#1E293B] outline-none transition placeholder:text-[#94A3B8] focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10 sm:h-11 sm:rounded-[8px]"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] px-7 text-[14px] font-semibold text-white transition hover:bg-[#4338CA] active:scale-[0.99] sm:h-11"
            >
              <Search size={17} />
              Search
            </button>
          </div>

          {/* ==================================================
              DESKTOP FILTERS
          =================================================== */}

          <div className="mt-3 hidden flex-wrap items-center gap-2 lg:flex">
            {[
              {
                key: "location",
                label: location,
              },
              {
                key: "experience",
                label: experience,
              },
              {
                key: "jobType",
                label: jobType,
              },
              {
                key: "skill",
                label: skill,
              },
              {
                key: "education",
                label: education,
              },
            ].map(({ key, label }) => {
              const Icon = filterIcons[key];

              return (
                <div key={key} className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === key ? null : key)
                    }
                    className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-medium transition ${
                      openDropdown === key
                        ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5]"
                        : "border-[#DCE3EE] bg-[#F8FAFC] text-[#475569] hover:border-[#C7D2FE]"
                    }`}
                  >
                    <Icon size={15} className="text-[#71829B]" />

                    {label}

                    <ChevronDown
                      size={14}
                      className={`ml-1 text-[#94A3B8] transition ${
                        openDropdown === key ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openDropdown === key && (
                    <div className="absolute left-0 top-[46px] z-40 min-w-[190px] overflow-hidden rounded-[10px] border border-[#DCE3EE] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                      {filterOptions[key].map((option) => {
                        const selected = label === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              if (key === "location") {
                                setLocation(option);
                              }

                              if (key === "experience") {
                                setExperience(option);
                              }

                              if (key === "jobType") {
                                setJobType(option);
                              }

                              if (key === "skill") {
                                setSkill(option);
                              }

                              if (key === "education") {
                                setEducation(option);
                              }

                              setOpenDropdown(null);
                              setActivePage(1);
                            }}
                            className={`flex w-full items-center justify-between rounded-[7px] px-3 py-2.5 text-left text-[13px] transition ${
                              selected
                                ? "bg-[#EEF2FF] font-semibold text-[#4F46E5]"
                                : "text-[#475569] hover:bg-[#F8FAFC]"
                            }`}
                          >
                            {option}

                            {selected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterCount === 0 && !appliedSearch}
              className="ml-auto inline-flex items-center gap-1 text-[13px] text-[#64748B] transition hover:text-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={14} />
              Clear Filters
            </button>
          </div>

          {/* ==================================================
              MOBILE FILTER BUTTON + ACTIVE CHIPS
          =================================================== */}

          <div className="mt-3 flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-[8px] border bg-white px-4 text-[13px] font-medium transition ${
                mobileFiltersOpen
                  ? "border-[#4F46E5] text-[#4F46E5]"
                  : "border-[#DCE3EE] text-[#475569]"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4F46E5] px-1 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-hidden">
              {location !== "All Locations" && (
                <button
                  type="button"
                  onClick={() => removeFilter("location")}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 text-[12px] font-medium text-[#4F46E5]"
                >
                  {location}
                  <X size={12} />
                </button>
              )}

              {jobType !== "All Types" && (
                <button
                  type="button"
                  onClick={() => removeFilter("jobType")}
                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 text-[12px] font-medium text-[#4F46E5]"
                >
                  {jobType}
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              MOBILE FILTER PANEL
          =================================================== */}

          {mobileFiltersOpen && (
            <div className="mt-3 rounded-[12px] border border-[#DCE3EE] bg-[#F8FAFC] p-3 lg:hidden">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  {
                    key: "location",
                    label: "Location",
                    value: location,
                  },
                  {
                    key: "experience",
                    label: "Experience",
                    value: experience,
                  },
                  {
                    key: "jobType",
                    label: "Job Type",
                    value: jobType,
                  },
                  {
                    key: "skill",
                    label: "Skill",
                    value: skill,
                  },
                  {
                    key: "education",
                    label: "Education",
                    value: education,
                  },
                ].map(({ key, label, value }) => {
                  const Icon = filterIcons[key];

                  return (
                    <div key={key} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === `mobile-${key}`
                              ? null
                              : `mobile-${key}`,
                          )
                        }
                        className="flex h-10 w-full items-center justify-between rounded-[8px] border border-[#DCE3EE] bg-white px-3 text-[12px] text-[#475569]"
                      >
                        <span className="flex items-center gap-2">
                          <Icon size={14} />
                          {value}
                        </span>

                        <ChevronDown
                          size={14}
                          className={`transition ${
                            openDropdown === `mobile-${key}` ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {openDropdown === `mobile-${key}` && (
                        <div className="absolute left-0 right-0 top-[44px] z-50 max-h-52 overflow-y-auto rounded-[9px] border border-[#DCE3EE] bg-white p-1.5 shadow-[0_10px_25px_rgba(15,23,42,0.12)]">
                          {filterOptions[key].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                if (key === "location") {
                                  setLocation(option);
                                }

                                if (key === "experience") {
                                  setExperience(option);
                                }

                                if (key === "jobType") {
                                  setJobType(option);
                                }

                                if (key === "skill") {
                                  setSkill(option);
                                }

                                if (key === "education") {
                                  setEducation(option);
                                }

                                setOpenDropdown(null);
                                setActivePage(1);
                              }}
                              className="flex w-full items-center justify-between rounded-[7px] px-3 py-2 text-left text-[12px] text-[#475569] hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
                            >
                              {option}

                              {value === option && <Check size={13} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-[8px] border border-[#DCE3EE] bg-white text-[12px] font-medium text-[#64748B]"
              >
                <X size={14} />
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* ======================================================
            RECOMMENDED JOBS HEADER
        ======================================================= */}

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold leading-6 text-[#111827] sm:text-[18px]">
              Recommended Jobs
            </h2>

            <p className="mt-0.5 text-[12px] text-[#71829B] sm:text-[13px]">
              <span className="sm:hidden">
                {filteredJobs.length} jobs found
              </span>

              <span className="hidden sm:inline">
                Jobs matching your profile and preferences.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#EEF2FF] px-4 py-2 text-[12px] font-semibold text-[#4F46E5] sm:inline-flex">
              {filteredJobs.length} jobs found
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown(openDropdown === "sort" ? null : "sort")
                }
                className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#DCE3EE] bg-white px-3 text-[12px] font-medium text-[#475569] transition hover:border-[#C7D2FE] sm:text-[13px]"
              >
                <ArrowUpDown size={14} className="hidden sm:block" />

                {sortBy}

                <ChevronDown
                  size={14}
                  className={`text-[#94A3B8] transition ${
                    openDropdown === "sort" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "sort" && (
                <div className="absolute right-0 top-[44px] z-40 w-40 rounded-[10px] border border-[#DCE3EE] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.12)]">
                  {["Best Match", "Most Recent", "A–Z"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSortBy(option);
                        setOpenDropdown(null);
                        setActivePage(1);
                      }}
                      className={`flex w-full items-center justify-between rounded-[7px] px-3 py-2.5 text-left text-[12px] ${
                        sortBy === option
                          ? "bg-[#EEF2FF] font-semibold text-[#4F46E5]"
                          : "text-[#475569] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      {option}

                      {sortBy === option && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================
            AI INSIGHT
        ======================================================= */}

        {showInsight && (
          <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#E5DEFF] bg-[#F6F2FF] px-3.5 py-3.5 sm:items-center sm:px-5 sm:py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#EDE9FE] text-[#7C3AED]">
              <Sparkles size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#7C3AED]">
                AI Job Match Insight
              </p>

              <p className="mt-0.5 text-[12px] leading-[18px] text-[#64748B] sm:text-[13px]">
                <span className="sm:hidden">
                  Your profile matches Full Stack and Frontend roles strongly.
                </span>

                <span className="hidden sm:inline">
                  Your strongest matches are currently Full Stack and Frontend
                  roles because your profile includes React, JavaScript and
                  Node.js.
                </span>
              </p>
            </div>

            <button
              type="button"
              aria-label="Close insight"
              onClick={() => setShowInsight(false)}
              className="ml-auto shrink-0 text-[#94A3B8] transition hover:text-[#475569]"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ======================================================
            JOB GRID
            SAME CARD MARKUP FOR MOBILE + DESKTOP
        ======================================================= */}

        {loading && (
          <div className="rounded-xl border border-[#DCE3EE] bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#E0E7FF] border-t-[#4F46E5]" />
            <p className="mt-3 text-sm text-[#64748B]">
              Loading available jobs...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {visibleJobs.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibleJobs.map((job) => {
              const isGreen = job.match >= 90;
              const isYellow = job.match < 80;

              const progressColor = isGreen
                ? "bg-[#16A34A]"
                : isYellow
                  ? "bg-[#F59E0B]"
                  : "bg-[#4F46E5]";

              const matchBadge = isGreen
                ? "bg-[#DCFCE7] text-[#16A34A]"
                : isYellow
                  ? "bg-[#FEF3C7] text-[#D97706]"
                  : "bg-[#EEF2FF] text-[#4F46E5]";

              const initialsStyle = {
                blue: "bg-[#EEF2FF] text-[#4F46E5]",
                purple: "bg-[#F5F3FF] text-[#7C3AED]",
                green: "bg-[#DCFCE7] text-[#16A34A]",
                yellow: "bg-[#FEF3C7] text-[#D97706]",
              };

              const isBookmarked = bookmarkedJobs.includes(job._id);

              return (
                <article
                  key={job._id}
                  className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition hover:border-[#C7D2FE] hover:shadow-[0_4px_15px_rgba(15,23,42,0.04)] sm:p-5"
                >
                  {/* Job top */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] text-[14px] font-bold ${initialsStyle[job.accent]}`}
                      >
                        {job.title
                          ?.trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("") || "R"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-[16px] font-bold leading-5 text-[#111827]">
                          {job.title}
                        </h3>

                        <p className="mt-0.5 text-[13px] text-[#64748B]">
                          {job.recruiter.profile.recruiter.companyName}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(job._id)}
                      aria-label={
                        isBookmarked
                          ? `Remove ${job.title} bookmark`
                          : `Bookmark ${job.title}`
                      }
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] border transition ${
                        isBookmarked
                          ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5]"
                          : "border-[#DCE3EE] text-[#8EA0B8] hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      }`}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck size={15} strokeWidth={1.8} />
                      ) : (
                        <Bookmark size={15} strokeWidth={1.8} />
                      )}
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-[#71829B]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} />
                      {job.location}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {job.employmentType}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <BarChart3 size={13} />
                      {job.experienceLevel}
                    </span>

                    <span className="hidden items-center gap-1.5 sm:inline-flex">
                      <CalendarDays size={13} />
                      {formatPostedDate(job.publishedAt)}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 4).map((jobSkill) => (
                      <button
                        key={jobSkill}
                        type="button"
                        onClick={() => {
                          setSkill(jobSkill);
                          setActivePage(1);
                        }}
                        className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-semibold text-[#4F46E5] transition hover:bg-[#E0E7FF]"
                      >
                        {jobSkill}
                      </button>
                    ))}
                  </div>

                  {/* Bottom */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Link
                      href={`/dashboard/student/jobs/${job._id}`}
                      className={`inline-flex h-9 items-center justify-center gap-2 rounded-[7px] px-7 text-[13px] font-semibold transition active:scale-[0.98] ${
                        job.match >= 82
                          ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                          : "border border-[#DCE3EE] bg-white text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]"
                      }`}
                    >
                      View Job
                      <ChevronRight size={16} />
                    </Link>

                    {job.status === "New" ? (
                      <span className="inline-flex items-center rounded-full bg-[#DCFCE7] px-3 py-1 text-[12px] font-semibold text-[#16A34A]">
                        New
                      </span>
                    ) : job.status === "Remote" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F3E8FF] px-3 py-1 text-[12px] font-semibold text-[#7C3AED]">
                        <BriefcaseBusiness size={11} />
                        Remote
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#94A3B8]">
                        {job.status}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* ====================================================
             EMPTY STATE
          ===================================================== */

          <div className="mt-5 rounded-[14px] border border-[#DCE3EE] bg-white px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4F46E5]">
              <Search size={21} />
            </div>

            <h3 className="mt-4 text-[16px] font-bold text-[#111827]">
              No jobs found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-[13px] leading-5 text-[#71829B]">
              Try changing your search or removing some filters to find more
              opportunities.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-[7px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white hover:bg-[#4338CA]"
            >
              <X size={15} />
              Clear Filters
            </button>
          </div>
        )}

        {/* ======================================================
            PAGINATION
        ======================================================= */}

        {filteredJobs.length > 0 && (
          <div className="mt-5 flex items-center justify-center gap-2 pb-4">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => handlePageChange(safePage - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#DCE3EE] bg-white text-[#94A3B8] transition hover:border-[#4F46E5] hover:text-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-[7px] text-[13px] font-medium transition ${
                    safePage === page
                      ? "bg-[#4F46E5] text-white"
                      : "border border-[#DCE3EE] bg-white text-[#475569] hover:border-[#4F46E5] hover:text-[#4F46E5]"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => handlePageChange(safePage + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#DCE3EE] bg-white text-[#4F46E5] transition hover:bg-[#EEF2FF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {openDropdown && (
        <button
          type="button"
          aria-label="Close dropdown"
          onClick={() => setOpenDropdown(null)}
          className="fixed inset-0 z-10 cursor-default bg-transparent"
        />
      )}
    </section>
  );
}
