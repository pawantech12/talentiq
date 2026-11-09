"use client";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Code2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Target,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useStudentProfile } from "./useStudentProfile.js";
import ProfileProjectForms from "./ProfileProjectForms.jsx";
import api from "@/lib/api.js";

export default function StudentProfilePage() {
  const resumeInputRef = useRef(null);

  const {
    profile,
    setProfile,
    loading,
    saving,
    error,
    loadProfile,
    updateProfile,
    saveProject,
    deleteProject,
    savePortfolioLink,
    deletePortfolioLink,
    saveExperience,
    deleteExperience,

    saveEducation,
    deleteEducation,
  } = useStudentProfile();

  const [projectModal, setProjectModal] = useState(false);
  const [portfolioModal, setPortfolioModal] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [editingPortfolio, setEditingPortfolio] = useState(null);

  const [showToast, setShowToast] = useState("");
  const [resumeUploading, setResumeUploading] = useState(false);

  const [experienceModal, setExperienceModal] = useState(false);
  const [educationModal, setEducationModal] = useState(false);

  const [editingExperience, setEditingExperience] = useState(null);
  const [editingEducation, setEditingEducation] = useState(null);

  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(null);
  const [showSkillsEditor, setShowSkillsEditor] = useState(false);
  const [showExperienceEditor, setShowExperienceEditor] = useState(false);
  const [showEducationEditor, setShowEducationEditor] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);

  const notify = (message) => {
    setShowToast(message);

    window.clearTimeout(window.__resumeAiToastTimer);

    window.__resumeAiToastTimer = window.setTimeout(() => {
      setShowToast("");
    }, 2200);
  };

  const [draftProfile, setDraftProfile] = useState({});
  const [newSkill, setNewSkill] = useState("");

  const [draftExperience, setDraftExperience] = useState({
    title: "",
    company: "",
    duration: "",
    description: "",
  });

  const [draftEducation, setDraftEducation] = useState({
    degree: "",
    university: "",
    period: "",
  });

  const skills = profile.skills || [];
  const projects = profile.projects || [];
  const portfolioLinks = profile.portfolioLinks || [];
  const experiences = profile.experiences || [];
  const education = profile.education || [];
  const resume = profile.resume;

  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [editingEducationId, setEditingEducationId] = useState(null);

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(profile.fullName?.trim()),
      Boolean(profile.email?.trim()),
      Boolean(profile.phone?.trim()),
      Boolean(profile.location?.trim()),
      Boolean(profile.dob),
      Boolean(profile.role?.trim()),
      Boolean(profile.currentRole?.trim()),
      Boolean(profile.careerGoal?.trim()),
      Boolean(profile.preferredLocation?.trim()),
      Boolean(profile.expectedRole?.trim()),
      Boolean(profile.experienceLevel?.trim()),
      skills.length > 0,
      education.length > 0,
      experiences.length > 0,
      projects.length > 0,
      portfolioLinks.length > 0,
      Boolean(resume?.publicId),
    ];

    const completed = checks.filter(Boolean).length;

    return Math.round((completed / checks.length) * 100);
  }, [
    profile,
    skills.length,
    education.length,
    experiences.length,
    projects.length,
    portfolioLinks.length,
    resume,
  ]);

  const openExperienceEditor = (experience = null) => {
    setEditingExperience(experience);
    setExperienceModal(true);
  };

  const handleSaveExperience = async (experience) => {
    try {
      await saveExperience(experience);

      setExperienceModal(false);
      setEditingExperience(null);

      notify("Experience saved successfully");
    } catch (error) {
      notify(error.message || "Unable to save experience");
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) {
      return;
    }

    try {
      await deleteExperience(experienceId);

      notify("Experience deleted successfully");
    } catch (error) {
      notify(error.message || "Unable to delete experience");
    }
  };

  const handleSaveEducation = async (educationItem) => {
    try {
      await saveEducation(educationItem);

      setEducationModal(false);
      setEditingEducation(null);

      notify("Education saved successfully");
    } catch (error) {
      notify(error.message || "Unable to save education");
    }
  };

  const handleDeleteEducation = async (educationId) => {
    if (
      !window.confirm("Are you sure you want to delete this education record?")
    ) {
      return;
    }

    try {
      await deleteEducation(educationId);

      notify("Education deleted successfully");
    } catch (error) {
      notify(error.message || "Unable to delete education");
    }
  };

  const openEducationEditor = (educationItem = null) => {
    setEditingEducation(educationItem);
    setEducationModal(true);
  };

  const openProfileEditor = () => {
    setDraftProfile({ ...profile });
    setShowProfileEditor(true);
  };

  const openSectionEditor = (section) => {
    setDraftProfile({ ...profile });
    setShowSectionEditor(section);
  };

  const saveProfile = async () => {
    try {
      await updateProfile({
        fullName: draftProfile.fullName,
        role: draftProfile.role,
      });

      setShowProfileEditor(false);
      notify("Profile updated successfully");
    } catch (err) {
      notify(err.message);
    }
  };

  const saveSection = async () => {
    try {
      const fields =
        showSectionEditor === "personal"
          ? {
              phone: draftProfile.phone,
              location: draftProfile.location,
              dob: draftProfile.dob,
            }
          : {
              currentRole: draftProfile.currentRole,
              careerGoal: draftProfile.careerGoal,
              preferredLocation: draftProfile.preferredLocation,
              experienceLevel: draftProfile.experienceLevel,
              expectedRole: draftProfile.expectedRole,
            };

      await updateProfile(fields);

      setShowSectionEditor(null);
      notify("Information updated successfully");
    } catch (err) {
      notify(err.message);
    }
  };

  const addSkill = () => {
    const value = newSkill.trim();

    if (!value) return;

    if (skills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      notify("Skill already added");
      return;
    }

    if (skills.length >= 50) {
      notify("Maximum 50 skills allowed");
      return;
    }

    setProfileSkills([...skills, value]);
  };

  async function setProfileSkills(nextSkills) {
    try {
      await updateProfile({ skills: nextSkills });
      setNewSkill("");
    } catch (err) {
      notify(err.message);
    }
  }

  const removeSkill = async (skillToRemove) => {
    await setProfileSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const saveSkills = () => {
    setShowSkillsEditor(false);
    notify("Skills updated successfully");
  };

  const handleSaveProject = async (project) => {
    try {
      await saveProject(project);

      setProjectModal(false);
      setEditingProject(null);

      notify("Project saved successfully");
    } catch (error) {
      notify(error.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await deleteProject(projectId);
      notify("Project deleted successfully");
    } catch (error) {
      notify(error.message);
    }
  };

  const handleSavePortfolio = async (link) => {
    try {
      await savePortfolioLink(link);

      setPortfolioModal(false);
      setEditingPortfolio(null);

      notify("Portfolio link saved successfully");
    } catch (error) {
      notify(error.message);
    }
  };

  const handleDeletePortfolio = async (linkId) => {
    if (!window.confirm("Delete this portfolio link?")) return;

    try {
      await deletePortfolioLink(linkId);
      notify("Portfolio link deleted successfully");
    } catch (error) {
      notify(error.message);
    }
  };

  const handleResumeSelect = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      notify("Please upload a PDF resume");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notify("Resume must be smaller than 5 MB");
      event.target.value = "";
      return;
    }

    try {
      setResumeUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "resume");

      const uploadResponse = await api.post("/profile/upload", formData);

      await api.patch("/profile/resume", {
        file: uploadResponse.data.file,
      });

      await loadProfile();

      notify("Resume uploaded successfully");
    } catch (err) {
      notify(
        err.response?.data?.message || err.message || "Resume upload failed",
      );
    } finally {
      setResumeUploading(false);
      event.target.value = "";
    }
  };
  const resumePreviewUrl = "/api/profile/resume/view";
  const handleViewResume = () => {
    if (!resume?.publicId) {
      notify("Please upload a resume first");
      return;
    }

    setShowResumePreview(true);
  };

  const handleUpdateResume = () => {
    resumeInputRef.current?.click();
  };

  const handleDownloadResume = () => {
    const link = document.createElement("a");

    link.href = "/api/profile/resume/view";
    link.download = resume?.originalName || "resume.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans text-[#172033]">
      {/* Toast */}
      {showToast && (
        <div className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-[9px] bg-[#172033] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg sm:text-[14px]">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {showToast}
        </div>
      )}

      {/* Mobile Breadcrumb */}
      <div className="border-b border-[#DCE4EE] bg-white md:hidden">
        <div className="flex h-[52px] items-center gap-2 px-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center justify-center text-[#52627B]"
            aria-label="Back"
          >
            <ArrowLeft size={19} strokeWidth={1.7} />
          </button>

          <span className="text-[14px] font-semibold text-[#52627B]">
            Profile
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-3 py-3 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        {/* Profile Hero */}
        <section className="relative overflow-hidden rounded-[12px] bg-gradient-to-r from-[#3B348F] to-[#5146E5] px-4 py-5 text-white shadow-[0_4px_12px_rgba(79,70,229,0.12)] sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="flex shrink-0 items-center gap-3 sm:block">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white text-[23px] font-bold text-[#5146E5] shadow-sm sm:h-[74px] sm:w-[74px] sm:text-[25px] lg:h-[82px] lg:w-[82px] lg:text-[28px]">
                {profile.fullName
                  ?.trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "R"}
              </div>

              <div className="sm:hidden">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9FBE8] px-2.5 py-1 text-[10px] font-bold text-[#0B9A4A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                  Profile Active
                </span>
              </div>
            </div>

            {/* Profile Details */}
            <div className="min-w-0 flex-1">
              <div className="hidden sm:block">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9FBE8] px-2.5 py-1 text-[10px] font-bold text-[#0B9A4A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                  Profile Active
                </span>
              </div>

              <h1 className="mt-2 text-[21px] font-bold leading-6 sm:text-[23px] lg:text-[25px]">
                {profile.fullName}
              </h1>

              <p className="mt-1 text-[13px] font-medium text-indigo-100 sm:text-[14px]">
                {profile.role}
              </p>

              <div className="mt-2 flex flex-col gap-1.5 text-[11px] text-indigo-100 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-[12px]">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} strokeWidth={1.7} />
                    {profile.location}
                  </span>
                )}

                {profile.location && (
                  <span className="hidden h-3 w-px bg-white/25 sm:block" />
                )}

                <span className="flex items-center gap-1.5">
                  <Mail size={12} strokeWidth={1.7} />
                  {profile.email}
                </span>
              </div>
            </div>

            {/* Edit */}
            <button
              type="button"
              onClick={openProfileEditor}
              className="flex h-[40px] w-full shrink-0 items-center justify-center gap-2 rounded-[7px] bg-white px-5 text-[12px] font-bold text-[#5146E5] transition hover:bg-indigo-50 sm:w-auto sm:self-center"
            >
              <Pencil size={14} strokeWidth={1.8} />
              Edit Profile
            </button>
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-3 grid grid-cols-1 gap-3 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT COLUMN */}
          <div className="space-y-3 lg:space-y-4">
            {/* Personal Information */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <UserRound size={16} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                    Personal Information
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => openSectionEditor("personal")}
                  className="flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#DCE4EE] bg-white px-2.5 text-[11px] font-medium text-[#64748B] transition hover:border-[#C7D2FE] hover:text-[#5146E5]"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2">
                {[
                  ["Full Name", profile.fullName],
                  ["Email Address", profile.email],
                  ["Phone Number", profile.phone],
                  ["Location", profile.location],
                  ["Date of Birth", profile.dob],
                  ["Status", "Active Student"],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={`flex min-h-[52px] flex-col justify-center border-b border-[#DCE4EE] py-2.5 sm:px-2 ${
                      index >= 4 ? "border-b-0" : ""
                    } ${
                      index % 2 === 0 ? "sm:border-r sm:border-[#DCE4EE]" : ""
                    }`}
                  >
                    <span className="text-[11px] font-medium text-[#8FA0B8]">
                      {label}
                    </span>

                    {label === "Status" ? (
                      <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-[#D9FBE8] px-2.5 py-1 text-[10px] font-bold text-[#0B9A4A]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                        {value}
                      </span>
                    ) : (
                      <span className="mt-0.5 text-[12px] font-semibold text-[#172033]">
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Career Information */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <Target size={16} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                    Career Information
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => openSectionEditor("career")}
                  className="flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#DCE4EE] bg-white px-2.5 text-[11px] font-medium text-[#64748B] transition hover:border-[#C7D2FE] hover:text-[#5146E5]"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>

              <div>
                {[
                  ["Current Role", profile.currentRole],
                  ["Career Goal", profile.careerGoal],
                  ["Preferred Location", profile.preferredLocation],
                  ["Experience Level", profile.experienceLevel],
                  ["Expected Role", profile.expectedRole],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex min-h-[40px] items-center justify-between gap-4 border-b border-[#DCE4EE] py-2 last:border-b-0"
                  >
                    <span className="shrink-0 text-[11px] font-medium text-[#8FA0B8]">
                      {label}
                    </span>

                    {label === "Experience Level" ? (
                      <span className="rounded-[5px] bg-[#EEF1FF] px-2.5 py-1 text-right text-[11px] font-semibold text-[#5146E5]">
                        {value}
                      </span>
                    ) : (
                      <span className="text-right text-[11px] font-semibold text-[#172033] sm:text-[12px]">
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <Code2 size={16} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                      Skills
                    </h2>

                    <p className="text-[10px] text-[#8FA0B8]">
                      {skills.length} skills added
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSkillsEditor(true)}
                  className="flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#DCE4EE] bg-white px-2.5 text-[11px] font-medium text-[#64748B] transition hover:border-[#C7D2FE] hover:text-[#5146E5]"
                >
                  <Plus size={12} />
                  Edit Skills
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-[5px] bg-[#EEF1FF] px-2.5 py-1.5 text-[10px] font-semibold text-[#5146E5]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <GraduationCap size={16} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                    Education
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => openEducationEditor()}
                  className="flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#DCE4EE] bg-white px-2.5 text-[11px] font-medium text-[#64748B] transition hover:border-[#C7D2FE] hover:text-[#5146E5]"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>

              {education.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-[#DCE4EE] p-5 text-center">
                  <GraduationCap
                    className="mx-auto mb-2 text-[#8FA0B8]"
                    size={24}
                  />
                  <p className="text-[12px] font-semibold text-[#52627B]">
                    No education added yet
                  </p>
                  <p className="mt-1 text-[10px] text-[#8FA0B8]">
                    Add your degree, university or academic qualifications.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {education.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="rounded-[8px] border border-[#DCE4EE] bg-[#F8FAFC] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                          <GraduationCap size={18} strokeWidth={1.7} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-[12px] font-bold leading-5 text-[#172033] sm:text-[13px]">
                                {item.degree}
                              </h3>

                              <p className="mt-0.5 text-[11px] font-medium text-[#52627B] sm:text-[12px]">
                                {item.university}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEducationEditor(item)}
                                className="text-[#5146E5]"
                                aria-label="Edit education"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteEducation(item._id)}
                                className="text-red-500"
                                aria-label="Delete education"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>

                          {item.period && (
                            <p className="mt-2 flex items-center gap-1 text-[10px] text-[#8FA0B8] sm:text-[11px]">
                              <CalendarDays size={11} />
                              {item.period}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-sm sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-bold text-[#172033]">
                    Project Experience
                  </h2>
                  <p className="text-[10px] text-[#8FA0B8]">
                    {projects.length} projects added
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectModal(true);
                  }}
                  className="flex h-[32px] items-center gap-1.5 rounded-[6px] bg-[#5146E5] px-3 text-[11px] font-semibold text-white"
                >
                  <Plus size={13} />
                  Add Project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-[#DCE4EE] p-5 text-center">
                  <Code2 className="mx-auto mb-2 text-[#8FA0B8]" size={24} />
                  <p className="text-[12px] font-semibold text-[#52627B]">
                    No projects added yet
                  </p>
                  <p className="mt-1 text-[10px] text-[#8FA0B8]">
                    Add your academic, personal or professional projects.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="rounded-[8px] border border-[#DCE4EE] bg-[#F8FAFC] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-[13px] font-bold text-[#172033]">
                            {project.title}
                          </h3>

                          <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-[#71839E]">
                            {project.description}
                          </p>
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject(project);
                              setProjectModal(true);
                            }}
                            className="text-[#5146E5]"
                            aria-label="Edit project"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProject(project._id)}
                            className="text-red-500"
                            aria-label="Delete project"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>

                      {project.technologies?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {project.technologies.map((technology) => (
                            <span
                              key={technology}
                              className="rounded-[5px] bg-[#EEF1FF] px-2 py-1 text-[9px] font-semibold text-[#5146E5]"
                            >
                              {technology}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold">
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#5146E5]"
                          >
                            Live Project ↗
                          </a>
                        )}

                        {project.repositoryUrl && (
                          <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#5146E5]"
                          >
                            Source Code ↗
                          </a>
                        )}
                      </div>

                      {project.media?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {project.media.map((media) => (
                            <img
                              key={media.publicId}
                              src={media.secureUrl}
                              alt={`${project.title} screenshot`}
                              className="h-16 w-20 rounded-md border border-[#DCE4EE] object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-sm sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-[#172033]">
                    Portfolio Links
                  </h2>
                  <p className="text-[10px] text-[#8FA0B8]">
                    {portfolioLinks.length} links added
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingPortfolio(null);
                    setPortfolioModal(true);
                  }}
                  className="flex h-[32px] items-center gap-1.5 rounded-[6px] bg-[#5146E5] px-3 text-[11px] font-semibold text-white"
                >
                  <Plus size={13} />
                  Add Link
                </button>
              </div>

              {portfolioLinks.length === 0 ? (
                <p className="rounded-[8px] border border-dashed border-[#DCE4EE] p-4 text-center text-[11px] text-[#8FA0B8]">
                  Add your GitHub, LinkedIn or portfolio website.
                </p>
              ) : (
                <div className="space-y-2">
                  {portfolioLinks.map((link) => (
                    <div
                      key={link._id}
                      className="flex items-center justify-between gap-3 rounded-[8px] border border-[#DCE4EE] bg-[#F8FAFC] p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-[#172033]">
                          {link.title}
                        </p>
                        <p className="truncate text-[10px] text-[#8FA0B8]">
                          {link.url}
                        </p>
                        <span className="text-[9px] font-semibold text-[#5146E5]">
                          {link.type}
                        </span>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5146E5]"
                          aria-label="Open portfolio link"
                        >
                          <Eye size={15} />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingPortfolio(link);
                            setPortfolioModal(true);
                          }}
                          className="text-[#5146E5]"
                          aria-label="Edit portfolio link"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePortfolio(link._id)}
                          className="text-red-500"
                          aria-label="Delete portfolio link"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="space-y-3 lg:space-y-4">
            {/* Profile Completion */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <Target size={16} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                    Profile Completion
                  </h2>
                </div>

                <span className="text-[21px] font-bold text-[#5146E5] sm:text-[23px]">
                  {profileCompletion}%
                </span>
              </div>

              <div className="mt-3 h-[7px] overflow-hidden rounded-full bg-[#E9EEFA]">
                <div
                  className="h-full rounded-full bg-[#5146E5] transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>

              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-[#8FA0B8]">
                  {17 - Math.round((profileCompletion / 100) * 17)} sections
                  remaining
                </span>

                <span className="text-[10px] font-semibold text-[#5146E5]">
                  {profileCompletion === 100
                    ? "Complete"
                    : profileCompletion >= 75
                      ? "Almost Complete"
                      : profileCompletion >= 40
                        ? "In Progress"
                        : "Getting Started"}
                </span>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#71839E]">
                Complete your profile to improve job matching and AI
                recommendations.
              </p>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setProjectModal(true);
                  }}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] border border-[#F5B82E] bg-[#FFF2C7] px-3 text-left text-[10px] font-medium text-[#A85A00]"
                >
                  <Plus size={12} />
                  Add project experience
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingPortfolio(null);
                    setPortfolioModal(true);
                  }}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] border border-[#F5B82E] bg-[#FFF2C7] px-3 text-left text-[10px] font-medium text-[#A85A00]"
                >
                  <Plus size={12} />
                  Add portfolio links
                </button>
              </div>
            </section>

            {/* Experience */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <BriefcaseBusiness size={16} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                    Experience
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => openExperienceEditor()}
                  className="flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#DCE4EE] bg-white px-2.5 text-[11px] font-medium text-[#64748B] transition hover:border-[#C7D2FE] hover:text-[#5146E5]"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>

              {experiences.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-[#DCE4EE] p-5 text-center">
                  <BriefcaseBusiness
                    className="mx-auto mb-2 text-[#8FA0B8]"
                    size={24}
                  />
                  <p className="text-[12px] font-semibold text-[#52627B]">
                    No experience added yet
                  </p>
                  <p className="mt-1 text-[10px] text-[#8FA0B8]">
                    Add your internships, work experience or professional roles.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {experiences.map((experience, index) => (
                    <div
                      className="rounded-[8px] border border-[#DCE4EE] bg-[#F8FAFC] p-3"
                      key={experience._id || index}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                          <Code2 size={18} strokeWidth={1.7} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-[12px] font-bold leading-5 text-[#172033] sm:text-[13px]">
                                {experience.title}
                              </h3>

                              <p className="mt-0.5 text-[11px] font-medium text-[#52627B] sm:text-[12px]">
                                {experience.company}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openExperienceEditor(experience)}
                                className="text-[#5146E5]"
                                aria-label="Edit experience"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteExperience(experience._id)
                                }
                                className="text-red-500"
                                aria-label="Delete experience"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>

                          {experience.duration && (
                            <span className="mt-2 inline-block rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[9px] font-semibold text-[#5146E5]">
                              {experience.duration}
                            </span>
                          )}

                          {experience.description && (
                            <p className="mt-2 text-[10px] leading-5 text-[#71839E] sm:text-[11px]">
                              {experience.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Resume */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <FileText size={16} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                    Resume
                  </h2>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9FBE8] px-2.5 py-1 text-[9px] font-bold text-[#0B9A4A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                  Uploaded
                </span>
              </div>

              <div className="rounded-[8px] border border-[#DCE4EE] bg-[#F8FAFC] p-2.5">
                <div className="flex items-center gap-2.5">
                  {resume && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] bg-[#FFE4E4] text-[#EF4444]">
                      <FileText size={18} strokeWidth={1.7} />
                    </div>
                  )}

                  <div className="min-w-0">
                    {resume ? (
                      <>
                        <p className="truncate text-[10px] font-bold text-[#172033]">
                          {resume.originalName}
                        </p>

                        <span className="text-[9px] text-[#8FA0B8]">
                          Uploaded{" "}
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </span>
                      </>
                    ) : (
                      <p className="text-[11px] text-[#8FA0B8]">
                        No resume uploaded yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleViewResume}
                  className="flex h-[34px] items-center justify-center gap-1.5 rounded-[7px] border border-[#DCE4EE] bg-white text-[10px] font-bold text-[#5146E5] transition hover:bg-indigo-50"
                >
                  <Eye size={13} />
                  View Resume
                </button>

                <button
                  type="button"
                  onClick={handleUpdateResume}
                  disabled={resumeUploading}
                  className="flex h-[34px] items-center justify-center gap-1.5 rounded-[7px] bg-[#5146E5] text-[10px] font-bold text-white disabled:opacity-50"
                >
                  <Upload size={13} />
                  {resumeUploading ? "Uploading..." : "Update Resume"}
                </button>
              </div>

              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleResumeSelect}
                className="hidden"
              />
            </section>

            {/* AI Profile Insight */}
            <section className="rounded-[11px] border border-[#E7DEFC] bg-[#F6F2FF] p-3.5 sm:p-4 lg:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px] bg-[#EDE9FE] text-[#7C3AED]">
                    <Sparkles size={16} strokeWidth={1.7} />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                      AI Profile Insight
                    </h2>

                    <p className="text-[10px] font-medium text-[#7C3AED]">
                      Powered by ResumeAI
                    </p>
                  </div>
                </div>

                <Sparkles
                  size={15}
                  className="text-[#7C3AED]"
                  strokeWidth={1.7}
                />
              </div>

              <div className="my-3 h-px bg-[#E7DEFC]" />

              <p className="text-[11px] leading-5 text-[#52627B] sm:text-[12px]">
                Your profile has strong alignment with Full Stack Developer
                roles. Adding more project experience and backend-focused skills
                can improve your job matching and overall AI score.
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-[6px] bg-[#D9FBE8] px-2.5 py-1.5 text-[9px] font-semibold text-[#07883E]">
                  <Check size={11} className="mr-1 inline" />
                  Strong job alignment
                </span>

                <span className="rounded-[6px] bg-[#FFF0C2] px-2.5 py-1.5 text-[9px] font-semibold text-[#A85A00]">
                  <Target size={11} className="mr-1 inline" />
                  Add project experience
                </span>
              </div>
            </section>

            {/* Profile Visibility */}
            <section className="rounded-[11px] border border-[#DCE4EE] bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:p-4 lg:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#E7FAEF] text-[#16A34A]">
                    <Eye size={16} strokeWidth={1.7} />
                  </div>

                  <h2 className="text-[15px] font-bold text-[#172033] sm:text-[16px]">
                    Profile Visibility
                  </h2>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9FBE8] px-2.5 py-1 text-[9px] font-bold text-[#0B9A4A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                  Active
                </span>
              </div>

              <div className="my-3 h-px bg-[#DCE4EE]" />

              <p className="text-[11px] leading-5 text-[#71839E] sm:text-[12px]">
                Your profile can be used for job matching and application
                analysis by the ResumeAI system.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {/* Profile Editor */}
      {(showProfileEditor ||
        showSectionEditor === "personal" ||
        showSectionEditor === "career") && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172033]/40 px-3 py-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-[580px] overflow-y-auto rounded-[13px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#172033] sm:text-[19px]">
                  {showProfileEditor
                    ? "Edit Profile"
                    : showSectionEditor === "personal"
                      ? "Edit Personal Information"
                      : "Edit Career Information"}
                </h2>

                <p className="mt-1 text-[12px] text-[#8FA0B8]">
                  Update your profile information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProfileEditor(false);
                  setShowSectionEditor(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {showSectionEditor === "career" && !showProfileEditor ? (
                <>
                  {[
                    ["currentRole", "Current Role"],
                    ["careerGoal", "Career Goal"],
                    ["preferredLocation", "Preferred Location"],
                    ["experienceLevel", "Experience Level"],
                    ["expectedRole", "Expected Role"],
                  ].map(([key, label]) => (
                    <label key={key} className="block sm:col-span-2">
                      <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                        {label}
                      </span>

                      <input
                        value={draftProfile[key]}
                        onChange={(event) =>
                          setDraftProfile((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-[7px] border border-[#DCE4EE] bg-white px-3 text-[13px] text-[#172033] outline-none transition focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10"
                      />
                    </label>
                  ))}
                </>
              ) : (
                <>
                  {[
                    ["fullName", "Full Name"],
                    ["email", "Email Address"],
                    ["phone", "Phone Number"],
                    ["location", "Location"],
                    ["dob", "Date of Birth"],
                  ].map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                        {label}
                      </span>

                      <input
                        value={draftProfile[key]}
                        onChange={(event) =>
                          setDraftProfile((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-[7px] border border-[#DCE4EE] bg-white px-3 text-[13px] text-[#172033] outline-none transition focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10"
                      />
                    </label>
                  ))}

                  {showProfileEditor && (
                    <label className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                        Professional Role
                      </span>

                      <input
                        value={draftProfile.role}
                        onChange={(event) =>
                          setDraftProfile((current) => ({
                            ...current,
                            role: event.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-[7px] border border-[#DCE4EE] bg-white px-3 text-[13px] text-[#172033] outline-none transition focus:border-[#5146E5] focus:ring-2 focus:ring-[#5146E5]/10"
                      />
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowProfileEditor(false);
                  setShowSectionEditor(null);
                }}
                className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={showProfileEditor ? saveProfile : saveSection}
                className="flex h-10 items-center gap-1.5 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white"
              >
                <Save size={13} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Editor */}
      {showSkillsEditor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172033]/40 px-3 py-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[560px] rounded-[13px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#172033]">
                  Edit Skills
                </h2>

                <p className="mt-1 text-[12px] text-[#8FA0B8]">
                  Add or remove skills from your profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSkillsEditor(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(event) => setNewSkill(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Enter a skill..."
                className="h-11 min-w-0 flex-1 rounded-[7px] border border-[#DCE4EE] px-3 text-[13px] outline-none focus:border-[#5146E5]"
              />

              <button
                type="button"
                onClick={addSkill}
                className="flex h-11 items-center gap-1.5 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            <div className="mt-5 flex max-h-[220px] flex-wrap gap-2 overflow-y-auto">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#EEF1FF] px-3 py-2 text-[11px] font-semibold text-[#5146E5]"
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[#8B86E8] hover:text-[#EF4444]"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSkillsEditor(false)}
                className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveSkills}
                className="flex h-10 items-center gap-1.5 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white"
              >
                <Save size={13} />
                Save Skills
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {experienceModal && (
        <ProfileProjectForms
          key={`experience-${editingExperience?._id || "new"}`}
          mode="experience"
          initialData={editingExperience}
          onSave={handleSaveExperience}
          onCancel={() => {
            setExperienceModal(false);
            setEditingExperience(null);
          }}
        />
      )}

      {/* Education Modal */}
      {educationModal && (
        <ProfileProjectForms
          key={`education-${editingEducation?._id || "new"}`}
          mode="education"
          initialData={editingEducation}
          onSave={handleSaveEducation}
          onCancel={() => {
            setEducationModal(false);
            setEditingEducation(null);
          }}
        />
      )}

      {/* Resume Preview Modal */}
      {showResumePreview && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172033]/60 px-3 py-4 backdrop-blur-[3px]"
          onClick={() => setShowResumePreview(false)}
        >
          <div
            className="flex h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[13px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#DCE4EE] px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] bg-[#FFE4E4] text-[#EF4444]">
                  <FileText size={18} />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-[14px] font-bold text-[#172033]">
                    {resume?.originalName || "Resume"}
                  </h2>

                  <p className="mt-0.5 text-[10px] text-[#8FA0B8]">
                    Resume preview
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResumePreview(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B] transition hover:bg-[#EEF1FF] hover:text-[#5146E5]"
              >
                <X size={17} />
              </button>
            </div>

            {/* Actual PDF Preview */}
            <div className="min-h-0 flex-1 bg-[#F1F5F9]">
              <iframe
                key={resume?.publicId}
                src="/api/profile/resume/view"
                title="Resume PDF Preview"
                className="h-full w-full border-0"
                loading="eager"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#DCE4EE] bg-white px-4 py-3 sm:px-5">
              <p className="hidden text-[10px] text-[#8FA0B8] sm:block">
                Uploaded{" "}
                {resume?.uploadedAt
                  ? new Date(resume.uploadedAt).toLocaleDateString()
                  : ""}
              </p>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowResumePreview(false)}
                  className="h-9 rounded-[7px] border border-[#DCE4EE] px-4 text-[11px] font-semibold text-[#64748B] transition hover:bg-[#F8FAFC]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = resumePreviewUrl;
                    link.download = resume?.originalName || "resume.pdf";
                    link.click();
                  }}
                  className="flex h-9 items-center gap-1.5 rounded-[7px] bg-[#5146E5] px-4 text-[11px] font-semibold text-white transition hover:bg-[#4338CA]"
                >
                  <Download size={13} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {projectModal && (
        <ProfileProjectForms
          key={`project-${editingProject?._id || "new"}`}
          mode="project"
          initialData={editingProject}
          onSave={handleSaveProject}
          onCancel={() => {
            setProjectModal(false);
            setEditingProject(null);
          }}
        />
      )}

      {portfolioModal && (
        <ProfileProjectForms
          key={`portfolio-${editingPortfolio?._id || "new"}`}
          mode="portfolio"
          initialData={editingPortfolio}
          onSave={handleSavePortfolio}
          onCancel={() => {
            setPortfolioModal(false);
            setEditingPortfolio(null);
          }}
        />
      )}
    </main>
  );
}
