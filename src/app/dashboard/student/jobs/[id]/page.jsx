"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  CalendarDays,
  Clock3,
  Code2,
  GraduationCap,
  Info,
  MapPin,
  BarChart3,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";

const api = axios.create({
  withCredentials: true,
});

const formatDate = (date) => {
  if (!date) return "Recently posted";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently posted";

  const days = Math.floor((Date.now() - parsed.getTime()) / 86400000);

  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;

  return `Posted ${parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
};

const formatSalary = (min, max) => {
  if (min == null && max == null) return "Not disclosed";

  const format = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

  if (min != null && max != null) {
    return `${format(min)} - ${format(max)}`;
  }

  if (min != null) return `From ${format(min)}`;
  return `Up to ${format(max)}`;
};

const toList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|•/)
      .map((item) => item.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }

  return [];
};

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-[14px] border border-[#DCE3EE] bg-white p-5">
      <div className="h-5 w-1/3 rounded bg-slate-200" />
      <div className="mt-4 h-3 w-full rounded bg-slate-100" />
      <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
      <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
    </div>
  );
}

export default function JobDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [saveError, setSaveError] = useState("");

  const responsibilities = useMemo(
    () => toList(job?.responsibilities),
    [job?.responsibilities],
  );

  const requiredSkills = useMemo(
    () => toList(job?.requiredSkills),
    [job?.requiredSkills],
  );

  const preferredSkills = useMemo(
    () => toList(job?.preferredSkills),
    [job?.preferredSkills],
  );

  const loadJob = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setPageError("");

    try {
      const response = await api.get(`/api/student/jobs/${id}`);

      if (!response.data?.success || !response.data?.job) {
        throw new Error(response.data?.message || "Unable to load job.");
      }

      setJob(response.data.job);
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load this job. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadSavedStatus = useCallback(async () => {
    if (!id) return;

    try {
      const response = await api.get("/api/student/saved-jobs");
      const ids = response.data?.savedJobIds || [];

      setSaved(ids.some((savedId) => String(savedId) === String(id)));
    } catch (error) {
      // Saved status is secondary; the job details can still be displayed.
      console.error("Unable to load saved job status:", error);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
    loadSavedStatus();
  }, [loadJob, loadSavedStatus]);

  const toggleSaved = async () => {
    if (!id || saving) return;

    setSaving(true);
    setSaveError("");

    try {
      if (saved) {
        await api.delete(`/api/student/saved-jobs/${id}`);
        setSaved(false);
      } else {
        await api.post("/api/student/saved-jobs", { jobId: id });
        setSaved(true);
      }
    } catch (error) {
      setSaveError(
        error.response?.data?.message || "Unable to update saved jobs.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#F8FAFC] px-5 py-6">
        <div className="mx-auto max-w-[1280px] space-y-4">
          <LoadingCard />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_340px]">
            <div className="space-y-4">
              <LoadingCard />
              <LoadingCard />
            </div>
            <LoadingCard />
          </div>
        </div>
      </section>
    );
  }

  if (pageError || !job) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-[#F8FAFC] px-5">
        <div className="w-full max-w-md rounded-[14px] border border-[#DCE3EE] bg-white p-7 text-center">
          <AlertCircle className="mx-auto text-red-500" size={30} />

          <h1 className="mt-3 text-lg font-bold text-[#111827]">
            Unable to open this job
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            {pageError || "This job may have been closed or removed."}
          </p>

          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={loadJob}
              className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>

            <Link
              href="/dashboard/student/jobs"
              className="rounded-lg border border-[#DCE3EE] px-4 py-2 text-sm font-semibold text-[#475569]"
            >
              Browse jobs
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const company = job.company || "Company";

  const initials =
    job.companyInitials ||
    company
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const experience = job.experienceLevel || "Not specified";
  const education = job.educationRequirement || "Not specified";
  const posted = formatDate(job.publishedAt || job.createdAt);

  return (
    <section className="min-h-screen bg-[#F8FAFC] pb-20 text-[#111827] lg:pb-0">
      <div className="mx-auto w-full max-w-[1280px] px-5 py-5 sm:px-6 sm:py-6 lg:px-7">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_340px]">
          {/* JOB HEADER */}
          <article className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5 lg:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[9px] border border-[#DCE3EE] bg-[#EEF2FF] text-[17px] font-bold text-[#4F46E5]">
                  {initials}
                </div>

                <div className="min-w-0">
                  <h1 className="text-[19px] font-bold leading-6 tracking-[-0.02em] text-[#111827] sm:text-[20px]">
                    {job.title}
                  </h1>

                  <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#64748B]">
                    <Building2 size={14} strokeWidth={1.7} />
                    {company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleSaved}
                  disabled={saving}
                  aria-label={saved ? "Unsave job" : "Save job"}
                  aria-pressed={saved}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border bg-white transition disabled:opacity-50 ${
                    saved
                      ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#DCE3EE] text-[#71829B] hover:border-[#C7D2FE] hover:text-[#4F46E5]"
                  }`}
                >
                  {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                </button>

                <Link
                  href={`/dashboard/student/jobs/${id}/apply`}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#4338CA] sm:flex-none sm:px-6"
                >
                  Apply Now
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {saveError && (
              <p className="mt-3 text-xs text-red-600">{saveError}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <MapPin size={13} />
                {job.location}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <Clock3 size={13} />
                {job.employmentType}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <BarChart3 size={13} />
                {experience}
              </span>

              <span className="inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                <CalendarDays size={13} />
                {posted}
              </span>
            </div>
          </article>

          {/* MAIN JOB CONTENT */}
          <main className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
            {/* JOB DESCRIPTION */}
            <section className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <FileText size={14} />
                </div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  Job Description
                </h2>
              </div>

              <p className="mt-4 whitespace-pre-line text-[13px] leading-[20px] text-[#475569]">
                {job.description || "No job description provided."}
              </p>

              <h3 className="mt-4 text-[13px] font-bold text-[#111827]">
                Responsibilities
              </h3>

              {responsibilities.length ? (
                <ul className="mt-2 space-y-1.5">
                  {responsibilities.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="relative pl-4 text-[12.5px] leading-5 text-[#475569]"
                    >
                      <span className="absolute left-0 top-[8px] h-1.5 w-1.5 rounded-full bg-[#4F46E5]" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[12px] text-[#94A3B8]">
                  No responsibilities listed.
                </p>
              )}
            </section>

            {/* REQUIRED SKILLS */}
            <section className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <Code2 size={14} />
                </div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  Required Skills
                </h2>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {requiredSkills.length ? (
                  requiredSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-[#EEF2FF] px-3.5 py-1.5 text-[11px] font-semibold text-[#4F46E5]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-[12px] text-[#94A3B8]">
                    No required skills listed.
                  </p>
                )}
              </div>

              {preferredSkills.length > 0 && (
                <>
                  <h3 className="mt-5 text-[12px] font-bold text-[#475569]">
                    Preferred Skills
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {preferredSkills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-[#F1F5F9] px-3.5 py-1.5 text-[11px] font-medium text-[#475569]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* JOB INFORMATION */}
            <section className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                  <Info size={14} />
                </div>

                <h2 className="text-[15px] font-bold text-[#111827]">
                  Job Information
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                {[
                  {
                    label: "Location",
                    value: job.location,
                    icon: MapPin,
                  },
                  {
                    label: "Employment Type",
                    value: job.employmentType,
                    icon: Clock3,
                  },
                  {
                    label: "Experience",
                    value: experience,
                    icon: BarChart3,
                  },
                  {
                    label: "Education",
                    value: education,
                    icon: GraduationCap,
                  },
                  {
                    label: "Industry",
                    value: job.industry || "Not specified",
                    icon: Building2,
                  },
                  {
                    label: "Salary",
                    value: formatSalary(job.salaryMin, job.salaryMax),
                    icon: Info,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#F1F5F9] text-[#71829B]">
                        <Icon size={14} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] leading-3 text-[#94A3B8]">
                          {item.label}
                        </p>

                        <p className="mt-0.5 break-words text-[12px] font-semibold leading-4 text-[#111827]">
                          {item.value || "Not specified"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* OPTIONAL ASSESSMENT INFORMATION */}
            {job.requireSkillAssessment && (
              <section className="rounded-[14px] border border-[#DCE3EE] bg-white p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                    <GraduationCap size={14} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#111827]">
                    Skill Assessment
                  </h2>
                </div>

                <p className="mt-3 text-[12px] leading-5 text-[#475569]">
                  This job requires an assessment:{" "}
                  <span className="font-semibold">
                    {job.assessmentType || "Job-Specific Skill Assessment"}
                  </span>
                  . Check the application process for assessment instructions.
                </p>
              </section>
            )}
          </main>

          {/* READY TO APPLY */}
          <section className="order-4 hidden rounded-[14px] border border-[#DCE3EE] bg-white p-4 lg:col-start-2 lg:row-start-2 lg:block lg:p-5">
            <h2 className="text-[14px] font-bold text-[#111827]">
              Ready to Apply?
            </h2>

            <p className="mt-3 text-[11.5px] leading-[18px] text-[#71829B]">
              Review the job requirements, then submit your application. Make
              sure your profile and resume are up to date before applying.
            </p>

            <Link
              href={`/dashboard/student/jobs/${id}/apply`}
              className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.16)] transition hover:bg-[#4338CA]"
            >
              Apply Now
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              onClick={toggleSaved}
              disabled={saving}
              className={`mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-[8px] border bg-white text-[12px] font-medium transition disabled:opacity-50 ${
                saved
                  ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5]"
                  : "border-[#DCE3EE] text-[#475569] hover:border-[#C7D2FE] hover:text-[#4F46E5]"
              }`}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}

              {saving ? "Please wait..." : saved ? "Saved Job" : "Save Job"}
            </button>
          </section>
        </div>
      </div>

      {/* MOBILE APPLY BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 px-5 py-3 backdrop-blur lg:hidden">
        <Link
          href={`/dashboard/student/jobs/${id}/apply`}
          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)] transition hover:bg-[#4338CA]"
        >
          Apply Now
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
