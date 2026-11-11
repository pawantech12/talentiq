"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  Lightbulb,
  MapPin,
  Sparkles,
  Target,
  RefreshCw,
} from "lucide-react";

const EMPTY_DASHBOARD = {
  student: { firstName: "Student" },
  stats: {
    applications: 0,
    shortlisted: 0,
    assessments: 0,
    averageMatch: 0,
  },
  recommendedJobs: [],
  applications: [],
  careerInsight: {
    topSkillGap: "Technical skills",
    recommendedAction: "Keep developing your technical skills.",
  },
  resume: {
    score: null,
    breakdown: {
      skills: null,
      experience: null,
      education: null,
    },
  },
};

const iconClasses = {
  blue: "bg-[#EEF1FF] text-[#5146E5]",
  green: "bg-[#DDF9E9] text-[#08A95A]",
  purple: "bg-[#F0E9FF] text-[#7C3AED]",
};

const avatarClasses = {
  blue: "bg-[#EEF1FF] text-[#5146E5]",
  purple: "bg-[#F2ECFF] text-[#7C3AED]",
  green: "bg-[#DDF9E9] text-[#079A53]",
};

const statusClasses = {
  green: "bg-[#DDF9E9] text-[#079A53]",
  yellow: "bg-[#FFF1C5] text-[#E59A00]",
  blue: "bg-[#EEF0FF] text-[#5146E5]",
  red: "bg-[#FEE2E2] text-[#DC2626]",
};

