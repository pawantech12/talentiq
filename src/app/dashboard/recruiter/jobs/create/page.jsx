"use client";

import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Info,
  Plus,
  Save,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { Controller, useFieldArray, useForm } from "react-hook-form";

/* ---------------------------------------------------------
   Empty Create Job Form
--------------------------------------------------------- */

const EMPTY_JOB_VALUES = {
  title: "",
  industry: "",
  location: "",
  employmentType: "",
  experienceLevel: "",

  salaryMin: "",
  salaryMax: "",

  description: "",
  responsibilities: "",

  requiredSkills: [],
  preferredSkills: [],

  educationRequirement: "",

  resumeSkillMatch: false,
  educationMatch: false,
  experienceMatch: false,

  requireSkillAssessment: false,
  assessmentType: "Job-Specific Skill Assessment",
  status: "Draft",
};

/* ---------------------------------------------------------
   Toggle
--------------------------------------------------------- */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative flex h-[20px] w-[38px] shrink-0 items-center rounded-full p-[2px] transition-all duration-200 ${
        checked ? "bg-[#5146E5]" : "bg-[#CBD5E1]"
      }`}
    >
      <span
        className={`h-[16px] w-[16px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ---------------------------------------------------------
   Normalize Saved Draft
--------------------------------------------------------- */

function normalizeDraft(draft) {
  if (!draft || typeof draft !== "object") {
    return EMPTY_JOB_VALUES;
  }

  return {
    ...EMPTY_JOB_VALUES,
    ...draft,

    requiredSkills: Array.isArray(draft.requiredSkills)
      ? draft.requiredSkills
          .filter(Boolean)
          .map((skill) =>
            typeof skill === "string" ? { value: skill } : skill,
          )
      : [],

    preferredSkills: Array.isArray(draft.preferredSkills)
      ? draft.preferredSkills
          .filter(Boolean)
          .map((skill) =>
            typeof skill === "string" ? { value: skill } : skill,
          )
      : [],
  };
}

/* ---------------------------------------------------------
   Convert RHF Data For Storage
--------------------------------------------------------- */

function serializeJob(data) {
  return {
    ...data,

    requiredSkills: data.requiredSkills
      .map((skill) => skill.value?.trim())
      .filter(Boolean),

    preferredSkills: data.preferredSkills
      .map((skill) => skill.value?.trim())
      .filter(Boolean),
  };
}

/* ---------------------------------------------------------
   Create Job Page
--------------------------------------------------------- */

export default function CreateJobPage() {
  /* -------------------------------------------------------
     React Hook Form
  ------------------------------------------------------- */

  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_JOB_VALUES,
    mode: "onSubmit",
  });

  /* -------------------------------------------------------
     Skills
  ------------------------------------------------------- */

  const {
    fields: requiredSkillFields,
    append: appendRequiredSkill,
    remove: removeRequiredSkill,
  } = useFieldArray({
    control,
    name: "requiredSkills",
  });

  const {
    fields: preferredSkillFields,
    append: appendPreferredSkill,
    remove: removePreferredSkill,
  } = useFieldArray({
    control,
    name: "preferredSkills",
  });

  /* -------------------------------------------------------
     Local UI State
  ------------------------------------------------------- */

  const [newRequiredSkill, setNewRequiredSkill] = useState("");
  const [newPreferredSkill, setNewPreferredSkill] = useState("");

  const [showRequiredInput, setShowRequiredInput] = useState(false);
  const [showPreferredInput, setShowPreferredInput] = useState(false);

  const [toast, setToast] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const toastTimerRef = useRef(null);

  const requireSkillAssessment = watch("requireSkillAssessment");
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [isLoadingJob, setIsLoadingJob] = useState(Boolean(editId));

  const toFormValues = (job) =>
    normalizeDraft({
      ...job,
      salaryMin: job.salaryMin ?? "",
      salaryMax: job.salaryMax ?? "",
      status: job.status || "Draft",
      requiredSkills: (job.requiredSkills || []).map((value) => ({ value })),
      preferredSkills: (job.preferredSkills || []).map((value) => ({ value })),
    });

  useEffect(() => {
    let alive = true;
    if (!editId) {
      setIsLoadingJob(false);
      return () => {
        alive = false;
      };
    }
    (async () => {
      try {
        const { data } = await api.get(`/recruiter/jobs/${editId}`);
        if (alive) reset(toFormValues(data.job));
      } catch (error) {
        if (error.response?.status === 401) router.replace("/login");
        else
          showToast(error.response?.data?.message || "Unable to load this job");
      } finally {
        if (alive) setIsLoadingJob(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [editId, reset, router]);

  /* -------------------------------------------------------
     Load Explicitly Saved Draft
     
     No sample/default job is loaded.
     Only a recruiter-created draft is restored.
  ------------------------------------------------------- */

  /* -------------------------------------------------------
     Cleanup Toast Timer
  ------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /* -------------------------------------------------------
     Toast
  ------------------------------------------------------- */

  const showToast = (message) => {
    setToast(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 2400);
  };

  /* -------------------------------------------------------
     Required Skills
  ------------------------------------------------------- */

  const addRequiredSkill = () => {
    const skill = newRequiredSkill.trim();

    if (!skill) {
      setShowRequiredInput(false);
      return;
    }

    const existingSkills = getValues("requiredSkills");

    const exists = existingSkills.some(
      (item) => item.value?.toLowerCase() === skill.toLowerCase(),
    );

    if (exists) {
      showToast("Skill already added");
      setNewRequiredSkill("");
      return;
    }

    if (existingSkills.length >= 12) {
      showToast("Maximum 12 required skills allowed");
      return;
    }

    appendRequiredSkill({
      value: skill,
    });

    setNewRequiredSkill("");
    setShowRequiredInput(false);
    clearErrors("requiredSkills");
  };

  /* -------------------------------------------------------
     Preferred Skills
  ------------------------------------------------------- */

  const addPreferredSkill = () => {
    const skill = newPreferredSkill.trim();

    if (!skill) {
      setShowPreferredInput(false);
      return;
    }

    const existingSkills = getValues("preferredSkills");

    const exists = existingSkills.some(
      (item) => item.value?.toLowerCase() === skill.toLowerCase(),
    );

    if (exists) {
      showToast("Skill already added");
      setNewPreferredSkill("");
      return;
    }

    if (existingSkills.length >= 10) {
      showToast("Maximum 10 preferred skills allowed");
      return;
    }

    appendPreferredSkill({
      value: skill,
    });

    setNewPreferredSkill("");
    setShowPreferredInput(false);
  };

  /* -------------------------------------------------------
     Save Draft
  ------------------------------------------------------- */

  const handleSaveDraft = async () => {
    try {
      const serializedJob = serializeJob(getValues());
      const payload = { ...serializedJob, status: "Draft" };
      const { data } = editId
        ? await api.patch(`/recruiter/jobs/${editId}`, payload)
        : await api.post("/recruiter/jobs", payload);
      showToast("Job draft saved successfully");
      if (!editId && data.job?._id) {
        router.replace(`/dashboard/recruiter/jobs/create?edit=${data.job._id}`);
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to save draft");
    }
  };

  /* -------------------------------------------------------
     Cancel
  ------------------------------------------------------- */

  const handleCancel = () => {
    const shouldReset = window.confirm(
      "Discard your current changes and return to My Jobs?",
    );
    if (!shouldReset) return;
    router.push("/dashboard/recruiter/jobs");
  };

  /* -------------------------------------------------------
     Validation
  ------------------------------------------------------- */

  const validateJob = (data) => {
    if (!data.title.trim()) {
      setError("title", {
        type: "manual",
        message: "Please enter a job title.",
      });
      return false;
    }

    if (!data.industry.trim()) {
      setError("industry", {
        type: "manual",
        message: "Please enter a industry.",
      });
      return false;
    }

    if (!data.location.trim()) {
      setError("location", {
        type: "manual",
        message: "Please enter a location.",
      });
      return false;
    }

    if (!data.employmentType) {
      setError("employmentType", {
        type: "manual",
        message: "Please select an employment type.",
      });
      return false;
    }

    if (!data.experienceLevel) {
      setError("experienceLevel", {
        type: "manual",
        message: "Please select an experience level.",
      });
      return false;
    }

    if (!data.description.trim()) {
      setError("description", {
        type: "manual",
        message: "Please enter a job description.",
      });
      return false;
    }

    if (!data.responsibilities.trim()) {
      setError("responsibilities", {
        type: "manual",
        message: "Please enter the job responsibilities.",
      });
      return false;
    }

    if (data.requiredSkills.length === 0) {
      setError("requiredSkills", {
        type: "manual",
        message: "Please add at least one required skill.",
      });
      return false;
    }

    return true;
  };

  /* -------------------------------------------------------
     Publish Job
  ------------------------------------------------------- */

  const handlePublish = async (data) => {
    clearErrors();

    const selectedStatus = data.status || "Draft";

    // Only require complete job information when activating a job.
    if (selectedStatus === "Active" && !validateJob(data)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsPublishing(true);

    try {
      const payload = {
        ...serializeJob(data),
        status: selectedStatus,
      };

      if (editId) {
        await api.patch(`/recruiter/jobs/${editId}`, payload);
      } else {
        await api.post("/recruiter/jobs", payload);
      }

      setPublished(selectedStatus === "Active");

      showToast(
        selectedStatus === "Active"
          ? "Job published successfully"
          : selectedStatus === "Closed"
            ? "Job closed successfully"
            : "Job saved as draft successfully",
      );

      router.push("/dashboard/recruiter/jobs");
    } catch (error) {
      showToast(error.response?.data?.message || "Unable to save job");
    } finally {
      setIsPublishing(false);
    }
  };

  /* -------------------------------------------------------
     Error Message
  ------------------------------------------------------- */

  const firstError =
    errors.title?.message ||
    errors.industry?.message ||
    errors.location?.message ||
    errors.employmentType?.message ||
    errors.experienceLevel?.message ||
    errors.description?.message ||
    errors.responsibilities?.message ||
    errors.requiredSkills?.message ||
    "";

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-[#172033]">
      {/* -----------------------------------------------------
          Toast
      ----------------------------------------------------- */}

      {toast && (
        <div className="fixed left-1/2 top-4 z-[120] flex -translate-x-1/2 items-center gap-2 rounded-[8px] bg-[#172033] px-4 py-2.5 text-[11px] font-semibold text-white shadow-xl">
          <CheckCircle2
            size={14}
            strokeWidth={1.8}
            className="text-[#34D399]"
          />

          {toast}
        </div>
      )}

      {/* -----------------------------------------------------
          Main Container
      ----------------------------------------------------- */}

      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-5 sm:py-5 md:px-6 lg:px-8 lg:py-6 xl:px-10">
        {/* ---------------------------------------------------
            Page Heading
        --------------------------------------------------- */}

        <section className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between lg:mb-6">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] text-[#71839E] sm:text-[11px]">
              <span>Jobs</span>
              <span>/</span>
              <span className="font-medium text-[#5146E5]">
                {editId ? "Edit Job" : "Create Job"}
              </span>
            </div>

            <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#172033] sm:text-[22px] lg:text-[24px]">
              Create New Job
            </h1>

            <p className="mt-0.5 max-w-[760px] text-[10px] leading-4 text-[#52627B] sm:text-[11px] lg:text-[12px]">
              Add job requirements so ResumeAI can match and rank suitable
              candidates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex h-[36px] w-full items-center justify-center gap-2 rounded-[7px] border border-[#DCE4EE] bg-white px-4 text-[10px] font-semibold text-[#52627B] shadow-[0_1px_2px_rgba(15,23,42,0.02)] transition hover:border-[#C7D2FE] hover:text-[#5146E5] sm:w-auto sm:text-[11px]"
          >
            <Save size={13} strokeWidth={1.8} />
            Save Draft
          </button>
        </section>

        {/* ---------------------------------------------------
            Error
        --------------------------------------------------- */}

        {firstError && (
          <div className="mb-4 flex items-start gap-2 rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-[10px] font-medium text-[#B91C1C] sm:text-[11px]">
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0"
              strokeWidth={1.8}
            />

            <span>{firstError}</span>

            <button
              type="button"
              onClick={() => clearErrors()}
              className="ml-auto"
              aria-label="Close error"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------
            Published State
        --------------------------------------------------- */}

        {published && (
          <div className="mb-4 flex items-center gap-2 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2.5 text-[10px] font-semibold text-[#15803D] sm:text-[11px]">
            <CheckCircle2 size={15} strokeWidth={1.8} />
            Your job has been published and is now visible to students.
          </div>
        )}

        {isLoadingJob && (
          <div className="mb-4 rounded-lg bg-white p-6 text-center text-sm text-[#64748b]">
            Loading job details...
          </div>
        )}

        {/* ---------------------------------------------------
            Basic Information
        --------------------------------------------------- */}

        <section className="mb-3 rounded-[10px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:mb-4 sm:p-4 lg:p-5">
          <div className="mb-4 flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
              <BriefcaseBusiness size={15} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-[12px] font-bold text-[#172033] sm:text-[13px] lg:text-[14px]">
                Basic Information
              </h2>

              <p className="mt-0.5 text-[8px] text-[#71839E] sm:text-[9px]">
                Enter the basic details of the position.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {/* Job Title */}
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
                Job Title <span className="text-[#EF4444]">*</span>
              </span>

              <input
                type="text"
                {...register("title")}
                placeholder="Enter job title"
                className={`h-[38px] w-full rounded-[7px] border bg-white px-3 text-[10px] text-[#172033] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:h-[40px] sm:text-[11px] ${
                  errors.title ? "border-[#EF4444]" : "border-[#DCE4EE]"
                }`}
              />
            </label>

            {/* Industry */}
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
                Industry
              </span>

              <input
                type="text"
                {...register("industry")}
                placeholder="Enter industry"
                className={`h-[38px] w-full rounded-[7px] border bg-white px-3 text-[10px] text-[#172033] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:h-[40px] sm:text-[11px] ${
                  errors.industry ? "border-[#EF4444]" : "border-[#DCE4EE]"
                }`}
              />
            </label>

            {/* Location */}
            <label className="block sm:col-span-2 lg:col-span-2">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
                Location <span className="text-[#EF4444]">*</span>
              </span>

              <input
                type="text"
                {...register("location")}
                placeholder="e.g. Mumbai, Maharashtra"
                className={`h-[38px] w-full rounded-[7px] border bg-white px-3 text-[10px] text-[#172033] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:h-[40px] sm:text-[11px] ${
                  errors.location ? "border-[#EF4444]" : "border-[#DCE4EE]"
                }`}
              />
            </label>

            {/* Employment Type */}
            <label className="relative block sm:col-span-2 lg:col-span-2">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
                Employment Type <span className="text-[#EF4444]">*</span>
              </span>

              <select
                {...register("employmentType")}
                className={`h-[38px] w-full appearance-none rounded-[7px] border bg-white px-3 pr-8 text-[10px] text-[#172033] outline-none transition focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:h-[40px] sm:text-[11px] ${
                  errors.employmentType
                    ? "border-[#EF4444]"
                    : "border-[#DCE4EE]"
                }`}
              >
                <option value="">Select employment type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute bottom-[12px] right-3 text-[#94A3B8]"
              />
            </label>

            {/* Experience */}
            <label className="relative block sm:col-span-2 lg:col-span-2">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
                Experience Level <span className="text-[#EF4444]">*</span>
              </span>

              <select
                {...register("experienceLevel")}
                className={`h-[38px] w-full appearance-none rounded-[7px] border bg-white px-3 pr-8 text-[10px] text-[#172033] outline-none transition focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:h-[40px] sm:text-[11px] ${
                  errors.experienceLevel
                    ? "border-[#EF4444]"
                    : "border-[#DCE4EE]"
                }`}
              >
                <option value="">Select experience level</option>
                <option value="0–3 Years">0–3 Years</option>
                <option value="3–5 Years">3–5 Years</option>
                <option value="5–8 Years">5–8 Years</option>
                <option value="8+ Years">8+ Years</option>
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute bottom-[12px] right-3 text-[#94A3B8]"
              />
            </label>

            {/* Job Status */}
            <label className="relative block sm:col-span-2 lg:col-span-2">
              <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
                Job Status <span className="text-[#EF4444]">*</span>
              </span>

              <select
                {...register("status")}
                className="h-[38px] w-full appearance-none rounded-[7px] border border-[#DCE4EE] bg-white px-3 pr-8 text-[10px] text-[#172033] outline-none transition focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:h-[40px] sm:text-[11px]"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute bottom-[12px] right-3 text-[#94A3B8]"
              />
            </label>
          </div>
        </section>

        {/* ---------------------------------------------------
            Job Details
        --------------------------------------------------- */}

        <section className="mb-3 rounded-[10px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:mb-4 sm:p-4 lg:p-5">
          <div className="mb-4 flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
              <FileText size={15} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-[12px] font-bold text-[#172033] sm:text-[13px] lg:text-[14px]">
                Job Details
              </h2>

              <p className="mt-0.5 text-[8px] text-[#71839E] sm:text-[9px]">
                Provide salary range, description and responsibilities.
              </p>
            </div>
          </div>

          {/* Salary */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
              Salary Range
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex h-[40px] overflow-hidden rounded-[7px] border border-[#DCE4EE] bg-white">
                <div className="flex w-[36px] shrink-0 items-center justify-center bg-[#F8FAFC] text-[11px] font-medium text-[#71839E]">
                  ₹
                </div>

                <input
                  {...register("salaryMin")}
                  placeholder="Minimum salary"
                  className="min-w-0 flex-1 px-3 text-[10px] text-[#172033] outline-none placeholder:text-[#A0AEC0] sm:text-[11px]"
                />
              </div>

              <div className="flex h-[40px] overflow-hidden rounded-[7px] border border-[#DCE4EE] bg-white">
                <div className="flex w-[36px] shrink-0 items-center justify-center bg-[#F8FAFC] text-[11px] font-medium text-[#71839E]">
                  ₹
                </div>

                <input
                  {...register("salaryMax")}
                  placeholder="Maximum salary"
                  className="min-w-0 flex-1 px-3 text-[10px] text-[#172033] outline-none placeholder:text-[#A0AEC0] sm:text-[11px]"
                />

                <div className="hidden items-center pr-3 text-[9px] text-[#71839E] sm:flex">
                  per year
                </div>
              </div>
            </div>

            <p className="mt-1.5 text-[8px] text-[#8FA0B8] sm:hidden">
              per year
            </p>
          </div>

          {/* Description */}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
              Job Description <span className="text-[#EF4444]">*</span>
            </span>

            <textarea
              rows={4}
              {...register("description")}
              placeholder="Describe the role, team and opportunity..."
              className={`min-h-[100px] w-full resize-y rounded-[7px] border bg-white px-3 py-2.5 text-[10px] leading-[1.55] text-[#172033] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:min-h-[88px] sm:text-[11px] ${
                errors.description ? "border-[#EF4444]" : "border-[#DCE4EE]"
              }`}
            />
          </label>

          {/* Responsibilities */}
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
              Responsibilities <span className="text-[#EF4444]">*</span>
            </span>

            <textarea
              rows={4}
              {...register("responsibilities")}
              placeholder="Add the key responsibilities for this role..."
              className={`min-h-[105px] w-full resize-y rounded-[7px] border bg-white px-3 py-2.5 text-[10px] leading-[1.55] text-[#172033] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:min-h-[82px] sm:text-[11px] ${
                errors.responsibilities
                  ? "border-[#EF4444]"
                  : "border-[#DCE4EE]"
              }`}
            />
          </label>
        </section>

        {/* ---------------------------------------------------
            Skills & Requirements
        --------------------------------------------------- */}

        <section className="mb-3 rounded-[10px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:mb-4 sm:p-4 lg:p-5">
          <div className="mb-4 flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
              <Tag size={15} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-[12px] font-bold text-[#172033] sm:text-[13px] lg:text-[14px]">
                Skills & Requirements
              </h2>

              <p className="mt-0.5 text-[8px] text-[#71839E] sm:text-[9px]">
                These requirements will be used by ResumeAI for candidate
                matching.
              </p>
            </div>
          </div>

          {/* Required Skills */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
              Required Skills <span className="text-[#EF4444]">*</span>
            </label>

            <div
              className={`min-h-[58px] rounded-[7px] border bg-white px-2.5 py-2 ${
                errors.requiredSkills ? "border-[#EF4444]" : "border-[#5146E5]"
              }`}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                {requiredSkillFields.map((skill, index) => (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1 rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[8px] font-semibold text-[#5146E5] sm:text-[9px]"
                  >
                    {skill.value}

                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(index)}
                      className="text-[#8B86E8] transition hover:text-[#EF4444]"
                      aria-label={`Remove ${skill.value}`}
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  </span>
                ))}

                {showRequiredInput ? (
                  <input
                    autoFocus
                    value={newRequiredSkill}
                    onChange={(event) =>
                      setNewRequiredSkill(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addRequiredSkill();
                      }

                      if (event.key === "Escape") {
                        setShowRequiredInput(false);
                        setNewRequiredSkill("");
                      }
                    }}
                    onBlur={addRequiredSkill}
                    placeholder="Type a skill..."
                    className="h-6 min-w-[110px] flex-1 bg-transparent px-1 text-[9px] outline-none placeholder:text-[#A0AEC0]"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRequiredInput(true)}
                    className="min-w-[110px] flex-1 px-1 py-1 text-left text-[9px] text-[#A0AEC0] transition hover:text-[#64748B]"
                  >
                    Type a skill and press Enter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="mb-4">
            <label className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
              Preferred Skills
            </label>

            <div className="flex flex-wrap items-center gap-1.5">
              {preferredSkillFields.map((skill, index) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[8px] font-semibold text-[#52627B] sm:text-[9px]"
                >
                  {skill.value}

                  <button
                    type="button"
                    onClick={() => removePreferredSkill(index)}
                    className="text-[#94A3B8] transition hover:text-[#EF4444]"
                    aria-label={`Remove ${skill.value}`}
                  >
                    <X size={10} strokeWidth={2} />
                  </button>
                </span>
              ))}

              {showPreferredInput ? (
                <input
                  autoFocus
                  value={newPreferredSkill}
                  onChange={(event) => setNewPreferredSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addPreferredSkill();
                    }

                    if (event.key === "Escape") {
                      setShowPreferredInput(false);
                      setNewPreferredSkill("");
                    }
                  }}
                  onBlur={addPreferredSkill}
                  placeholder="Add skill..."
                  className="h-6 w-[110px] rounded-[5px] border border-[#DCE4EE] bg-white px-2 text-[9px] outline-none focus:border-[#5146E5]"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPreferredInput(true)}
                  className="inline-flex h-6 items-center gap-1 rounded-[5px] border border-dashed border-[#CBD5E1] px-2 text-[8px] font-medium text-[#8FA0B8] transition hover:border-[#5146E5] hover:text-[#5146E5]"
                >
                  <Plus size={10} />
                  Add
                </button>
              )}
            </div>
          </div>

          {/* Education */}
          <label className="relative block">
            <span className="mb-1.5 block text-[9px] font-semibold text-[#172033] sm:text-[10px]">
              Education Requirement
            </span>

            <select
              {...register("educationRequirement")}
              className="h-[40px] w-full appearance-none rounded-[7px] border border-[#DCE4EE] bg-white px-3 pr-8 text-[10px] text-[#172033] outline-none transition focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10 sm:text-[11px]"
            >
              <option value="">Select education requirement</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Diploma">Diploma</option>
              <option value="Any Degree">Any Degree</option>
              <option value="No Formal Education Required">
                No Formal Education Required
              </option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute bottom-[13px] right-3 text-[#94A3B8]"
            />
          </label>
        </section>

        {/* ---------------------------------------------------
            AI Screening Requirements
        --------------------------------------------------- */}

        <section className="mb-3 rounded-[10px] border border-[#E2D8FF] bg-[#F7F3FF] p-3.5 shadow-[0_1px_2px_rgba(79,70,229,0.025)] sm:mb-4 sm:p-4 lg:p-5">
          <div className="mb-4 flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EDE9FE] text-[#7C3AED]">
              <Sparkles size={15} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-[12px] font-bold text-[#172033] sm:text-[13px] lg:text-[14px]">
                AI Screening Requirements
              </h2>

              <p className="mt-0.5 text-[8px] text-[#71839E] sm:text-[9px]">
                ResumeAI will use these requirements when analyzing resumes and
                ranking candidates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-3">
            {/* Resume Match */}
            <div className="flex min-h-[58px] items-center justify-between gap-3 rounded-[7px] border border-[#DDD6FE] bg-white px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-[#172033] sm:text-[10px]">
                  Resume Skill Match
                </p>

                <p className="mt-0.5 text-[7px] leading-3 text-[#71839E] sm:text-[8px]">
                  Match resume skills with job requirements
                </p>
              </div>

              <Controller
                name="resumeSkillMatch"
                control={control}
                render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Education Match */}
            <div className="flex min-h-[58px] items-center justify-between gap-3 rounded-[7px] border border-[#DDD6FE] bg-white px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-[#172033] sm:text-[10px]">
                  Education Match
                </p>

                <p className="mt-0.5 text-[7px] leading-3 text-[#71839E] sm:text-[8px]">
                  Verify education requirements
                </p>
              </div>

              <Controller
                name="educationMatch"
                control={control}
                render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Experience Match */}
            <div className="flex min-h-[58px] items-center justify-between gap-3 rounded-[7px] border border-[#DDD6FE] bg-white px-3 py-2.5">
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-[#172033] sm:text-[10px]">
                  Experience Match
                </p>

                <p className="mt-0.5 text-[7px] leading-3 text-[#71839E] sm:text-[8px]">
                  Validate candidate experience level
                </p>
              </div>

              <Controller
                name="experienceMatch"
                control={control}
                render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------
            Candidate Assessment
        --------------------------------------------------- */}

        <section className="mb-3 rounded-[10px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:mb-4 sm:p-4 lg:p-5">
          <div className="mb-4 flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
              <ClipboardCheck size={15} strokeWidth={1.7} />
            </div>

            <div>
              <h2 className="text-[12px] font-bold text-[#172033] sm:text-[13px] lg:text-[14px]">
                Candidate Assessment
              </h2>

              <p className="mt-0.5 text-[8px] text-[#71839E] sm:text-[9px]">
                Choose whether shortlisted candidates should complete a skill
                assessment.
              </p>
            </div>
          </div>

          {/* Assessment Toggle */}
          <div className="mb-2.5 flex min-h-[58px] items-center justify-between gap-3 rounded-[7px] border border-[#DCE4EE] bg-[#F8FAFC] px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-[#172033] sm:text-[10px]">
                Require Skill Assessment
              </p>

              <p className="mt-0.5 text-[7px] leading-3 text-[#71839E] sm:text-[8px]">
                Candidates will be asked to complete a job-specific assessment
                after applying
              </p>
            </div>

            <Controller
              name="requireSkillAssessment"
              control={control}
              render={({ field }) => (
                <Toggle checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Assessment Type */}
          <div
            className={`flex min-h-[58px] items-center gap-3 rounded-[7px] border px-3 py-2.5 transition ${
              requireSkillAssessment
                ? "border-[#C7D2FE] bg-[#EEF1FF]"
                : "border-[#DCE4EE] bg-[#F8FAFC] opacity-60"
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] ${
                requireSkillAssessment
                  ? "bg-[#5146E5] text-white"
                  : "bg-[#E2E8F0] text-[#94A3B8]"
              }`}
            >
              <ClipboardCheck size={14} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[8px] text-[#71839E] sm:text-[9px]">
                Assessment Type
              </p>

              <p className="mt-0.5 text-[9px] font-bold text-[#172033] sm:text-[10px]">
                Job-Specific Skill Assessment
              </p>
            </div>

            <button
              type="button"
              disabled={!requireSkillAssessment}
              onClick={() =>
                showToast("Job-specific skill assessment selected")
              }
              className="hidden h-[29px] rounded-[6px] border border-[#DCE4EE] bg-white px-3 text-[8px] font-semibold text-[#52627B] transition hover:border-[#5146E5] hover:text-[#5146E5] disabled:cursor-not-allowed disabled:opacity-60 sm:block"
            >
              Change
            </button>
          </div>
        </section>

        {/* ---------------------------------------------------
            Bottom Actions
        --------------------------------------------------- */}

        <section className="rounded-[10px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.025)] sm:p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-1.5 text-[8px] leading-4 text-[#71839E] sm:text-[9px]">
              <Info
                size={12}
                className="mt-0.5 shrink-0 text-[#8FA0B8]"
                strokeWidth={1.7}
              />

              <span>
                Your job will become visible to students after publishing.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={handleCancel}
                className="flex h-[36px] items-center justify-center rounded-[7px] border border-[#DCE4EE] bg-white px-5 text-[9px] font-semibold text-[#52627B] transition hover:bg-[#F8FAFC] sm:text-[10px]"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handleSubmit(handlePublish)}
                className="col-span-2 flex h-[38px] items-center justify-center gap-2 rounded-[7px] bg-[#5146E5] px-6 text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#453BCF] disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-1 sm:h-[36px] sm:text-[10px]"
              >
                {isPublishing ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={13} strokeWidth={1.8} />
                    {watch("status") === "Active"
                      ? "Publish Job"
                      : watch("status") === "Closed"
                        ? "Close Job"
                        : "Save as Draft"}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Mobile bottom spacing */}
        <div className="h-3 sm:hidden" />
      </div>
    </main>
  );
}
