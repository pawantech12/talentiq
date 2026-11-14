"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Info,
  MapPin,
  Send,
  Sparkles,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

function formatFileSize(bytes) {
  if (!bytes) return "Size unavailable";
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [job, setJob] = useState(null);
  const [profileResume, setProfileResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [existingApplication, setExistingApplication] = useState(null);

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function loadPage() {
      setIsLoading(true);
      setLoadError("");

      try {
        const { data } = await api.get(`/student/jobs/${id}/apply`);

        if (!active) return;

        setJob(data.job);
        setProfileResume(data.resume?.available ? data.resume : null);
        setExistingApplication(data.existingApplication || null);
      } catch (err) {
        if (!active) return;

        setLoadError(err.response?.data?.message || "Unable to load this job.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadPage();

    return () => {
      active = false;
    };
  }, [id]);

  const currentResume = selectedFile
    ? {
        name: selectedFile.name,
        size: selectedFile.size,
        source: "uploaded",
      }
    : profileResume
      ? {
          name: profileResume.name,
          size: profileResume.bytes,
          source: "profile",
        }
      : null;

  function validateFile(file) {
    if (!file) return false;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF files are accepted.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be smaller than 8 MB.");
      return false;
    }

    setError("");
    return true;
  }

  function handleFile(file) {
    if (!file) return;

    if (!validateFile(file)) return;

    setSelectedFile(file);
    setError("");
  }

  function handleFileInput(event) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  }

  function removeSelectedFile() {
    setSelectedFile(null);
    setError("");
  }

  async function handleSubmit() {
    if (!currentResume) {
      setError("Upload a PDF resume or add one to your profile first.");
      return;
    }

    if (!id || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();

      // When no file is appended, the backend uses the profile resume.
      if (selectedFile) {
        formData.append("resume", selectedFile);
      }

      const { data } = await api.post(`/student/jobs/${id}/apply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 90000,
      });

      if (!data.success) {
        throw new Error(data.message || "Application submission failed.");
      }

      router.push(`/dashboard/student/jobs/${id}/analysis`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit your application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBack() {
    router.push(`/dashboard/student/jobs/${id}`);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-6">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-7 w-64 rounded bg-slate-200" />
          <div className="mt-5 h-28 rounded-xl bg-white" />
          <div className="mt-5 h-80 rounded-xl bg-white" />
        </div>
      </main>
    );
  }

  if (loadError || !job) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-6">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-6">
          <p className="font-semibold text-red-600">
            {loadError || "Job not found."}
          </p>
          <button
            onClick={goBack}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            Back to Job
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="mx-auto w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-7 lg:py-8">
        <div className="mb-5">
          <h1 className="text-[22px] font-bold sm:text-[26px]">
            Apply for {job.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Select your resume and submit your application for AI analysis.
          </p>
        </div>

        <section className="rounded-xl border border-[#DCE3EE] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-bold text-indigo-600">
                {job.initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">{job.title}</h2>
                <p className="text-xs text-slate-500">{job.company}</p>
              </div>
            </div>

            <button
              onClick={goBack}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs text-slate-600 hover:border-indigo-300"
            >
              <ArrowUpRight size={14} />
              View Job
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness size={14} /> {job.employmentType}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp size={14} /> {job.experienceLevel}
            </span>
          </div>
        </section>

        {existingApplication && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            You have already submitted an application for this job. Submitting
            again will update your existing application and its analysis.
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="rounded-xl border border-[#DCE3EE] bg-white p-4 sm:p-6">
            <h2 className="text-base font-bold">Select Your Resume</h2>
            <p className="mt-1 text-sm text-slate-500">
              Your profile resume is selected automatically when available. You
              can choose another PDF for this application.
            </p>

            {profileResume && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setError("");
                }}
                className={`mt-4 flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
                  !selectedFile
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-indigo-300"
                }`}
              >
                <FileText className="shrink-0 text-indigo-600" size={22} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {profileResume.name}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Profile resume · {formatFileSize(profileResume.bytes)}
                  </span>
                </span>
                {!selectedFile && (
                  <CheckCircle2
                    className="shrink-0 text-indigo-600"
                    size={20}
                  />
                )}
              </button>
            )}

            {!profileResume && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                You have not uploaded a resume to your profile. Please select a
                PDF below to continue.
              </div>
            )}

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                handleFile(event.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-4 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-300"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Upload size={23} />
              </div>
              <p className="mt-3 text-sm font-semibold">
                Browse or drag another resume PDF
              </p>
              <p className="mt-1 text-xs text-slate-500">
                PDF only · Maximum 8 MB
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <FileText className="shrink-0 text-green-700" size={21} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-green-800">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-green-700">
                    Selected PDF · {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeSelectedFile}
                  aria-label="Remove selected PDF"
                  className="rounded-full p-1 text-slate-500 hover:bg-white"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <Info size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-lg bg-violet-50 p-3 text-xs leading-5 text-slate-600">
              <Sparkles size={16} className="mt-0.5 shrink-0 text-violet-600" />
              Your resume will be analyzed against the job description,
              responsibilities, required skills, experience, and education.
            </div>
          </section>

          <aside className="rounded-xl border border-[#DCE3EE] bg-white p-5">
            <h2 className="font-bold">Application Process</h2>
            <div className="mt-5 space-y-6">
              {[
                "Select Resume",
                "Submit Application",
                "AI Resume Analysis",
                job.requireSkillAssessment
                  ? "Job-Specific Skill Assessment"
                  : "Application Review",
              ].map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {index === 0
                        ? "Current step"
                        : "Completed after submission"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              Your resume text and job requirements are processed securely on
              the server. Your PDF is not sent directly from the browser to
              Groq.
            </div>
          </aside>
        </div>

        <div className="sticky bottom-0 z-20 mt-5 flex flex-col-reverse gap-3 border-t bg-[#F8FAFC]/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={goBack}
            disabled={isSubmitting}
            className="h-11 rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !currentResume}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Submitting & Analyzing...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