function getInitials(value = "") {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "JB"
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div
      className="
        group flex min-h-[82px] items-center gap-[13px]
        rounded-[12px] border border-[#DCE4EE] bg-white
        px-[16px] py-[13px]
        shadow-[0_2px_5px_rgba(15,23,42,0.025)]
        transition-all duration-200 ease-out
        hover:-translate-y-[2px] hover:border-[#CBD5E1]
        hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]
      "
    >
      <div
        className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[9px] transition-transform duration-200 group-hover:scale-[1.04] ${iconClasses[stat.type]}`}
      >
        <Icon size={20} strokeWidth={1.7} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-[700] leading-[12px] text-[#71839E]">
          {stat.label}
        </p>

        <p
          className={`mt-[1px] text-[27px] font-[700] leading-[29px] tracking-[-0.7px] ${
            stat.highlight ? "text-[#5146E5]" : "text-[#111827]"
          }`}
        >
          {stat.value}
        </p>

        <p className="mt-[1px] text-[10px] leading-[14px] text-[#9AACBF]">
          {stat.description}
        </p>
      </div>
    </div>
  );
}

function SectionHeading({ title, description, href, linkText }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[16px] font-[700] leading-[20px] tracking-[-0.25px] text-[#111827]">
          {title}
        </h2>

        {description && (
          <p className="mt-[2px] hidden text-[11px] leading-[16px] text-[#71839E] md:block">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="
            group flex shrink-0 items-center gap-[4px]
            text-[12px] font-[600] text-[#5146E5]
            transition-colors duration-200 hover:text-[#4338CA]
          "
        >
          <span className="md:hidden">See all</span>
          <span className="hidden md:inline">{linkText || "See all"}</span>

          <ArrowRight
            size={14}
            strokeWidth={1.8}
            className="transition-transform duration-200 group-hover:translate-x-[2px]"
          />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ title, description, href, linkText }) {
  return (
    <div className="rounded-[13px] border border-dashed border-[#CBD5E1] bg-white px-5 py-9 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF1FF] text-[#5146E5]">
        <BriefcaseBusiness size={20} />
      </div>

      <p className="mt-3 text-[13px] font-[700] text-[#273149]">{title}</p>

      <p className="mx-auto mt-1 max-w-[340px] text-[11px] leading-[17px] text-[#71839E]">
        {description}
      </p>

      {href && (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 rounded-[7px] bg-[#5146E5] px-4 py-2 text-[11px] font-[600] text-white transition-colors hover:bg-[#4338CA]"
        >
          {linkText}
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function JobCard({ job }) {
  const color = avatarClasses[job.companyColor] ? job.companyColor : "blue";

  return (
    <article
      className="
        group rounded-[13px] border border-[#DCE4EE] bg-white
        px-[17px] py-[17px]
        shadow-[0_2px_5px_rgba(15,23,42,0.02)]
        transition-all duration-200 ease-out
        hover:-translate-y-[2px] hover:border-[#CBD5E1]
        hover:shadow-[0_10px_25px_rgba(15,23,42,0.07)]
      "
    >
      <div className="flex items-start justify-between gap-[15px]">
        <div className="flex min-w-0 items-start gap-[10px]">
          <div
            className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] text-[12px] font-[700] transition-transform duration-200 group-hover:scale-[1.05] ${avatarClasses[color]}`}
          >
            {job.companyInitials || getInitials(job.company)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-[700] leading-[18px] text-[#111827] transition-colors duration-200 group-hover:text-[#5146E5]">
              {job.title}
            </h3>

            <p className="mt-[1px] truncate text-[12px] leading-[16px] text-[#71839E]">
              {job.company}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex h-[27px] shrink-0 items-center gap-[5px] rounded-full px-[10px] text-[12px] font-[700] transition-transform duration-200 group-hover:scale-[1.03] ${
            job.companyColor === "green"
              ? "bg-[#DDF9E9] text-[#079A53]"
              : "bg-[#EEF0FF] text-[#5146E5]"
          }`}
        >
          <Sparkles size={13} strokeWidth={1.8} />
          {job.match}% Match
        </span>
      </div>

      <div className="mt-[13px] flex flex-wrap items-center gap-x-[15px] gap-y-[6px] text-[11px] text-[#71839E]">
        <span className="flex items-center gap-[4px] transition-colors duration-200 group-hover:text-[#52627B]">
          <MapPin size={13} strokeWidth={1.6} />
          {job.location}
        </span>

        <span className="flex items-center gap-[4px] transition-colors duration-200 group-hover:text-[#52627B]">
          <Clock3 size={13} strokeWidth={1.6} />
          {job.type}
        </span>

        <span className="hidden items-center gap-[4px] transition-colors duration-200 group-hover:text-[#52627B] md:flex">
          <BarChart3 size={13} strokeWidth={1.6} />
          {job.experience}
        </span>
      </div>

      <div className="mt-[10px] flex flex-wrap gap-[8px]">
        {(job.skills || []).map((skill) => (
          <span
            key={skill}
            className="
              inline-flex min-h-[22px] items-center rounded-full
              bg-[#EEF1FF] px-[11px] py-1
              text-[10px] font-[600] leading-none text-[#5146E5]
              transition-all duration-150 hover:-translate-y-[1px]
              hover:bg-[#E5E8FF]
            "
          >
            {skill}
          </span>
        ))}
      </div>

      <Link
        href={`/dashboard/student/jobs/${job.id}`}
        className="
          mt-[12px] inline-flex h-[32px] w-full items-center
          justify-center rounded-[7px] border border-[#E2E8F0]
          bg-white px-[20px] text-[12px] font-[600] text-[#475569]
          transition-all duration-200 hover:border-[#4F46E5]
          hover:bg-[#4F46E5] hover:text-white active:scale-[0.98]
          md:w-auto
        "
      >
        View Job
      </Link>
    </article>
  );
}

function ApplicationStatus({ application }) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-full px-[10px] py-[5px] text-[10px] font-[600] ${
        statusClasses[application.statusType] || statusClasses.blue
      }`}
    >
      <span className="h-[4px] w-[4px] rounded-full bg-current" />
      {application.status}
    </span>
  );
}

