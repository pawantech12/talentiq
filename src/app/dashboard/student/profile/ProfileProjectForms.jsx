"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/api";

const inputClass =
  "h-11 w-full rounded-[7px] border border-[#DCE4EE] bg-white px-3 text-[13px] text-[#172033] outline-none focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10";

const labelClass = "mb-1.5 block text-[12px] font-semibold text-[#52627B]";

const errorClass = "mt-1 text-[11px] text-red-600";

function ProjectForm({ initialData, onSave, onCancel }) {
  const [media, setMedia] = useState(initialData?.media || []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      technologies: initialData?.technologies?.join(", ") || "",
      projectUrl: initialData?.projectUrl || "",
      repositoryUrl: initialData?.repositoryUrl || "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
    },
  });

  async function uploadMedia(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setUploading(true);
    setUploadError("");

    try {
      const uploaded = [];

      for (const file of files) {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("kind", "project-media");

        const response = await api.post("/profile/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        uploaded.push(response.data.file);
      }

      setMedia((previous) => [...previous, ...uploaded]);
    } catch (error) {
      setUploadError(error.message || "Media upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function removeMedia(item) {
    try {
      await api.delete("/profile/upload", {
        data: { publicId: item.publicId },
      });

      setMedia((previous) =>
        previous.filter((file) => file.publicId !== item.publicId),
      );
    } catch (error) {
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Unable to remove image",
      );
    }
  }

  const submit = async (values) => {
    await onSave({
      ...initialData,
      title: values.title.trim(),
      description: values.description.trim(),
      technologies: values.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      projectUrl: values.projectUrl.trim(),
      repositoryUrl: values.repositoryUrl.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      media,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <label className="block">
        <span className={labelClass}>Project Title *</span>
        <input
          {...register("title", {
            required: "Project title is required",
            maxLength: {
              value: 120,
              message: "Maximum 120 characters",
            },
          })}
          className={inputClass}
          placeholder="ResumeAI"
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </label>

      <label className="block">
        <span className={labelClass}>Description *</span>
        <textarea
          {...register("description", {
            required: "Description is required",
            maxLength: {
              value: 2000,
              message: "Maximum 2000 characters",
            },
          })}
          rows={4}
          className="w-full rounded-[7px] border border-[#DCE4EE] px-3 py-2.5 text-[13px] outline-none focus:border-[#5146E5]"
          placeholder="Describe the project, your contribution and its impact."
        />
        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </label>

      <label className="block">
        <span className={labelClass}>Technologies</span>
        <input
          {...register("technologies")}
          className={inputClass}
          placeholder="React, Next.js, MongoDB"
        />
        <p className="mt-1 text-[10px] text-[#8FA0B8]">
          Separate technologies with commas.
        </p>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Project URL</span>
          <input
            {...register("projectUrl", {
              pattern: {
                value: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}([/?#].*)?$/i,
                message: "Enter a valid URL",
              },
            })}
            className={inputClass}
            placeholder="https://myproject.com"
          />
          {errors.projectUrl && (
            <p className={errorClass}>{errors.projectUrl.message}</p>
          )}
        </label>

        <label className="block">
          <span className={labelClass}>Repository URL</span>
          <input
            {...register("repositoryUrl", {
              pattern: {
                value: /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}([/?#].*)?$/i,
                message: "Enter a valid URL",
              },
            })}
            className={inputClass}
            placeholder="https://github.com/..."
          />
          {errors.repositoryUrl && (
            <p className={errorClass}>{errors.repositoryUrl.message}</p>
          )}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Start Date</span>
          <input
            type="date"
            {...register("startDate")}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>End Date</span>
          <input type="date" {...register("endDate")} className={inputClass} />
        </label>
      </div>

      <div>
        <span className={labelClass}>Project Images</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={uploadMedia}
          className="block w-full text-[12px] text-[#52627B]"
        />

        {uploading && (
          <p className="mt-2 text-[11px] text-[#5146E5]">Uploading images...</p>
        )}

        {uploadError && <p className={errorClass}>{uploadError}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {media.map((item) => (
            <div key={item.publicId} className="relative">
              <img
                src={item.secureUrl}
                alt="Project media"
                className="h-16 w-16 rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => removeMedia(item)}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 py-0.5 text-xs text-white"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="h-10 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Project"}
        </button>
      </div>
    </form>
  );
}

function PortfolioForm({ initialData, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      url: initialData?.url || "",
      type: initialData?.type || "Other",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave({
          ...initialData,
          title: values.title.trim(),
          url: values.url.trim(),
          type: values.type,
        });
      })}
      className="space-y-4"
    >
      <label className="block">
        <span className={labelClass}>Link Title *</span>
        <input
          {...register("title", {
            required: "Link title is required",
            maxLength: 80,
          })}
          className={inputClass}
          placeholder="GitHub Profile"
        />
        {errors.title && <p className={errorClass}>Enter a link title.</p>}
      </label>

      <label className="block">
        <span className={labelClass}>URL *</span>
        <input
          {...register("url", {
            required: "URL is required",
            validate: (value) => {
              try {
                const url = new URL(value);
                return ["http:", "https:"].includes(url.protocol);
              } catch {
                return "Enter a valid HTTP or HTTPS URL";
              }
            },
          })}
          className={inputClass}
          placeholder="https://github.com/username"
        />
        {errors.url && <p className={errorClass}>{errors.url.message}</p>}
      </label>

      <label className="block">
        <span className={labelClass}>Link Type</span>
        <select {...register("type")} className={inputClass}>
          <option value="GitHub">GitHub</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Portfolio">Portfolio</option>
          <option value="Behance">Behance</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Link"}
        </button>
      </div>
    </form>
  );
}

export default function ProfileProjectForms({
  mode,
  initialData,
  onSave,
  onCancel,
}) {
  const modalTitles = {
    project: initialData ? "Edit Project" : "Add Project Experience",
    portfolio: initialData ? "Edit Portfolio Link" : "Add Portfolio Link",
    experience: initialData ? "Edit Experience" : "Add Experience",
    education: initialData ? "Edit Education" : "Add Education",
  };

  const modalDescriptions = {
    project: "Add details about a project you have worked on.",
    portfolio: "Add a link to your professional work.",
    experience: "Add details about your professional experience.",
    education: "Add your academic qualifications.",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#172033]/40 px-3 py-4 backdrop-blur-[2px]">
      <div className="max-h-[92vh] w-full max-w-[580px] overflow-y-auto rounded-[13px] bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#172033]">
              {modalTitles[mode]}
            </h2>

            <p className="mt-1 text-[12px] text-[#8FA0B8]">
              {modalDescriptions[mode]}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B]"
          >
            ×
          </button>
        </div>

        {mode === "project" && (
          <ProjectForm
            key={`project-${initialData?._id || "new"}`}
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}

        {mode === "portfolio" && (
          <PortfolioForm
            key={`portfolio-${initialData?._id || "new"}`}
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}

        {mode === "experience" && (
          <ExperienceForm
            key={`experience-${initialData?._id || "new"}`}
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}

        {mode === "education" && (
          <EducationForm
            key={`education-${initialData?._id || "new"}`}
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
}

function ExperienceForm({ initialData, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: initialData?.title || "",
      company: initialData?.company || "",
      duration: initialData?.duration || "",
      description: initialData?.description || "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave({
          ...initialData,
          title: values.title.trim(),
          company: values.company.trim(),
          duration: values.duration.trim(),
          description: values.description.trim(),
        });
      })}
      className="space-y-4"
    >
      <label className="block">
        <span className={labelClass}>Job Title *</span>
        <input
          {...register("title", {
            required: "Job title is required",
            maxLength: {
              value: 120,
              message: "Maximum 120 characters",
            },
          })}
          className={inputClass}
          placeholder="Frontend Developer"
        />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Company *</span>
          <input
            {...register("company", {
              required: "Company name is required",
              maxLength: 120,
            })}
            className={inputClass}
            placeholder="Company name"
          />
          {errors.company && (
            <p className={errorClass}>{errors.company.message}</p>
          )}
        </label>

        <label className="block">
          <span className={labelClass}>Duration</span>
          <input
            {...register("duration", {
              maxLength: 80,
            })}
            className={inputClass}
            placeholder="Jan 2024 - Present"
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea
          {...register("description", {
            maxLength: {
              value: 2000,
              message: "Maximum 2000 characters",
            },
          })}
          rows={4}
          className="w-full resize-none rounded-[7px] border border-[#DCE4EE] px-3 py-2.5 text-[13px] leading-5 outline-none focus:border-[#5146E5]"
          placeholder="Describe your responsibilities and achievements."
        />
        {errors.description && (
          <p className={errorClass}>{errors.description.message}</p>
        )}
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Experience"}
        </button>
      </div>
    </form>
  );
}

function EducationForm({ initialData, onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      degree: initialData?.degree || "",
      university: initialData?.university || "",
      period: initialData?.period || "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSave({
          ...initialData,
          degree: values.degree.trim(),
          university: values.university.trim(),
          period: values.period.trim(),
        });
      })}
      className="space-y-4"
    >
      <label className="block">
        <span className={labelClass}>Degree *</span>
        <input
          {...register("degree", {
            required: "Degree is required",
            maxLength: 150,
          })}
          className={inputClass}
          placeholder="Bachelor of Computer Applications"
        />
        {errors.degree && <p className={errorClass}>{errors.degree.message}</p>}
      </label>

      <label className="block">
        <span className={labelClass}>University / Institution *</span>
        <input
          {...register("university", {
            required: "University name is required",
            maxLength: 150,
          })}
          className={inputClass}
          placeholder="University name"
        />
        {errors.university && (
          <p className={errorClass}>{errors.university.message}</p>
        )}
      </label>

      <label className="block">
        <span className={labelClass}>Period</span>
        <input
          {...register("period", {
            maxLength: 80,
          })}
          className={inputClass}
          placeholder="2022 - 2025"
        />
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Education"}
        </button>
      </div>
    </form>
  );
}
