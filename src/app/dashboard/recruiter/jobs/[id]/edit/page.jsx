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
  Send,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";

const EMPTY_JOB_VALUES = {
  title: "",
  department: "",
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
};

const getEmptyJobValues = () => ({
  ...EMPTY_JOB_VALUES,
  requiredSkills: [],
  preferredSkills: [],
});

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];

  return skills
    .map((skill) => {
      if (typeof skill === "string") {
        return {
          value: skill,
        };
      }

      if (skill && typeof skill.value === "string") {
        return {
          value: skill.value,
        };
      }

      return null;
    })
    .filter((skill) => skill?.value?.trim());
}

function normalizeJob(job) {
  return {
    ...getEmptyJobValues(),
    ...job,
    requiredSkills: normalizeSkills(job?.requiredSkills),
    preferredSkills: normalizeSkills(job?.preferredSkills),
    assessmentType: job?.assessmentType || "Job-Specific Skill Assessment",
  };
}

function serializeJob(formData, existingJob) {
  return {
    ...existingJob,
    ...formData,

    title: formData.title.trim(),
    department: formData.department.trim(),
    location: formData.location.trim(),
    description: formData.description.trim(),
    responsibilities: formData.responsibilities.trim(),

    requiredSkills: formData.requiredSkills
      .map((skill) => skill.value.trim())
      .filter(Boolean),

    preferredSkills: formData.preferredSkills
      .map((skill) => skill.value.trim())
      .filter(Boolean),

    assessmentType: formData.assessmentType || "Job-Specific Skill Assessment",

    updatedAt: new Date().toISOString(),
  };
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? "bg-[#111827]" : "bg-gray-300"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();

  const jobId = params?.id;

  const [existingJob, setExistingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const toastTimerRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: getEmptyJobValues(),
  });

  const {
    fields: requiredSkills,
    append: appendRequiredSkill,
    remove: removeRequiredSkill,
  } = useFieldArray({
    control,
    name: "requiredSkills",
  });

  const {
    fields: preferredSkills,
    append: appendPreferredSkill,
    remove: removePreferredSkill,
  } = useFieldArray({
    control,
    name: "preferredSkills",
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState("");
  const [newPreferredSkill, setNewPreferredSkill] = useState("");

  const [showRequiredSkillInput, setShowRequiredSkillInput] = useState(false);

  const [showPreferredSkillInput, setShowPreferredSkillInput] = useState(false);

  const requireSkillAssessment = watch("requireSkillAssessment");

  /*
   * Load the existing published job.
   *
   * Your Create Job page stores the currently published job under:
   * resumeai-published-job
   */
  useEffect(() => {
    try {
      const storedJob = window.localStorage.getItem("resumeai-published-job");

      if (!storedJob) {
        setError("The job you are trying to edit could not be found.");
        setLoading(false);
        return;
      }

      const parsedJob = JSON.parse(storedJob);

      /*
       * If the stored job contains an id, make sure it matches
       * the dynamic route.
       *
       * If your current create page does not yet store an id,
       * the job is still loaded so the existing flow continues
       * to work.
       */
      if (parsedJob?.id && jobId && String(parsedJob.id) !== String(jobId)) {
        setError("The job you are trying to edit could not be found.");
        setLoading(false);
        return;
      }

      const normalizedJob = normalizeJob(parsedJob);

      setExistingJob(parsedJob);
      reset(normalizedJob);
      setLoading(false);
    } catch {
      setError("Unable to load the job details.");
      setLoading(false);
    }
  }, [jobId, reset]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message) => {
    setToast(message);

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const addRequiredSkill = () => {
    const skill = newRequiredSkill.trim();

    if (!skill) return;

    const alreadyExists = requiredSkills.some(
      (item) => item.value.toLowerCase() === skill.toLowerCase(),
    );

    if (alreadyExists) {
      setError("This required skill has already been added.");
      return;
    }

    appendRequiredSkill({
      value: skill,
    });

    setNewRequiredSkill("");
    setShowRequiredSkillInput(false);
    setError("");
  };

  const addPreferredSkill = () => {
    const skill = newPreferredSkill.trim();

    if (!skill) return;

    const alreadyExists = preferredSkills.some(
      (item) => item.value.toLowerCase() === skill.toLowerCase(),
    );

    if (alreadyExists) {
      setError("This preferred skill has already been added.");
      return;
    }

    appendPreferredSkill({
      value: skill,
    });

    setNewPreferredSkill("");
    setShowPreferredSkillInput(false);
    setError("");
  };

  const handleCancel = () => {
    if (existingJob) {
      reset(normalizeJob(existingJob));
    }

    setNewRequiredSkill("");
    setNewPreferredSkill("");
    setShowRequiredSkillInput(false);
    setShowPreferredSkillInput(false);
    setError("");
  };

  const handleSaveDraft = () => {
    const formData = getValues();

    const updatedJob = serializeJob(formData, existingJob);

    window.localStorage.setItem(
      "resumeai-recruiter-job-draft",
      JSON.stringify(updatedJob),
    );

    showToast("Job changes saved as draft.");
  };

  const handleUpdateJob = (formData) => {
    setError("");

    const title = formData.title.trim();
    const department = formData.department.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();
    const responsibilities = formData.responsibilities.trim();

    if (!title) {
      setError("Please enter a job title.");
      return;
    }

    if (!department) {
      setError("Please enter a department.");
      return;
    }

    if (!location) {
      setError("Please enter a job location.");
      return;
    }

    if (!description) {
      setError("Please enter a job description.");
      return;
    }

    if (!responsibilities) {
      setError("Please enter the key responsibilities.");
      return;
    }

    if (formData.requiredSkills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    setIsUpdating(true);

    const updatedJob = serializeJob(formData, existingJob);

    /*
     * Preserve the original id.
     *
     * If the old Create page did not generate an id,
     * generate one here so future edit routes have a stable id.
     */
    const finalJob = {
      ...updatedJob,
      id: existingJob?.id || jobId || `job-${Date.now()}`,
    };

    setTimeout(() => {
      window.localStorage.setItem(
        "resumeai-published-job",
        JSON.stringify(finalJob),
      );

      /*
       * Remove an old create draft after the published
       * job has successfully been updated.
       */
      window.localStorage.removeItem("resumeai-recruiter-job-draft");

      setExistingJob(finalJob);
      reset(normalizeJob(finalJob));

      setIsUpdating(false);
      showToast("Job updated successfully.");
    }, 700);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <div className="animate-pulse space-y-5">
              <div className="h-8 w-64 rounded bg-gray-200" />
              <div className="h-4 w-96 rounded bg-gray-200" />
              <div className="h-32 rounded bg-gray-100" />
              <div className="h-32 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!existingJob) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-white p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <h2 className="font-semibold text-gray-900">Job not found</h2>

                <p className="mt-1 text-sm text-gray-600">
                  {error ||
                    "The job you are trying to edit could not be found."}
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/recruiter/jobs")}
                  className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Back to Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <BriefcaseBusiness className="h-6 w-6 text-gray-900" />

              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Edit Job
              </h1>
            </div>

            <p className="text-sm text-gray-600 sm:text-base">
              Update the details of your existing job posting.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Success Toast */}
        {toast && (
          <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />

            <span className="text-sm font-medium text-gray-800">{toast}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(handleUpdateJob)}>
          <div className="space-y-6">
            {/* Basic Information */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <FileText className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Provide the core information about this position.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Job Title
                  </label>

                  <input
                    {...register("title")}
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Department
                  </label>

                  <input
                    {...register("department")}
                    type="text"
                    placeholder="e.g. Engineering"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Location
                  </label>

                  <input
                    {...register("location")}
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            </section>

            {/* Job Details */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <BriefcaseBusiness className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Job Details
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Define the employment details and responsibilities.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Employment Type
                  </label>

                  <div className="relative">
                    <select
                      {...register("employmentType")}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">Select employment type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Temporary">Temporary</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Experience Level
                  </label>

                  <div className="relative">
                    <select
                      {...register("experienceLevel")}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">Select experience</option>
                      <option value="0–3 Years">0–3 Years</option>
                      <option value="3–5 Years">3–5 Years</option>
                      <option value="5–8 Years">5–8 Years</option>
                      <option value="8+ Years">8+ Years</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Education
                  </label>

                  <div className="relative">
                    <select
                      {...register("educationRequirement")}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">Select education</option>
                      <option value="High School">High School</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor’s Degree">
                        Bachelor’s Degree
                      </option>
                      <option value="Master’s Degree">Master’s Degree</option>
                      <option value="Doctorate">Doctorate</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Salary Range
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      {...register("salaryMin")}
                      type="text"
                      placeholder="Minimum salary"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />

                    <input
                      {...register("salaryMax")}
                      type="text"
                      placeholder="Maximum salary"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Job Description
                  </label>

                  <textarea
                    {...register("description")}
                    rows={6}
                    placeholder="Describe the role, team, company and what the candidate will be working on..."
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Key Responsibilities
                  </label>

                  <textarea
                    {...register("responsibilities")}
                    rows={6}
                    placeholder="List the main responsibilities for this position..."
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Tag className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Skills & Requirements
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add the skills candidates should have for this role.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Required Skills */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Required Skills
                    </label>

                    <span className="text-xs text-gray-500">Required</span>
                  </div>

                  <div className="rounded-lg border border-gray-300 p-3">
                    <div className="flex flex-wrap gap-2">
                      {requiredSkills.map((skill, index) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-800"
                        >
                          {skill.value}

                          <button
                            type="button"
                            onClick={() => removeRequiredSkill(index)}
                            className="text-gray-500 transition hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}

                      {showRequiredSkillInput ? (
                        <div className="flex min-w-[220px] flex-1 items-center gap-2">
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
                                setShowRequiredSkillInput(false);
                                setNewRequiredSkill("");
                              }
                            }}
                            type="text"
                            placeholder="Enter skill"
                            className="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
                          />

                          <button
                            type="button"
                            onClick={addRequiredSkill}
                            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                          >
                            Add
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRequiredSkillInput(true)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-gray-500 hover:text-gray-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Skill
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preferred Skills */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Preferred Skills
                    </label>

                    <span className="text-xs text-gray-500">Optional</span>
                  </div>

                  <div className="rounded-lg border border-gray-300 p-3">
                    <div className="flex flex-wrap gap-2">
                      {preferredSkills.map((skill, index) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-800"
                        >
                          {skill.value}

                          <button
                            type="button"
                            onClick={() => removePreferredSkill(index)}
                            className="text-gray-500 transition hover:text-red-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}

                      {showPreferredSkillInput ? (
                        <div className="flex min-w-[220px] flex-1 items-center gap-2">
                          <input
                            autoFocus
                            value={newPreferredSkill}
                            onChange={(event) =>
                              setNewPreferredSkill(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                addPreferredSkill();
                              }

                              if (event.key === "Escape") {
                                setShowPreferredSkillInput(false);
                                setNewPreferredSkill("");
                              }
                            }}
                            type="text"
                            placeholder="Enter skill"
                            className="min-w-0 flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none"
                          />

                          <button
                            type="button"
                            onClick={addPreferredSkill}
                            className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                          >
                            Add
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowPreferredSkillInput(true)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:border-gray-500 hover:text-gray-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Skill
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Screening */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <Sparkles className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI Screening Requirements
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure how AI should screen candidates for this position.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                {/* Resume Skill Match */}
                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Resume Skill Match
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Check whether the candidate's resume matches the
                        required skills.
                      </p>
                    </div>
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
                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Education Match
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Compare the candidate's education with the specified
                        requirement.
                      </p>
                    </div>
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
                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Experience Match
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Compare the candidate's experience with the selected
                        experience level.
                      </p>
                    </div>
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

            {/* Assessment */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <ClipboardCheck className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Candidate Assessment
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure the assessment candidates will complete.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200">
                <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <ClipboardCheck className="h-5 w-5 text-gray-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Require Skill Assessment
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Require candidates to complete an assessment before
                        moving forward.
                      </p>
                    </div>
                  </div>

                  <Controller
                    name="requireSkillAssessment"
                    control={control}
                    render={({ field }) => (
                      <Toggle checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>

                <div className="border-t border-gray-100 p-4 sm:p-5">
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Assessment Type
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        Job-Specific Skill Assessment
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Candidates will be assessed against the skills and
                        requirements defined for this position.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUpdating}
                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isUpdating}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isUpdating ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Update Job
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
