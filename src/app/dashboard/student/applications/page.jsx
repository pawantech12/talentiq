"use client";

import {
  ArrowRight,
  ArrowUpDown,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Filter,
  MapPin,
  Play,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationsPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("Recent");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const applications = [
    {
      id: 1,
      initials: "AT",
      title: "Full Stack Developer",
      company: "ABC Technologies",
      location: "Mumbai",
      appliedDate: "12 Aug 2026",
      dateValue: new Date("2026-08-12").getTime(),
      status: "Shortlisted",
      resumeMatch: 86,
      assessment: 82,
      overallMatch: 89,
      action: "View Application",
      avatarClass: "bg-indigo-50 text-indigo-600",
    },
    {
      id: 2,
      initials: "TN",
      title: "Frontend Developer",
      company: "TechNova Solutions",
      location: "Thane",
      appliedDate: "10 Aug 2026",
      dateValue: new Date("2026-08-10").getTime(),
      status: "In Review",
      resumeMatch: 84,
      assessment: null,
      overallMatch: null,
      action: "View Application",
      avatarClass: "bg-indigo-50 text-indigo-600",
    },
    {
      id: 3,
      initials: "CS",
      title: "Node.js Developer",
      company: "CodeSphere",
      location: "Mumbai",
      appliedDate: "06 Aug 2026",
      dateValue: new Date("2026-08-06").getTime(),
      status: "Assessment Pending",
      resumeMatch: 82,
      assessment: "Not Started",
      overallMatch: null,
      action: "Continue Assessment",
      avatarClass: "bg-purple-50 text-purple-600",
    },
    {
      id: 4,
      initials: "DW",
      title: "React Developer",
      company: "DigitalWorks",
      location: "Remote",
      appliedDate: "02 Aug 2026",
      dateValue: new Date("2026-08-02").getTime(),
      status: "Completed",
      resumeMatch: 78,
      assessment: 75,
      overallMatch: 81,
      action: "View Result",
      avatarClass: "bg-amber-50 text-amber-500",
    },
  ];

  const statusOptions = [
    "All",
    "Shortlisted",
    "In Review",
    "Assessment Pending",
    "Completed",
  ];

  const filteredApplications = useMemo(() => {
    let data = [...applications];

    if (statusFilter !== "All") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.company.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query),
      );
    }

    data.sort((a, b) => {
      if (sortOrder === "Recent") {
        return b.dateValue - a.dateValue;
      }

      return a.dateValue - b.dateValue;
    });

    return data;
  }, [applications, searchQuery, statusFilter, sortOrder]);

  const totalApplications = applications.length;

  const stats = [
    {
      label: "Total",
      mobileLabel: "Total",
      value: 12,
      description: "All applications",
      icon: BriefcaseBusiness,
      iconClass: "bg-indigo-50 text-indigo-600",
      valueClass: "text-slate-900",
      dotClass: "bg-emerald-500",
    },
    {
      label: "In Review",
      mobileLabel: "In Review",
      value: 4,
      description: "Being reviewed",
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-500",
      valueClass: "text-amber-500",
      dotClass: "bg-amber-500",
    },
    {
      label: "Shortlisted",
      mobileLabel: "Shortlisted",
      value: 2,
      description: "Moving forward",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-600",
      valueClass: "text-emerald-600",
      dotClass: "bg-emerald-500",
    },
    {
      label: "Completed",
      mobileLabel: "Completed",
      value: 6,
      description: "Fully processed",
      icon: Check,
      iconClass: "bg-indigo-50 text-indigo-600",
      valueClass: "text-indigo-600",
      dotClass: "bg-indigo-500",
    },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case "Shortlisted":
        return "bg-emerald-100 text-emerald-700";

      case "In Review":
        return "bg-amber-100 text-amber-700";

      case "Assessment Pending":
        return "bg-violet-100 text-violet-700";

      case "Completed":
        return "bg-indigo-50 text-indigo-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "Shortlisted":
        return "bg-emerald-500";

      case "In Review":
        return "bg-amber-500";

      case "Assessment Pending":
        return "bg-violet-500";

      case "Completed":
        return "bg-indigo-500";

      default:
        return "bg-slate-400";
    }
  };

  const getAssessmentClasses = (assessment) => {
    if (typeof assessment === "number") {
      return assessment >= 80 ? "text-indigo-600" : "text-amber-500";
    }

    if (assessment === "Pending") {
      return "bg-amber-100 text-amber-600";
    }

    return "bg-slate-100 text-slate-400";
  };

  const handleAction = (application) => {
    if (application.action === "Continue Assessment") {
      router.push(`/dashboard/student/jobs/${application.id}/assessment`);
      return;
    }

    if (application.action === "View Result") {
      router.push(
        `/dashboard/student/jobs/${application.id}/assessment/result`,
      );
      return;
    }

    router.push(`/dashboard/student/applications/${application.id}`);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 xl:px-8">
        {/* Page Heading */}
        <section className="mb-5">
          <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.5px] text-[#111827] sm:text-[26px]">
            My Applications
          </h1>

          <p className="mt-0.5 text-[14px] leading-5 text-[#64748b]">
            Track your job applications, AI match scores and assessment
            progress.
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-[22px] grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-[14px]">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="min-h-[132px] rounded-[12px] border border-[#dce4ef] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:min-h-[136px] lg:p-5"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${stat.iconClass}`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </div>

                  <span className="hidden pt-1 text-[13px] font-medium text-[#64748b] lg:block">
                    {stat.label}
                  </span>
                </div>

                <div className="mt-2">
                  <div
                    className={`text-[28px] font-bold leading-8 ${stat.valueClass}`}
                  >
                    {stat.value}
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${stat.dotClass}`}
                    />

                    <span className="text-[12px] text-[#64748b]">
                      <span className="lg:hidden">{stat.mobileLabel}</span>

                      <span className="hidden lg:inline">
                        {stat.description}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Search / Filters */}
        <section className="mb-[22px]">
          <div className="flex flex-col gap-2.5 lg:flex-row">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8fa3bd]"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search applications..."
                className="h-[44px] w-full rounded-[9px] border border-[#d9e2ee] bg-white pl-[41px] pr-4 text-[14px] text-[#334155] outline-none transition placeholder:text-[#9aaac0] focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
              />
            </div>

            {/* Desktop Status Filter */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setShowStatusMenu((current) => !current)}
                className="flex h-[44px] min-w-[156px] items-center justify-between gap-3 rounded-[9px] border border-[#d9e2ee] bg-white px-4 text-[14px] text-[#475569] transition hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <Filter size={17} strokeWidth={1.6} />
                  {statusFilter === "All" ? "All Statuses" : statusFilter}
                </span>

                <ChevronDown size={16} strokeWidth={1.6} />
              </button>

              {showStatusMenu && (
                <div className="absolute right-0 top-[49px] z-30 w-[190px] overflow-hidden rounded-[10px] border border-[#dce4ef] bg-white p-1.5 shadow-lg">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusMenu(false);
                      }}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-left text-[13px] transition ${
                        statusFilter === status
                          ? "bg-indigo-50 font-medium text-indigo-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status === "All" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <button
              type="button"
              onClick={() =>
                setSortOrder((current) =>
                  current === "Recent" ? "Oldest" : "Recent",
                )
              }
              className="hidden h-[44px] items-center justify-center gap-2 rounded-[9px] border border-[#d9e2ee] bg-white px-5 text-[14px] text-[#475569] transition hover:bg-slate-50 lg:flex"
            >
              <ArrowUpDown size={17} strokeWidth={1.6} />
              {sortOrder}
            </button>
          </div>

          {/* Mobile Filters */}
          <div className="mt-2.5 grid grid-cols-[1fr_1fr_auto] gap-2 lg:hidden">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusMenu((current) => !current)}
                className="flex h-[40px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#d9e2ee] bg-white text-[13px] font-medium text-[#475569]"
              >
                <Filter size={16} strokeWidth={1.6} />
                Filter
              </button>

              {showStatusMenu && (
                <div className="absolute left-0 top-[45px] z-40 w-[180px] overflow-hidden rounded-[10px] border border-[#dce4ef] bg-white p-1.5 shadow-lg">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusMenu(false);
                      }}
                      className={`flex w-full rounded-md px-3 py-2 text-left text-[13px] ${
                        statusFilter === status
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status === "All" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSortOrder((current) =>
                  current === "Recent" ? "Oldest" : "Recent",
                )
              }
              className="flex h-[40px] items-center justify-center gap-2 rounded-[8px] border border-[#d9e2ee] bg-white text-[13px] font-medium text-[#475569]"
            >
              <ArrowUpDown size={16} strokeWidth={1.6} />
              {sortOrder}
            </button>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("All");
                setSearchQuery("");
              }}
              className={`h-[40px] rounded-full px-4 text-[13px] font-semibold transition ${
                statusFilter === "All" && !searchQuery
                  ? "bg-[#5146e5] text-white"
                  : "border border-[#d9e2ee] bg-white text-slate-600"
              }`}
            >
              All
            </button>
          </div>
        </section>

        {/* Applications Heading */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[#172033]">
                Your Applications
              </h2>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                <span className="lg:hidden">{totalApplications}</span>

                <span className="hidden lg:inline">
                  {totalApplications} applications
                </span>
              </span>
            </div>

            <div className="text-[12px] text-[#71829a]">
              <span className="lg:hidden">Sort: {sortOrder}</span>

              <span className="hidden lg:flex items-center gap-1">
                <ArrowUpDown size={13} strokeWidth={1.5} />
                Sort: {sortOrder}
              </span>
            </div>
          </div>

          {/* Desktop Table Header */}
          <div className="mb-3 hidden h-[36px] items-center rounded-[10px] bg-[#f1f5f9] px-5 lg:grid lg:grid-cols-[2.25fr_1fr_1.15fr_1fr_1fr_1.05fr_1.3fr]">
            <span className="text-[12px] font-medium text-[#60738f]">
              Job / Company
            </span>

            <span className="text-[12px] font-medium text-[#60738f]">
              Applied
            </span>

            <span className="text-[12px] font-medium text-[#60738f]">
              Status
            </span>

            <span className="text-[12px] font-medium text-[#60738f]">
              Resume Match
            </span>

            <span className="text-[12px] font-medium text-[#60738f]">
              Assessment
            </span>

            <span className="text-[12px] font-medium text-[#60738f]">
              Overall Match
            </span>

            <span className="text-[12px] font-medium text-[#60738f]">
              Action
            </span>
          </div>

          {/* Applications */}
          <div className="space-y-2">
            {filteredApplications.length === 0 ? (
              <div className="rounded-[12px] border border-[#dce4ef] bg-white px-5 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                  <Search size={20} />
                </div>

                <h3 className="mt-3 text-[15px] font-semibold text-slate-800">
                  No applications found
                </h3>

                <p className="mt-1 text-[13px] text-slate-500">
                  Try changing your search or filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                  }}
                  className="mt-4 rounded-[8px] bg-indigo-600 px-4 py-2 text-[13px] font-medium text-white"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className="rounded-[12px] border border-[#dce4ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-[#cfd9e7] hover:shadow-[0_3px_10px_rgba(15,23,42,0.04)]"
                >
                  {/* Desktop Row */}
                  <div className="hidden min-h-[72px] items-center px-5 lg:grid lg:grid-cols-[2.25fr_1fr_1.15fr_1fr_1fr_1.05fr_1.3fr]">
                    {/* Job */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold ${application.avatarClass}`}
                      >
                        {application.initials}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-semibold text-[#172033]">
                          {application.title}
                        </h3>

                        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#74859e]">
                          <span>{application.company}</span>

                          <span>•</span>

                          <MapPin size={12} strokeWidth={1.7} />

                          <span>{application.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Applied */}
                    <div className="text-[12px] text-[#71829a]">
                      {application.appliedDate}
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${getStatusClasses(
                          application.status,
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                            application.status,
                          )}`}
                        />

                        {application.status}
                      </span>
                    </div>

                    {/* Resume Match */}
                    <div>
                      <div className="mb-1 text-[15px] font-semibold text-emerald-600">
                        {application.resumeMatch}%
                      </div>

                      <div className="h-[4px] w-[72px] overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${application.resumeMatch}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Assessment */}
                    <div>
                      {typeof application.assessment === "number" ? (
                        <>
                          <div
                            className={`mb-1 text-[15px] font-semibold ${getAssessmentClasses(
                              application.assessment,
                            )}`}
                          >
                            {application.assessment}%
                          </div>

                          <div className="h-[4px] w-[72px] overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${
                                application.assessment >= 80
                                  ? "bg-indigo-500"
                                  : "bg-amber-500"
                              }`}
                              style={{
                                width: `${application.assessment}%`,
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${getAssessmentClasses(
                            application.assessment,
                          )}`}
                        >
                          {application.assessment === "Not Started"
                            ? "Not Started"
                            : "Pending"}
                        </span>
                      )}
                    </div>

                    {/* Overall */}
                    <div>
                      {typeof application.overallMatch === "number" ? (
                        <>
                          <div
                            className={`mb-1 text-[15px] font-semibold ${
                              application.overallMatch >= 85
                                ? "text-emerald-600"
                                : "text-indigo-600"
                            }`}
                          >
                            {application.overallMatch}%
                          </div>

                          <div className="h-[4px] w-[72px] overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${
                                application.overallMatch >= 85
                                  ? "bg-emerald-500"
                                  : "bg-indigo-500"
                              }`}
                              style={{
                                width: `${application.overallMatch}%`,
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <span className="text-[18px] text-[#cbd5e1]">—</span>
                      )}
                    </div>

                    {/* Action */}
                    <div>
                      <button
                        type="button"
                        onClick={() => handleAction(application)}
                        className={`inline-flex px-4 py-2 items-center justify-center gap-1 rounded-[8px] text-[12px] font-semibold transition ${
                          application.action === "Continue Assessment"
                            ? "bg-[#5146e5] text-white hover:bg-[#453bcf]"
                            : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        }`}
                      >
                        {application.action === "Continue Assessment" && (
                          <Play size={13} fill="currentColor" strokeWidth={0} />
                        )}

                        {application.action}

                        {application.action !== "Continue Assessment" && (
                          <ArrowRight size={14} strokeWidth={1.8} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Card */}
                  <div className="p-4 lg:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold ${application.avatarClass}`}
                        >
                          {application.initials}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-[14px] font-semibold text-[#172033]">
                            {application.title}
                          </h3>

                          <p className="mt-0.5 truncate text-[12px] text-[#74859e]">
                            {application.company}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClasses(
                          application.status,
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                            application.status,
                          )}`}
                        />

                        {application.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#71829a]">
                      <MapPin size={12} strokeWidth={1.6} />
                      <span>{application.location}</span>

                      <span className="mx-0.5">•</span>

                      <CalendarDays size={12} strokeWidth={1.6} />
                      <span>Applied {application.appliedDate}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 divide-x divide-[#e5eaf1] rounded-[10px] bg-[#f8fafc] py-2.5">
                      <div className="px-2 text-center">
                        <div className="text-[17px] font-bold text-emerald-600">
                          {application.resumeMatch}%
                        </div>

                        <div className="mt-0.5 text-[9px] text-[#71829a]">
                          Resume Match
                        </div>
                      </div>

                      <div className="px-2 text-center">
                        {typeof application.assessment === "number" ? (
                          <>
                            <div
                              className={`text-[17px] font-bold ${
                                application.assessment >= 80
                                  ? "text-indigo-600"
                                  : "text-amber-500"
                              }`}
                            >
                              {application.assessment}%
                            </div>

                            <div className="mt-0.5 text-[9px] text-[#71829a]">
                              Assessment
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex h-[21px] items-center justify-center">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${
                                  application.assessment === "Pending"
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-amber-100 text-amber-600"
                                }`}
                              >
                                Pending
                              </span>
                            </div>

                            <div className="mt-1 text-[9px] text-[#71829a]">
                              Assessment
                            </div>
                          </>
                        )}
                      </div>

                      <div className="px-2 text-center">
                        {typeof application.overallMatch === "number" ? (
                          <>
                            <div
                              className={`text-[17px] font-bold ${
                                application.overallMatch >= 85
                                  ? "text-emerald-600"
                                  : "text-indigo-600"
                              }`}
                            >
                              {application.overallMatch}%
                            </div>

                            <div className="mt-0.5 text-[9px] text-[#71829a]">
                              Overall Match
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex h-[21px] items-center justify-center text-[18px] text-[#cbd5e1]">
                              —
                            </div>

                            <div className="mt-1 text-[9px] text-[#71829a]">
                              Overall Match
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Mobile Progress Steps */}
                    {application.status === "Shortlisted" && (
                      <div className="mt-3 flex items-center">
                        <div className="flex h-5 items-center rounded-full bg-emerald-100 px-2.5 text-[9px] font-medium text-emerald-600">
                          Applied
                        </div>

                        <div className="h-px flex-1 bg-emerald-200" />

                        <div className="flex h-5 items-center rounded-full bg-emerald-100 px-2.5 text-[9px] font-medium text-emerald-600">
                          AI Analysis
                        </div>

                        <div className="h-px flex-1 bg-emerald-200" />

                        <div className="flex h-5 items-center rounded-full bg-emerald-100 px-2.5 text-[9px] font-medium text-emerald-600">
                          Assessment
                        </div>

                        <div className="h-px flex-1 bg-emerald-200" />

                        <div className="flex h-5 items-center rounded-full bg-emerald-100 px-2.5 text-[9px] font-medium text-emerald-600">
                          Completed
                        </div>
                      </div>
                    )}

                    {/* Mobile Action */}
                    <button
                      type="button"
                      onClick={() => handleAction(application)}
                      className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-[9px] px-4 py-2 text-[13px] font-semibold transition ${
                        application.action === "Continue Assessment"
                          ? "bg-[#5146e5] text-white hover:bg-[#453bcf]"
                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      }`}
                    >
                      {application.action === "Continue Assessment" && (
                        <Play
                          size={13}
                          fill="currentColor"
                          strokeWidth={0}
                          className="shrink-0"
                        />
                      )}

                      <span>{application.action}</span>

                      {application.action !== "Continue Assessment" && (
                        <ArrowRight
                          size={15}
                          strokeWidth={1.8}
                          className="shrink-0"
                        />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