function ApplicationMobileCard({ application }) {
  return (
    <article className="rounded-[11px] border border-[#DCE4EE] bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] bg-[#EEF1FF] text-[12px] font-[700] text-[#5146E5]">
            {application.initials || getInitials(application.company)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-[12px] font-[700] text-[#273149]">
              {application.job}
            </p>
            <p className="truncate text-[11px] text-[#71839E]">
              {application.company}
            </p>
          </div>
        </div>

        <ApplicationStatus application={application} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF1F5] pt-3">
        <span className="flex items-center gap-1 text-[10px] text-[#71839E]">
          <Clock3 size={12} />
          {application.applied}
        </span>

        <span className="flex items-center gap-1 text-[11px] font-[700] text-[#5146E5]">
          <Target size={12} />
          {application.match} Match
        </span>
      </div>
    </article>
  );
}

function ResumeScoreCard({ resume }) {
  const metrics = [
    { label: "Skills", value: resume.breakdown.skills },
    { label: "Experience", value: resume.breakdown.experience },
    { label: "Education", value: resume.breakdown.education },
  ];

  return (
    <aside
      className="
        group rounded-[13px] border border-[#DCE4EE] bg-white p-[20px]
        transition-all duration-200 hover:-translate-y-[2px]
        hover:border-[#CBD5E1] hover:shadow-[0_10px_25px_rgba(15,23,42,0.07)]
      "
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[14px] font-[700] text-[#111827]">Resume Score</h3>

        <span className="rounded-full bg-[#FFF2C8] px-[10px] py-[4px] text-[9px] font-[600] text-[#D99600] transition-colors duration-200 group-hover:bg-[#FFEDB0]">
          {resume.score === null ? "No analysis yet" : "Latest analysis"}
        </span>
      </div>

      <div className="mt-[15px] flex items-center gap-[18px]">
        <div className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border-[6px] border-[#EEF0FF] transition-transform duration-300 group-hover:scale-[1.04]">
          {resume.score !== null && (
            <div
              className="absolute inset-[-6px] rounded-full border-[6px] border-transparent border-b-[#5146E5] border-l-[#5146E5]"
              style={{
                transform: `rotate(${Math.round((resume.score / 100) * 360)}deg)`,
              }}
            />
          )}

          <span className="text-[13px] font-[700] text-[#111827]">
            {resume.score === null ? "—" : `${resume.score}%`}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-[8px]">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between">
                <span className="text-[10px] text-[#71839E]">
                  {metric.label}
                </span>

                <span className="text-[10px] font-[600] text-[#5146E5]">
                  {metric.value === null ? "—" : `${metric.value}%`}
                </span>
              </div>

              <div className="mt-[3px] h-[5px] overflow-hidden rounded-full bg-[#E9EDF5]">
                <div
                  className="h-full rounded-full bg-[#5146E5] transition-all duration-500"
                  style={{ width: `${metric.value ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/dashboard/student/profile"
        className="mt-4 inline-flex text-[11px] font-[600] text-[#5146E5] hover:text-[#4338CA]"
      >
        Update your profile <ArrowRight size={13} className="ml-1" />
      </Link>
    </aside>
  );
}

export default function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get("/api/student/dashboard", {
        withCredentials: true,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load your dashboard.",
        );
      }

      setDashboard({
        ...EMPTY_DASHBOARD,
        ...response.data,
        stats: {
          ...EMPTY_DASHBOARD.stats,
          ...response.data.stats,
        },
        resume: {
          ...EMPTY_DASHBOARD.resume,
          ...response.data.resume,
          breakdown: {
            ...EMPTY_DASHBOARD.resume.breakdown,
            ...response.data.resume?.breakdown,
          },
        },
      });
    } catch (err) {
      console.error("Student dashboard fetch error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = [
    {
      label: "APPLICATIONS",
      value: dashboard.stats.applications,
      description: "Total submitted",
      icon: BriefcaseBusiness,
      type: "blue",
    },
    {
      label: "SHORTLISTED",
      value: dashboard.stats.shortlisted,
      description: "Active shortlists",
      icon: CheckCircle2,
      type: "green",
    },
    {
      label: "ASSESSMENTS",
      value: dashboard.stats.assessments,
      description: "Completed",
      icon: ClipboardCheck,
      type: "purple",
    },
    {
      label: "AVERAGE MATCH",
      value: `${dashboard.stats.averageMatch}%`,
      description: "Across all jobs",
      icon: Target,
      type: "blue",
      highlight: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] px-8 py-7 max-sm:p-5">
        <div className="animate-pulse">
          <div className="h-6 w-52 rounded bg-[#E2E8F0]" />
          <div className="mt-2 h-3 w-72 max-w-full rounded bg-[#E2E8F0]" />

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[82px] rounded-[12px] border border-[#DCE4EE] bg-white"
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_288px]">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[155px] rounded-[13px] border border-[#DCE4EE] bg-white"
                />
              ))}
            </div>
            <div className="hidden space-y-4 lg:block">
              <div className="h-[270px] rounded-[13px] bg-[#E2E8F0]" />
              <div className="h-[190px] rounded-[13px] bg-[#E2E8F0]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-58px)] items-center justify-center bg-[#F8FAFC] px-5 py-10">
        <div className="w-full max-w-md rounded-[14px] border border-[#DCE4EE] bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEE2E2] text-[#DC2626]">
            <RefreshCw size={21} />
          </div>

          <h2 className="mt-4 text-[16px] font-[700] text-[#111827]">
            Could not load dashboard
          </h2>

          <p className="mt-2 text-[12px] leading-5 text-[#71839E]">{error}</p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-[600] text-white transition-colors hover:bg-[#4338CA]"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] px-8 py-7 max-sm:p-5">
      <div className="mx-auto">
        {/* Greeting */}
        <div>
          <h1 className="text-[20px] font-[700] leading-[25px] tracking-[-0.35px] text-[#111827] md:text-[21px]">
            Good morning, {dashboard.student.firstName} 👋
          </h1>

          <p className="mt-[2px] max-w-[650px] text-[12px] leading-[18px] text-[#71839E]">
            <span className="md:hidden">
              Track your applications and improve your career readiness.
            </span>

            <span className="hidden md:inline">
              Stay on top of your applications and continue improving your
              career readiness.
            </span>
          </p>
        </div>

        {/* Stats */}
        <section className="mt-[20px] grid grid-cols-2 gap-[12px] md:mt-[19px] md:grid-cols-4 md:gap-[15px]">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>

        {/* Main Content */}
        <div className="mt-[20px] grid grid-cols-1 gap-[18px] lg:grid-cols-[minmax(0,1fr)_288px]">
          {/* Recommended Jobs */}
          <div className="min-w-0">
            <SectionHeading
              title="Recommended Jobs"
              description="Opportunities that match your skills and profile."
              href="/dashboard/student/jobs"
              linkText="See all jobs"
            />

            <div className="mt-[12px] space-y-[12px]">
              {dashboard.recommendedJobs.length > 0 ? (
                dashboard.recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))
              ) : (
                <EmptyState
                  title="No recommended jobs yet"
                  description="There are no new active jobs to recommend right now. Check back soon for new opportunities."
                  href="/dashboard/student/jobs"
                  linkText="Browse all jobs"
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden space-y-[18px] lg:block">
            {/* Career Insight */}
            <aside
              className="
                group rounded-[13px] border border-[#E4D9FF]
                bg-[#F5F1FF] p-[20px]
                transition-all duration-200
                hover:-translate-y-[2px] hover:border-[#D8C8FF]
                hover:shadow-[0_10px_25px_rgba(124,58,237,0.08)]
              "
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[9px]">
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[#ECE3FF] text-[#7C3AED] transition-transform duration-200 group-hover:scale-[1.05]">
                    <Sparkles size={16} strokeWidth={1.8} />
                  </span>

                  <h3 className="text-[14px] font-[700] text-[#111827]">
                    AI Career Insight
                  </h3>
                </div>

                <span className="rounded-full bg-[#ECE3FF] px-[10px] py-[4px] text-[9px] font-[700] text-[#7C3AED]">
                  AI
                </span>
              </div>

              <div className="mt-[17px] rounded-[9px] border border-[#E6DFF4] bg-white px-[13px] py-[13px] transition-shadow duration-200 group-hover:shadow-[0_3px_10px_rgba(124,58,237,0.05)]">
                <p className="text-[10px] text-[#71839E]">Your top skill gap</p>

                <p className="mt-[4px] break-words text-[25px] font-[700] leading-[28px] tracking-[-0.5px] text-[#7C3AED]">
                  {dashboard.careerInsight.topSkillGap}
                </p>

                <p className="mt-[7px] text-[11px] leading-[17px] text-[#52627B]">
                  Improving this skill could increase your match with relevant
                  job opportunities.
                </p>
              </div>

              <div className="mt-[17px]">
                <p className="text-[10px] font-[600] text-[#71839E]">
                  Recommended action
                </p>

                <div className="mt-[6px] flex items-start gap-[8px]">
                  <span className="flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-[7px] bg-[#ECE3FF] text-[#7C3AED] transition-transform duration-200 group-hover:scale-[1.05]">
                    <Lightbulb size={15} strokeWidth={1.7} />
                  </span>

                  <p className="text-[11px] font-[600] leading-[16px] text-[#273149]">
                    {dashboard.careerInsight.recommendedAction}
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/student/jobs"
                className="
                  group/button mt-[18px] flex h-[38px] w-full
                  items-center justify-center gap-[8px] rounded-[7px]
                  bg-[#7C3AED] text-[12px] font-[600] text-white
                  transition-all duration-200 hover:bg-[#6D28D9]
                  hover:shadow-[0_5px_12px_rgba(124,58,237,0.2)]
                  active:scale-[0.98]
                "
              >
                <ArrowRight
                  size={15}
                  strokeWidth={1.8}
                  className="transition-transform duration-200 group-hover/button:translate-x-[2px]"
                />
                Improve Skills
              </Link>
            </aside>

            {/* Resume Score */}
            <ResumeScoreCard resume={dashboard.resume} />
          </div>
        </div>

        {/* Resume and career insight on smaller screens */}
        <div className="mt-[18px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:hidden">
          <aside className="rounded-[13px] border border-[#E4D9FF] bg-[#F5F1FF] p-[17px]">
            <div className="flex items-center gap-2">
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[#ECE3FF] text-[#7C3AED]">
                <Sparkles size={16} />
              </span>
              <h3 className="text-[14px] font-[700] text-[#111827]">
                AI Career Insight
              </h3>
            </div>

            <p className="mt-3 text-[10px] text-[#71839E]">
              Your top skill gap
            </p>

            <p className="mt-1 text-[21px] font-[700] text-[#7C3AED]">
              {dashboard.careerInsight.topSkillGap}
            </p>

            <p className="mt-2 text-[11px] leading-[17px] text-[#52627B]">
              {dashboard.careerInsight.recommendedAction}
            </p>

            <Link
              href="/dashboard/student/jobs"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-[600] text-[#7C3AED]"
            >
              Improve Skills <ArrowRight size={13} />
            </Link>
          </aside>

          <ResumeScoreCard resume={dashboard.resume} />
        </div>

        {/* Recent Applications */}
        <section className="mt-[24px]">
          <SectionHeading
            title="Recent Applications"
            description="Your latest job applications and their current status."
            href="/dashboard/student/applications"
            linkText="View all"
          />

          {dashboard.applications.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="mt-[12px] hidden overflow-hidden rounded-[12px] border border-[#DCE4EE] bg-white shadow-[0_2px_5px_rgba(15,23,42,0.015)] md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#E3E8F0] bg-[#F8FAFC]">
                        {["Job", "Company", "Applied", "Match", "Status"].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="whitespace-nowrap px-[18px] py-[11px] text-left text-xs font-semibold text-[#64748B]"
                            >
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {dashboard.applications.map((application) => (
                        <tr
                          key={application.id}
                          className="
                            group border-b border-[#E3E8F0]
                            last:border-b-0 transition-colors duration-150
                            hover:bg-[#F8FAFC]
                          "
                        >
                          <td className="px-[18px] py-[10px]">
                            <div className="flex items-center gap-[9px]">
                              <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] bg-[#EEF1FF] text-[12px] font-[700] text-[#5146E5] transition-transform duration-200 group-hover:scale-[1.04]">
                                {application.initials}
                              </div>

                              <span className="text-[12px] font-[600] text-[#273149] transition-colors duration-150 group-hover:text-[#5146E5]">
                                {application.job}
                              </span>
                            </div>
                          </td>

                          <td className="px-[18px] py-[10px] text-[12px] text-[#52627B]">
                            {application.company}
                          </td>

                          <td className="whitespace-nowrap px-[18px] py-[10px] text-[11px] text-[#71839E]">
                            <span className="flex items-center gap-[4px]">
                              <Clock3 size={12} />
                              {application.applied}
                            </span>
                          </td>

                          <td className="px-[18px] py-[10px] text-[12px] font-[700] text-[#5146E5]">
                            <span className="flex items-center gap-[4px]">
                              <Target size={12} />
                              {application.match}
                            </span>
                          </td>

                          <td className="px-[18px] py-[10px]">
                            <ApplicationStatus application={application} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile cards */}
              <div className="mt-[12px] space-y-2 md:hidden">
                {dashboard.applications.map((application) => (
                  <ApplicationMobileCard
                    key={application.id}
                    application={application}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-[12px]">
              <EmptyState
                title="No applications yet"
                description="When you apply for jobs, your latest applications and their status will appear here."
                href="/dashboard/student/jobs"
                linkText="Explore jobs"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
