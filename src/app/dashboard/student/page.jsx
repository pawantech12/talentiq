"use client";

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
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboardPage() {
  const stats = [
    {
      label: "APPLICATIONS",
      value: "12",
      description: "Total submitted",
      icon: BriefcaseBusiness,
      type: "blue",
    },
    {
      label: "SHORTLISTED",
      value: "3",
      description: "Active shortlists",
      icon: CheckCircle2,
      type: "green",
    },
    {
      label: "ASSESSMENTS",
      value: "5",
      description: "Completed",
      icon: ClipboardCheck,
      type: "purple",
    },
    {
      label: "AVERAGE MATCH",
      value: "82%",
      description: "Across all jobs",
      icon: Target,
      type: "blue",
    },
  ];

  const jobs = [
    {
      companyInitials: "AT",
      companyColor: "blue",
      title: "Full Stack Developer",
      company: "ABC Technologies",
      location: "Mumbai",
      type: "Full-time",
      experience: "0–2 Years",
      match: "91% Match",
      skills: ["React", "Node.js", "MongoDB"],
      primary: true,
    },
    {
      companyInitials: "TN",
      companyColor: "purple",
      title: "Frontend Developer",
      company: "TechNova Solutions",
      location: "Thane",
      type: "Full-time",
      experience: "0–2 Years",
      match: "86% Match",
      skills: ["React", "JavaScript", "Tailwind CSS"],
      primary: false,
    },
    {
      companyInitials: "CS",
      companyColor: "green",
      title: "Node.js Developer",
      company: "CodeSphere",
      location: "Mumbai",
      type: "Full-time",
      experience: "0–2 Years",
      match: "82% Match",
      skills: ["Node.js", "Express", "MongoDB"],
      primary: false,
    },
  ];

  const applications = [
    {
      initials: "AT",
      color: "blue",
      job: "Full Stack Developer",
      company: "ABC Technologies",
      applied: "2 days ago",
      match: "86%",
      status: "Shortlisted",
      statusType: "green",
    },
    {
      initials: "TN",
      color: "purple",
      job: "React Developer",
      company: "TechNova Solutions",
      applied: "5 days ago",
      match: "78%",
      status: "Under Review",
      statusType: "yellow",
    },
    {
      initials: "CS",
      color: "green",
      job: "Backend Developer",
      company: "CodeSphere",
      applied: "1 week ago",
      match: "81%",
      status: "Applied",
      statusType: "blue",
    },
  ];

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
  };

  return (
    <div className="min-h-[calc(100vh-58px)] bg-[#F8FAFC] px-8 py-7 max-sm:p-5">
      <div className="mx-auto">
        {/* Greeting */}
        <div>
          <h1 className="text-[20px] font-[700] leading-[25px] tracking-[-0.35px] text-[#111827] md:text-[21px]">
            Good morning, Rahul 👋
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
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                  group
                  flex
                  min-h-[82px]
                  items-center
                  gap-[13px]
                  rounded-[12px]
                  border
                  border-[#DCE4EE]
                  bg-white
                  px-[16px]
                  py-[13px]
                  shadow-[0_2px_5px_rgba(15,23,42,0.025)]
                  transition-all
                  duration-200
                  ease-out
                  hover:-translate-y-[2px]
                  hover:border-[#CBD5E1]
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
                      stat.value === "82%" ? "text-[#5146E5]" : "text-[#111827]"
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
          })}
        </section>

        {/* Main Content */}
        <div className="mt-[20px] grid grid-cols-1 gap-[18px] lg:grid-cols-[minmax(0,1fr)_288px]">
          {/* Recommended Jobs */}
          <div className="min-w-0">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-[16px] font-[700] leading-[20px] tracking-[-0.25px] text-[#111827]">
                  Recommended Jobs
                </h2>

                <p className="mt-[2px] hidden text-[11px] leading-[16px] text-[#71839E] md:block">
                  Opportunities that match your skills and profile.
                </p>
              </div>

              <a
                href="#jobs"
                className="
                  group
                  flex
                  items-center
                  gap-[4px]
                  text-[12px]
                  font-[600]
                  text-[#5146E5]
                  transition-colors
                  duration-200
                  hover:text-[#4338CA]
                "
              >
                <span className="md:hidden">See all</span>
                <span className="hidden md:inline">See all jobs</span>

                <ArrowRight
                  size={14}
                  strokeWidth={1.8}
                  className="transition-transform duration-200 group-hover:translate-x-[2px]"
                />
              </a>
            </div>

            <div className="mt-[12px] space-y-[12px]">
              {jobs.map((job) => (
                <article
                  key={job.title}
                  className="
                    group
                    rounded-[13px]
                    border
                    border-[#DCE4EE]
                    bg-white
                    px-[17px]
                    py-[17px]
                    shadow-[0_2px_5px_rgba(15,23,42,0.02)]
                    transition-all
                    duration-200
                    ease-out
                    hover:-translate-y-[2px]
                    hover:border-[#CBD5E1]
                    hover:shadow-[0_10px_25px_rgba(15,23,42,0.07)]
                  "
                >
                  <div className="flex items-start justify-between gap-[15px]">
                    <div className="flex min-w-0 items-start gap-[10px]">
                      <div
                        className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] text-[12px] font-[700] transition-transform duration-200 group-hover:scale-[1.05] ${avatarClasses[job.companyColor]}`}
                      >
                        {job.companyInitials}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-[700] leading-[18px] text-[#111827] transition-colors duration-200 group-hover:text-[#5146E5]">
                          {job.title}
                        </h3>

                        <p className="mt-[1px] text-[12px] leading-[16px] text-[#71839E]">
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
                      {job.match}
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
                    {job.skills.map((skill) => (
                      <span
                        key={skill}
                        className="
                          inline-flex
                          h-[22px]
                          items-center
                          rounded-full
                          bg-[#EEF1FF]
                          px-[11px]
                          text-[10px]
                          font-[600]
                          leading-none
                          text-[#5146E5]
                          transition-all
                          duration-150
                          hover:-translate-y-[1px]
                          hover:bg-[#E5E8FF]
                        "
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className={`mt-[12px] h-[32px] w-full rounded-[7px] px-[20px] text-[12px] font-[600] transition-all duration-200 active:scale-[0.98] md:w-auto 
                        border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#C7D0DE] hover:bg-[#4F46E5] hover:text-white
                    `}
                  >
                    View Job
                  </button>
                </article>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden space-y-[18px] lg:block">
            {/* Career Insight */}
            <aside
              className="
                group
                rounded-[13px]
                border
                border-[#E4D9FF]
                bg-[#F5F1FF]
                p-[20px]
                transition-all
                duration-200
                hover:-translate-y-[2px]
                hover:border-[#D8C8FF]
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

                <p className="mt-[4px] text-[25px] font-[700] leading-[28px] tracking-[-0.5px] text-[#7C3AED]">
                  Express.js
                </p>

                <p className="mt-[7px] text-[11px] leading-[17px] text-[#52627B]">
                  Improving your Express.js knowledge could increase your match
                  with backend and full-stack roles.
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
                    Practice Express.js concepts before your next application.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="
                  group/button
                  mt-[18px]
                  flex
                  h-[38px]
                  w-full
                  items-center
                  justify-center
                  gap-[8px]
                  rounded-[7px]
                  bg-[#7C3AED]
                  text-[12px]
                  font-[600]
                  text-white
                  transition-all
                  duration-200
                  hover:bg-[#6D28D9]
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
              </button>
            </aside>

            {/* Resume Score */}
            <aside
              className="
                group
                rounded-[13px]
                border
                border-[#DCE4EE]
                bg-white
                p-[20px]
                transition-all
                duration-200
                hover:-translate-y-[2px]
                hover:border-[#CBD5E1]
                hover:shadow-[0_10px_25px_rgba(15,23,42,0.07)]
              "
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-[700] text-[#111827]">
                  Resume Score
                </h3>

                <span className="rounded-full bg-[#FFF2C8] px-[10px] py-[4px] text-[9px] font-[600] text-[#D99600] transition-colors duration-200 group-hover:bg-[#FFEDB0]">
                  Update suggested
                </span>
              </div>

              <div className="mt-[15px] flex items-center gap-[18px]">
                <div className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border-[6px] border-[#EEF0FF] transition-transform duration-300 group-hover:scale-[1.04]">
                  <div className="absolute inset-[-6px] rotate-[20deg] rounded-full border-[6px] border-transparent border-b-[#5146E5] border-l-[#5146E5]" />

                  <span className="text-[13px] font-[700] text-[#111827]">
                    82%
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-[8px]">
                  {[
                    {
                      label: "Skills",
                      value: "85%",
                      width: "85%",
                      green: false,
                    },
                    {
                      label: "Experience",
                      value: "78%",
                      width: "78%",
                      green: false,
                    },
                    {
                      label: "Education",
                      value: "100%",
                      width: "100%",
                      green: true,
                    },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-[#71839E]">
                          {metric.label}
                        </span>

                        <span
                          className={`text-[10px] font-[600] ${
                            metric.green ? "text-[#0BA65A]" : "text-[#5146E5]"
                          }`}
                        >
                          {metric.value}
                        </span>
                      </div>

                      <div className="mt-[3px] h-[5px] overflow-hidden rounded-full bg-[#E9EDF5]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            metric.green ? "bg-[#0BA65A]" : "bg-[#5146E5]"
                          }`}
                          style={{ width: metric.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Recent Applications */}
        <section className="mt-[24px] hidden md:block">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-[17px] font-[700] leading-[21px] tracking-[-0.3px] text-[#111827]">
                Recent Applications
              </h2>

              <p className="mt-[2px] text-[11px] leading-[16px] text-[#71839E]">
                Your latest job applications and their current status.
              </p>
            </div>

            <Link
              href="#applications"
              className="
                group
                flex
                items-center
                gap-[4px]
                text-[11px]
                font-[600]
                text-[#5146E5]
                transition-colors
                duration-200
                hover:text-[#4338CA]
              "
            >
              View all
              <ArrowRight
                size={14}
                strokeWidth={1.8}
                className="transition-transform duration-200 group-hover:translate-x-[2px]"
              />
            </Link>
          </div>

          <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#DCE4EE] bg-white shadow-[0_2px_5px_rgba(15,23,42,0.015)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E3E8F0] bg-[#F8FAFC]">
                  {["Job", "Company", "Applied", "Match", "Status"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-[18px] py-[11px] text-left text-xs font-semibold text-[#64748B]"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.job}
                    className="
                      group
                      border-b
                      border-[#E3E8F0]
                      last:border-b-0
                      transition-colors
                      duration-150
                      hover:bg-[#F8FAFC]
                    "
                  >
                    <td className="px-[18px] py-[10px]">
                      <div className="flex items-center gap-[9px]">
                        <div
                          className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[8px] text-[12px] font-[700] transition-transform duration-200 group-hover:scale-[1.04] ${avatarClasses[application.color]}`}
                        >
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

                    <td className="px-[18px] py-[10px] text-[11px] text-[#71839E]">
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
                      <span
                        className={`inline-flex items-center gap-[5px] rounded-full px-[10px] py-[5px] text-[10px] font-[600] transition-transform duration-150 group-hover:scale-[1.02] ${statusClasses[application.statusType]}`}
                      >
                        <span className="h-[4px] w-[4px] rounded-full bg-current" />
                        {application.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
