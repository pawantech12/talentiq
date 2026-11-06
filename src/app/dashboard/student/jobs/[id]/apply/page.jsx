"use client";

import { useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
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

export default function ApplyPage() {
  const fileInputRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const params = useParams();

  const id = params.id;

  const router = useRouter();

  const job = {
    initials: "AT",
    title: "Full Stack Developer",
    company: "ABC Technologies",
    location: "Mumbai",
    type: "Full-time",
    experience: "0–2 Years",
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    const fileName = file.name.toLowerCase();

    const isPdf = file.type === "application/pdf" || fileName.endsWith(".pdf");

    if (!isPdf) {
      setUploadError("Only PDF files are accepted.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size must be less than 5 MB.");
      return false;
    }

    setUploadError("");

    return true;
  };

  const handleFile = (file) => {
    if (!file) {
      return;
    }

    if (!validateFile(file)) {
      setResume(null);
      return;
    }

    setResume({
      file,
      name: file.name,
      size: file.size,
    });

    setUploadError("");
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const removeResume = () => {
    setResume(null);
    setUploadError("");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "0 KB";
    }

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleViewJobDetails = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleSubmit = async () => {
    if (!resume) {
      setUploadError("Please upload your resume before submitting.");
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);

    router.push(`/dashboard/student/jobs/${id}/analysis`);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#111827]">
      <div className="mx-auto w-full  px-4 py-5 sm:px-6 sm:py-7 lg:px-7 lg:py-8">
        {/* PAGE HEADING */}
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <h1 className="text-[21px] font-bold leading-7 tracking-[-0.025em] text-[#111827] sm:text-[25px] lg:text-[26px]">
            Apply for {job.title}
          </h1>

          <p className="mt-1 text-[13px] leading-5 text-[#64748B] sm:text-[14px]">
            Complete your application by uploading your latest resume.
          </p>
        </div>

        {/* JOB SUMMARY CARD */}
        <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#E0E7FF] bg-[#EEF2FF] text-[14px] font-bold text-[#4F46E5] sm:h-11 sm:w-11 sm:text-[15px]">
                {job.initials}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-[14px] font-bold leading-5 text-[#111827] sm:text-[15px]">
                  {job.title}
                </h2>

                <p className="mt-0.5 text-[12px] text-[#71829B] sm:text-[13px]">
                  {job.company}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleViewJobDetails}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[8px] border border-[#DCE3EE] bg-white px-3 text-[11px] font-medium text-[#475569] transition hover:border-[#C7D2FE] hover:text-[#4F46E5] sm:h-9 sm:px-3.5 sm:text-[12px]"
            >
              <ArrowUpRight size={13} />

              <span className="hidden sm:inline">View Job Details</span>

              <span className="sm:hidden">View</span>
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#64748B] sm:text-[12px]">
              <MapPin size={13} strokeWidth={1.7} />
              {job.location}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#64748B] sm:text-[12px]">
              <BriefcaseBusiness size={13} strokeWidth={1.7} />
              {job.type}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#64748B] sm:text-[12px]">
              <TrendingUp size={13} strokeWidth={1.7} />
              {job.experience}
            </span>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5">
          {/* RESUME UPLOAD CARD */}
          <section className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.02)] sm:p-5 lg:p-6">
            <div>
              <h2 className="text-[16px] font-bold leading-5 text-[#111827] sm:text-[17px]">
                Upload Your Resume
              </h2>

              <p className="mt-1 text-[12px] leading-5 text-[#64748B] sm:text-[13px]">
                Upload your latest resume so ResumeAI can analyze your profile
                against this job.
              </p>
            </div>

            {/* DROPZONE */}
            <div
              onDragEnter={handleDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowse}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleBrowse();
                }
              }}
              className={`mt-4 flex min-h-[216px] cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed px-5 py-7 text-center transition sm:min-h-[250px] lg:min-h-[260px] ${
                isDragging
                  ? "border-[#4F46E5] bg-[#EEF2FF]"
                  : "border-[#DCE3EE] bg-[#F8FAFC] hover:border-[#C7D2FE] hover:bg-[#F8FAFF]"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[11px] bg-[#EEF2FF] text-[#4F46E5] sm:h-14 sm:w-14">
                <FileText size={25} strokeWidth={1.8} />
              </div>

              <p className="mt-4 text-[14px] font-semibold text-[#111827] sm:text-[15px]">
                <span className="hidden sm:inline">
                  Drag &amp; drop your resume here
                </span>

                <span className="sm:hidden">Upload your resume</span>
              </p>

              <p className="mt-1.5 text-[12px] text-[#94A3B8]">
                <span className="hidden sm:inline">or</span>
              </p>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleBrowse();
                }}
                className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[#4F46E5] px-5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.16)] transition hover:bg-[#4338CA] active:scale-[0.99]"
              >
                <Upload size={15} />
                Browse Files
              </button>

              <p className="mt-3 text-[11px] text-[#94A3B8]">
                PDF only · Maximum 5 MB
              </p>
            </div>

            {/* HIDDEN FILE INPUT */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileInput}
              className="hidden"
            />

            {/* UPLOADED FILE */}
            {resume && (
              <div className="mt-4 rounded-[10px] border border-[#16A34A] bg-[#DCFCE7] p-3 sm:p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#16A34A]">
                    <FileText size={19} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                      <p className="truncate text-[12px] font-semibold text-[#16A34A] sm:text-[13px]">
                        {resume.name}
                      </p>

                      <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-[#16A34A] px-2.5 py-1 text-[10px] font-semibold text-white">
                        Uploaded
                      </span>
                    </div>

                    <p className="mt-0.5 text-[10px] text-[#71829B] sm:text-[11px]">
                      PDF · {formatFileSize(resume.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeResume}
                    aria-label="Remove resume"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-white hover:text-[#16A34A]"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-[#16A34A]">
                  <CheckCircle2 size={13} />
                  Resume ready for analysis
                </div>
              </div>
            )}

            {/* ERROR */}
            {uploadError && (
              <div className="mt-3 flex items-start gap-2 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] p-3 text-[11px] leading-4 text-[#DC2626]">
                <Info size={14} className="mt-0.5 shrink-0" />

                <span>{uploadError}</span>
              </div>
            )}

            {/* ANALYSIS INFO */}
            <div className="mt-4 flex items-start gap-2 rounded-[8px] bg-[#F5F3FF] p-3">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-[#7C3AED]" />

              <p className="text-[11px] leading-4 text-[#64748B] sm:text-[12px]">
                Your resume will be analyzed against the requirements of this
                job.
              </p>
            </div>
          </section>

          {/* APPLICATION PROCESS */}
          <aside className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 sm:p-5 lg:p-5">
            <h2 className="text-[15px] font-bold text-[#111827] sm:text-[16px]">
              Application Process
            </h2>

            <div className="relative mt-5">
              <div className="absolute left-[12px] top-[14px] h-[184px] w-px bg-[#DCE3EE]" />

              {/* STEP 1 */}
              <div className="relative flex gap-3">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-[9px] font-bold text-white">
                  01
                </div>

                <div className="pt-0.5">
                  <p className="text-[13px] font-semibold text-[#4F46E5]">
                    Upload Resume
                  </p>

                  <p className="mt-1 text-[10px] text-[#7C3AED]">
                    Current step
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="relative mt-6 flex gap-3">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[9px] font-semibold text-[#94A3B8]">
                  02
                </div>

                <div className="pt-0.5">
                  <p className="text-[13px] font-medium text-[#475569]">
                    AI Resume Analysis
                  </p>

                  <p className="mt-1 text-[10px] text-[#94A3B8]">
                    Automated screening
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="relative mt-6 flex gap-3">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[9px] font-semibold text-[#94A3B8]">
                  03
                </div>

                <div className="pt-0.5">
                  <p className="text-[13px] font-medium text-[#475569]">
                    Job-Specific Skill Assessment
                  </p>

                  <p className="mt-1 text-[10px] text-[#94A3B8]">
                    Targeted evaluation
                  </p>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="relative mt-6 flex gap-3">
                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[9px] font-semibold text-[#94A3B8]">
                  04
                </div>

                <div className="pt-0.5">
                  <p className="text-[13px] font-medium text-[#475569]">
                    Final Compatibility Score
                  </p>

                  <p className="mt-1 text-[10px] text-[#94A3B8]">
                    AI-generated ranking
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* WHAT HAPPENS NEXT */}
          <aside className="rounded-[12px] border border-[#DCE3EE] bg-white p-4 sm:p-5 lg:col-start-2 lg:p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#EEF2FF] text-[#4F46E5]">
                <Info size={14} />
              </div>

              <h2 className="text-[14px] font-bold text-[#111827]">
                What happens next?
              </h2>
            </div>

            <p className="mt-3 text-[11.5px] leading-[17px] text-[#64748B]">
              After you submit, ResumeAI will analyze your resume against this
              job. You may then be asked to complete a job-specific skill
              assessment.
            </p>
          </aside>
        </div>

        {/* SUCCESS MESSAGE */}
        {submitted && (
          <div className="mt-4 rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] p-3.5 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <p className="text-[13px] font-bold text-[#166534]">
                  Application submitted successfully
                </p>

                <p className="mt-1 text-[11px] leading-4 text-[#64748B]">
                  Your resume has been submitted for the {job.title} position at{" "}
                  {job.company}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div
          className={`mt-4 flex flex-col-reverse gap-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC] py-3 sm:flex-row sm:justify-end sm:border-0 sm:bg-transparent sm:py-0 lg:mt-4 ${
            !submitted
              ? "sticky bottom-0 z-30 -mx-4 px-4 shadow-[0_-4px_15px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:static sm:mx-0 sm:px-0 sm:shadow-none sm:backdrop-blur-0"
              : ""
          }`}
        >
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="h-10 w-full rounded-[8px] border border-[#DCE3EE] bg-white px-5 text-[13px] font-medium text-[#475569] transition hover:border-[#C7D2FE] hover:text-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[88px]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || submitted}
            className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-[8px] px-5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition sm:w-auto sm:min-w-[210px] ${
              submitted ? "bg-[#16A34A]" : "bg-[#4F46E5] hover:bg-[#4338CA]"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Submitting...
              </>
            ) : submitted ? (
              <>
                <Check size={15} />
                Application Submitted
              </>
            ) : (
              <>
                <Send size={15} />
                Submit Application
              </>
            )}
          </button>
        </div>

        <div className="h-3 sm:hidden" />
      </div>
    </main>
  );
}
