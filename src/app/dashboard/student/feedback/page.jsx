"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import {
  MessageSquare,
  Star,
  Send,
  Pencil,
  CheckCircle2,
  Clock3,
  Search,
  BriefcaseBusiness,
  MapPin,
  ThumbsUp,
  Loader2,
  X,
  MessageCircle,
} from "lucide-react";

const CATEGORIES = [
  "Recruiter Communication",
  "Interview Experience",
  "Job Description",
  "Hiring Process",
  "Overall Experience",
];

const DEFAULT_VALUES = {
  rating: 0,
  communicationRating: 0,
  processRating: 0,
  category: "Overall Experience",
  title: "",
  message: "",
  wouldRecommend: null,
};

function formatDate(date) {
  if (!date) return "Recently";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RatingStars({ value = 0, onChange, size = 23, readOnly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          aria-label={`Rate ${star} out of 5`}
          onClick={() => onChange?.(star)}
          className={`rounded transition ${
            readOnly ? "cursor-default" : "hover:scale-110"
          }`}
        >
          <Star
            size={size}
            className={
              star <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}

function RatingField({ label, description, value, onChange, error }) {
  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <RatingStars value={value} onChange={onChange} />
        <span className="text-sm font-medium text-gray-600">
          {value ? `${value}/5` : "Not rated"}
        </span>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function StudentFeedbackPage() {
  const [applications, setApplications] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const rating = watch("rating");
  const communicationRating = watch("communicationRating");
  const processRating = watch("processRating");
  const wouldRecommend = watch("wouldRecommend");
  const message = watch("message");

  const selectedApplication = applications.find(
    (item) => item.applicationId === selectedId,
  );

  const submittedCount = applications.filter((item) => item.feedback).length;

  const averageRating = useMemo(() => {
    const ratings = applications
      .filter((item) => item.feedback)
      .map((item) => item.feedback.rating);

    if (!ratings.length) return "—";

    return (
      ratings.reduce((sum, value) => sum + value, 0) / ratings.length
    ).toFixed(1);
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return applications;

    return applications.filter((item) =>
      [item.jobTitle, item.companyName, item.recruiterName]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [applications, search]);

  async function fetchApplications() {
    try {
      setLoading(true);
      setPageError("");

      const response = await axios.get("/api/student/feedback");

      setApplications(response.data.data || []);
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
          "Unable to load your applications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  function openFeedback(application) {
    setSelectedId(application.applicationId);
    setSuccessMessage("");
    setPageError("");

    const existing = application.feedback;

    reset(
      existing
        ? {
            rating: existing.rating,
            communicationRating: existing.communicationRating,
            processRating: existing.processRating,
            category: existing.category,
            title: existing.title,
            message: existing.message,
            wouldRecommend: existing.wouldRecommend,
          }
        : DEFAULT_VALUES,
    );

    setShowForm(true);
  }

  async function onSubmit(values) {
    if (!selectedApplication) return;

    try {
      setSubmitting(true);
      setPageError("");
      setSuccessMessage("");

      const response = await axios.post("/api/student/feedback", {
        applicationId: selectedApplication.applicationId,
        rating: values.rating,
        communicationRating: values.communicationRating,
        processRating: values.processRating,
        category: values.category,
        title: values.title,
        message: values.message,
        wouldRecommend: values.wouldRecommend,
      });

      setApplications((previous) =>
        previous.map((item) =>
          item.applicationId === selectedId
            ? {
                ...item,
                feedback: response.data.data,
              }
            : item,
        ),
      );

      setSuccessMessage(response.data.message);
      setShowForm(false);
      reset(DEFAULT_VALUES);
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
          "Unable to save feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <MessageSquare size={16} />
              <span>Student Dashboard</span>
              <span>/</span>
              <span className="text-indigo-600">Feedback</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Recruiter & Job Feedback
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Share your experience with recruiters and the hiring process. Your
              feedback helps improve the experience for future applicants.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <MessageCircle size={18} />
            <span className="font-medium">Your experience matters</span>
          </div>
        </div>

        {/* Alerts */}
        {pageError && (
          <div
            role="alert"
            className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={BriefcaseBusiness}
            label="Applied Jobs"
            value={loading ? "—" : applications.length}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            icon={CheckCircle2}
            label="Feedback Submitted"
            value={loading ? "—" : submittedCount}
            color="bg-green-50 text-green-600"
          />

          <StatCard
            icon={Star}
            label="Average Rating Given"
            value={loading ? "—" : averageRating}
            color="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Applications */}
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Your Applications
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select an application to submit or update feedback.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search jobs or recruiters..."
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
                <p className="mt-3 text-sm">Loading your applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-14 text-center">
                <BriefcaseBusiness
                  size={34}
                  className="mx-auto text-gray-300"
                />
                <h3 className="mt-3 font-semibold text-gray-800">
                  {applications.length
                    ? "No matching applications"
                    : "No applications yet"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {applications.length
                    ? "Try another search term."
                    : "Your applied jobs will appear here when available."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredApplications.map((application) => {
                  const hasFeedback = Boolean(application.feedback);

                  return (
                    <article
                      key={application.applicationId}
                      className="rounded-xl border border-gray-200 p-4 transition hover:border-indigo-200 hover:shadow-sm sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">
                            {application.jobTitle}
                          </h3>

                          <p className="mt-1 text-sm text-gray-600">
                            {application.companyName}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                            hasFeedback
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {hasFeedback
                            ? "Feedback submitted"
                            : "Awaiting feedback"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <BriefcaseBusiness size={15} />
                          <span>Recruiter: {application.recruiterName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={15} />
                          <span>{application.location}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock3 size={15} />
                          <span>
                            Applied {formatDate(application.appliedAt)}
                          </span>
                        </div>
                      </div>

                      {hasFeedback && (
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                          <div>
                            <p className="text-xs text-gray-500">Your rating</p>
                            <div className="mt-1 flex items-center gap-2">
                              <RatingStars
                                value={application.feedback.rating}
                                size={16}
                                readOnly
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                {application.feedback.rating}/5
                              </span>
                            </div>
                          </div>

                          <span className="text-xs text-gray-400">
                            Updated {formatDate(application.feedback.updatedAt)}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => openFeedback(application)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        {hasFeedback ? (
                          <>
                            <Pencil size={16} />
                            Edit Feedback
                          </>
                        ) : (
                          <>
                            <MessageSquare size={16} />
                            Give Feedback
                          </>
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Feedback form */}
        {showForm && selectedApplication && (
          <section
            id="feedback-form"
            className="scroll-mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedApplication.feedback
                    ? "Update Your Feedback"
                    : "Share Your Experience"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedApplication.jobTitle} ·{" "}
                  {selectedApplication.companyName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close feedback form"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-7">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <RatingField
                  label="Overall Experience"
                  description="How was your overall experience?"
                  value={rating}
                  onChange={(value) =>
                    setValue("rating", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  error={errors.rating?.message}
                />

                <RatingField
                  label="Recruiter Communication"
                  description="Was communication clear and timely?"
                  value={communicationRating}
                  onChange={(value) =>
                    setValue("communicationRating", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  error={errors.communicationRating?.message}
                />

                <RatingField
                  label="Hiring Process"
                  description="How smooth was the hiring process?"
                  value={processRating}
                  onChange={(value) =>
                    setValue("processRating", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  error={errors.processRating?.message}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Feedback Category
                  </label>

                  <select
                    id="category"
                    {...register("category", {
                      required: "Please select a category.",
                    })}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Feedback Title
                  </label>

                  <input
                    id="title"
                    {...register("title", {
                      required: "Please enter a title.",
                      minLength: {
                        value: 3,
                        message: "At least 3 characters required.",
                      },
                      maxLength: {
                        value: 100,
                        message: "Maximum 100 characters allowed.",
                      },
                    })}
                    placeholder="Summarize your experience"
                    className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Your Feedback
                  </label>
                  <span className="text-xs text-gray-400">
                    {message?.length || 0}/2000
                  </span>
                </div>

                <textarea
                  id="message"
                  rows={5}
                  {...register("message", {
                    required: "Please write your feedback.",
                    minLength: {
                      value: 20,
                      message: "Please enter at least 20 characters.",
                    },
                    maxLength: {
                      value: 2000,
                      message: "Maximum 2000 characters allowed.",
                    },
                  })}
                  placeholder="Tell us about your experience with the recruiter, job description, communication, and hiring process..."
                  className="w-full resize-y rounded-xl border border-gray-200 px-3 py-3 text-sm leading-6 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-gray-50 p-4 sm:p-5">
                <p className="text-sm font-semibold text-gray-800">
                  Would you recommend this job opportunity?
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Based on your experience, would you recommend applying to this
                  recruiter or company?
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    { value: true, label: "Yes, I would" },
                    { value: false, label: "No, I wouldn't" },
                  ].map((option) => (
                    <label
                      key={String(option.value)}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                        wouldRecommend === option.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        value={String(option.value)}
                        checked={wouldRecommend === option.value}
                        onChange={() =>
                          setValue("wouldRecommend", option.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className="accent-indigo-600"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                <input
                  type="hidden"
                  {...register("wouldRecommend", {
                    validate: (value) =>
                      typeof value === "boolean" || "Please select an option.",
                  })}
                />

                {errors.wouldRecommend && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.wouldRecommend.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {selectedApplication.feedback
                        ? "Update Feedback"
                        : "Submit Feedback"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Helpful note */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <ThumbsUp size={19} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Help make hiring better
            </p>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              Please keep your feedback respectful and based on your actual
              application experience. Avoid sharing private contact details or
              sensitive personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
