"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  GraduationCap,
  Info,
  MapPin,
  BarChart3,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function JobDetailsPage() {
  // getting id from [id] parameter using nextjs
  const { id } = useParams();

  const [saved, setSaved] = useState(false);
  const [showSkillGap, setShowSkillGap] = useState(true);
  const [showAiInsight, setShowAiInsight] = useState(true);

  const job = {
    initials: "AT",
    title: "Full Stack Developer",
    company: "ABC Technologies",
    location: "Mumbai",
    type: "Full-time",
    experience: "0–2 Years",
    posted: "Posted 2 days ago",
    match: 86,

    description:
      "We are looking for a motivated Full Stack Developer to build and maintain modern web applications. The role involves working with frontend and backend technologies and collaborating on scalable web solutions.",

    responsibilities: [
      "Develop responsive web applications",
      "Build reusable frontend components",
      "Develop REST APIs and backend services",
      "Work with databases and backend services",
      "Debug and improve application performance",
      "Collaborate with the development team",
    ],

    skills: [
      "React",
      "JavaScript",
      "Node.js",
      "Express.js",
      "MongoDB",
      "REST APIs",
    ],

    jobInfo: {
      location: "Mumbai",
      employmentType: "Full-time",
      experience: "0–2 Years",
      education: "MCA / BCA / B.Sc",
      industry: "Information Technology",
    },

    matchDetails: {
      skill: 85,
      experience: 100,
      education: 100,
      profile: 80,
    },

    matchedSkills: ["React", "JavaScript", "Node.js", "MongoDB"],

    skillGap: "Express.js",
  };

  const toggleSaved = () => {
    setSaved((previous) => !previous);
  };

  const scoreRadius = 30;
  const scoreCircumference = 2 * Math.PI * scoreRadius;
  const scoreOffset =
    scoreCircumference - (job.match / 100) * scoreCircumference;

  return (
    <section className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_340px] lg:gap-4">
          {/* =====================================================
              JOB HEADER
          ====================================================== */}
          <article className="order-1 rounded-[14px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5 lg:col-span-2 lg:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Job identity */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[9px] border border-[#DCE3EE] bg-[#EEF2FF] text-[17px] font-bold text-[#4F46E5]">
                  {job.initials}
                </div>

                <div className="min-w-0">
                  <h1 className="text-[19px] font-bold leading-6 tracking-[-0.02em] text-[#111827] sm:text-[20px]">
                    {job.title}
                  </h1>

                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#64748B]">
                    <Building2 size={14} strokeWidth={1.7} />
                    {job.company}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5">
                {/* Save */}
                <button
                  type="button"
                  onClick={toggleSaved}
                  aria-label={saved ? "Unsave job" : "Save job"}
                  aria-pressed={saved}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border bg-white transition ${
                    saved
                      ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#DCE3EE] text-[#71829B] hover:border-[#C7D2FE] hover:text-[#4F46E5]"
                  }`}
                >
                  {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                </button>

                {/* Apply */}
                <Link
                  href={`/student/jobs/${id}/apply`}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#4338CA] sm:flex-none sm:px-6"
                >
                  Apply Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Job metadata */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <MapPin size={13} strokeWidth={1.7} />
                {job.location}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <Clock3 size={13} strokeWidth={1.7} />
                {job.type}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <BarChart3 size={13} strokeWidth={1.7} />
                {job.experience}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <CalendarDays size={13} strokeWidth={1.7} />
                {job.posted}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1.5 text-[12px] font-semibold text-[#16A34A]">
                <Sparkles size={12} />
                {job.match}% AI Match
              </span>
            </div>
          </article>

          {/* =====================================================
              AI RESUME MATCH
          ====================================================== */}
          <aside className="order-2 rounded-[14px] border border-[#E5DEFF] bg-[#F7F3FF] p-4 shadow-[0_2px_8px_rgba(124,58,237,0.05)] lg:col-start-2 lg:row-start-2 lg:p-5">
            {/* Heading */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#EDE9FE] text-[#7C3AED]">
                  <Sparkles size={16} />
                </div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  AI Resume Match
                </h2>
              </div>

              <span className="rounded-full bg-[#EDE9FE] px-3 py-1 text-[10px] font-semibold text-[#7C3AED]">
                <span className="lg:hidden">AI</span>
                <span className="hidden lg:inline">Powered by AI</span>
              </span>
            </div>

            {/* Score */}
            <div className="mt-5 flex items-center gap-5 lg:block">
              <div className="flex shrink-0 justify-center">
                <div className="relative flex h-[76px] w-[76px] items-center justify-center">
                  <svg
                    width="76"
                    height="76"
                    viewBox="0 0 76 76"
                    className="-rotate-90"
                  >
                    <circle
                      cx="38"
                      cy="38"
                      r={scoreRadius}
                      fill="none"
                      stroke="#EDE9FE"
                      strokeWidth="7"
                    />

                    <circle
                      cx="38"
                      cy="38"
                      r={scoreRadius}
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={scoreCircumference}
                      strokeDashoffset={scoreOffset}
                      className="transition-all duration-700"
                    />
                  </svg>

                  <span className="absolute text-[17px] font-bold text-[#111827]">
                    {job.match}%
                  </span>
                </div>
              </div>

              {/* Mobile Strong Match */}
              <div className="lg:hidden">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-3 py-1 text-[11px] font-semibold text-[#16A34A]">
                  <Check size={12} />
                  Strong Match
                </span>
              </div>
            </div>

            {/* Desktop Strong Match */}
            <div className="mt-2 hidden justify-center lg:flex">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-3 py-1 text-[11px] font-semibold text-[#16A34A]">
                <Check size={12} />
                Strong Match
              </span>
            </div>

            {/* Match Breakdown */}
            <div className="mt-5">
              <p className="mb-3 text-[11px] font-medium text-[#64748B]">
                Match Breakdown
              </p>

              {/* Skill */}
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    Skill Match
                  </span>

                  <span className="text-[11px] font-semibold text-[#4F46E5]">
                    {job.matchDetails.skill}%
                  </span>
                </div>

                <div className="h-[5px] overflow-hidden rounded-full bg-[#EDE9FE]">
                  <div
                    className="h-full rounded-full bg-[#4F46E5] transition-all duration-700"
                    style={{
                      width: `${job.matchDetails.skill}%`,
                    }}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    Experience Match
                  </span>

                  <span className="text-[11px] font-semibold text-[#16A34A]">
                    {job.matchDetails.experience}%
                  </span>
                </div>

                <div className="h-[5px] overflow-hidden rounded-full bg-[#EDE9FE]">
                  <div
                    className="h-full rounded-full bg-[#16A34A] transition-all duration-700"
                    style={{
                      width: `${job.matchDetails.experience}%`,
                    }}
                  />
                </div>
              </div>

              {/* Education */}
              <div className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    Education Match
                  </span>

                  <span className="text-[11px] font-semibold text-[#16A34A]">
                    {job.matchDetails.education}%
                  </span>
                </div>

                <div className="h-[5px] overflow-hidden rounded-full bg-[#EDE9FE]">
                  <div
                    className="h-full rounded-full bg-[#16A34A] transition-all duration-700"
                    style={{
                      width: `${job.matchDetails.education}%`,
                    }}
                  />
                </div>
              </div>

              {/* Profile */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B]">
                    Profile Relevance
                  </span>

                  <span className="text-[11px] font-semibold text-[#4F46E5]">
                    {job.matchDetails.profile}%
                  </span>
                </div>

                <div className="h-[5px] overflow-hidden rounded-full bg-[#EDE9FE]">
                  <div
                    className="h-full rounded-full bg-[#4F46E5] transition-all duration-700"
                    style={{
                      width: `${job.matchDetails.profile}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Matched Skills */}
            <div className="mt-5 border-t border-[#E9E1FF] pt-4">
              <p className="text-[11px] font-medium text-[#64748B]">
                Matched Skills
              </p>

              <div className="mt-2 space-y-2">
                {job.matchedSkills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 text-[12px] font-medium text-[#111827]"
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                      <Check size={10} strokeWidth={3} />
                    </span>

                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gap */}
            <div className="mt-4 overflow-hidden rounded-[9px] border border-[#FDE68A] bg-white">
              <button
                type="button"
                onClick={() => setShowSkillGap((value) => !value)}
                className="flex w-full items-center justify-between p-3 text-left"
              >
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#D97706]">
                  <Info size={13} />
                  Skill Gap
                </span>

                <ChevronDown
                  size={14}
                  className={`text-[#D97706] transition-transform ${
                    showSkillGap ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showSkillGap && (
                <div className="px-3 pb-3">
                  <span className="inline-flex rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-semibold text-[#D97706]">
                    {job.skillGap}
                  </span>

                  <p className="mt-2 text-[10.5px] leading-4 text-[#71829B]">
                    Improving this skill may increase your compatibility with
                    this role.
                  </p>
                </div>
              )}
            </div>

            {/* AI Insight */}
            {showAiInsight && (
              <div className="mt-4 rounded-[9px] border border-[#E5DEFF] bg-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7C3AED]">
                    <Sparkles size={13} />
                    AI Insight
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAiInsight(false)}
                    aria-label="Close AI insight"
                    className="text-[#94A3B8] transition hover:text-[#475569]"
                  >
                    <X size={13} />
                  </button>
                </div>

                <p className="mt-2 text-[10.5px] leading-4 text-[#64748B]">
                  Your profile matches most of the technical requirements for
                  this role. Your strongest matches are React, JavaScript,
                  Node.js and MongoDB.
                </p>
              </div>
            )}
          </aside>

          {/* =====================================================
              MAIN CONTENT
          ====================================================== */}
          <main className="order-3 min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
            {/* Job Description */}
            <section className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <FileText size={14} strokeWidth={1.8} />
                </div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  Job Description
                </h2>
              </div>

              <p className="mt-4 text-[13px] leading-[20px] text-[#475569]">
                {job.description}
              </p>

              <h3 className="mt-4 text-[13px] font-bold text-[#111827]">
                Responsibilities
              </h3>

              <ul className="mt-2 space-y-1.5">
                {job.responsibilities.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 text-[12.5px] leading-5 text-[#475569]"
                  >
                    <span className="absolute left-0 top-[8px] h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Required Skills */}
            <section className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <Code2 size={14} strokeWidth={1.8} />
                </div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  Required Skills
                </h2>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setShowSkillGap(true)}
                    className="rounded-full bg-[#EEF2FF] px-3.5 py-1.5 text-[11px] font-semibold text-[#4F46E5] transition hover:bg-[#E0E7FF]"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </section>

            {/* Job Information */}
            <section className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <Info size={14} strokeWidth={1.8} />
                </div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  Job Information
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#F1F5F9] text-[#71829B]">
                    <MapPin size={14} strokeWidth={1.7} />
                  </div>

                  <div>
                    <p className="text-[10px] leading-3 text-[#94A3B8]">
                      Location
                    </p>

                    <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#111827]">
                      {job.jobInfo.location}
                    </p>
                  </div>
                </div>

                {/* Employment */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#F1F5F9] text-[#71829B]">
                    <Clock3 size={14} strokeWidth={1.7} />
                  </div>

                  <div>
                    <p className="text-[10px] leading-3 text-[#94A3B8]">
                      Employment Type
                    </p>

                    <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#111827]">
                      {job.jobInfo.employmentType}
                    </p>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#F1F5F9] text-[#71829B]">
                    <BarChart3 size={14} strokeWidth={1.7} />
                  </div>

                  <div>
                    <p className="text-[10px] leading-3 text-[#94A3B8]">
                      Experience
                    </p>

                    <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#111827]">
                      {job.jobInfo.experience}
                    </p>
                  </div>
                </div>

                {/* Education */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#F1F5F9] text-[#71829B]">
                    <GraduationCap size={14} strokeWidth={1.7} />
                  </div>

                  <div>
                    <p className="text-[10px] leading-3 text-[#94A3B8]">
                      Education
                    </p>

                    <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#111827]">
                      {job.jobInfo.education}
                    </p>
                  </div>
                </div>

                {/* Industry */}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#F1F5F9] text-[#71829B]">
                    <Building2 size={14} strokeWidth={1.7} />
                  </div>

                  <div>
                    <p className="text-[10px] leading-3 text-[#94A3B8]">
                      Industry
                    </p>

                    <p className="mt-0.5 text-[12px] font-semibold leading-4 text-[#111827]">
                      {job.jobInfo.industry}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* =====================================================
              READY TO APPLY
          ====================================================== */}
          <section className="order-4 hidden rounded-[14px] border border-[#DCE3EE] bg-white p-4 lg:col-start-2 lg:row-start-3 lg:block lg:p-5">
            <h2 className="text-[14px] font-bold text-[#111827]">
              Ready to Apply?
            </h2>

            <p className="mt-3 text-[11.5px] leading-[18px] text-[#71829B]">
              Your resume will be analyzed against this job and you may be asked
              to complete a job-specific skill assessment.
            </p>

            <Link
              href={`/student/jobs/${id}/apply`}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.16)] transition hover:bg-[#4338CA]"
            >
              Apply Now
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              onClick={toggleSaved}
              className={`mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-[8px] border bg-white text-[12px] font-medium transition ${
                saved
                  ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5]"
                  : "border-[#DCE3EE] text-[#475569] hover:border-[#C7D2FE] hover:text-[#4F46E5]"
              }`}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}

              {saved ? "Saved Job" : "Save Job"}
            </button>
          </section>
        </div>
      </div>

      {/* =====================================================
          MOBILE APPLY BAR
      ====================================================== */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
        <Link
          href={`/student/jobs/${id}/apply`}
          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition hover:bg-[#4338CA]"
        >
          Apply Now
          <ArrowRight size={17} />
        </Link>
      </div>

      {/* Prevent mobile content from hiding behind sticky apply button */}
      <div className="h-20 lg:hidden" />
    </section>
  );
}
