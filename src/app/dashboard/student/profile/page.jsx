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
import { useRef, useState } from "react";

export default function StudentProfilePage() {
  const resumeInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "Rahul Sharma",
    role: "Full Stack Developer",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    dob: "15 June 2002",
    currentRole: "Student / Aspiring Full Stack Developer",
    careerGoal: "Full Stack Developer",
    preferredLocation: "Mumbai / Remote",
    experienceLevel: "Fresher",
    expectedRole: "Full Stack Developer",
  });

  const [skills, setSkills] = useState([
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Git",
  ]);

  const [profileCompletion, setProfileCompletion] = useState(85);

  const [experience, setExperience] = useState({
    title: "Full Stack Developer Intern",
    company: "Technology Company",
    duration: "3 Months",
    description:
      "Worked on frontend and backend web application development using React and Node.js.",
  });

  const [education, setEducation] = useState({
    degree: "Master of Computer Applications",
    university: "Chhatrapati Shivaji Maharaj University",
    period: "2025 – Present",
  });

  const [resume, setResume] = useState({
    name: "ResumeAI_Resume_Rahul.pdf",
    type: "PDF",
    uploaded: "Uploaded 12 Aug 2026",
  });

  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showSectionEditor, setShowSectionEditor] = useState(null);
  const [showSkillsEditor, setShowSkillsEditor] = useState(false);
  const [showExperienceEditor, setShowExperienceEditor] = useState(false);
  const [showEducationEditor, setShowEducationEditor] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [showToast, setShowToast] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const [draftProfile, setDraftProfile] = useState(profile);
  const [draftExperience, setDraftExperience] = useState(experience);
  const [draftEducation, setDraftEducation] = useState(education);

  const notify = (message) => {
    setShowToast(message);

    window.clearTimeout(window.__resumeAiToastTimer);

    window.__resumeAiToastTimer = window.setTimeout(() => {
      setShowToast("");
    }, 2200);
  };

  const openProfileEditor = () => {
    setDraftProfile(profile);
    setShowProfileEditor(true);
  };

  const saveProfile = () => {
    setProfile(draftProfile);
    setShowProfileEditor(false);
    notify("Profile updated successfully");
  };

  const openSectionEditor = (section) => {
    setShowSectionEditor(section);

    if (section === "personal") {
      setDraftProfile(profile);
    }

    if (section === "career") {
      setDraftProfile(profile);
    }
  };

  const saveSection = () => {
    setProfile(draftProfile);
    setShowSectionEditor(null);
    setShowProfileEditor(false);
    notify("Information updated successfully");
  };

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();

    if (!trimmedSkill) return;

    if (skills.includes(trimmedSkill)) {
      notify("Skill already added");
      return;
    }

    if (skills.length >= 15) {
      notify("You can add up to 15 skills");
      return;
    }

    setSkills((current) => [...current, trimmedSkill]);
    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    setSkills((current) => current.filter((skill) => skill !== skillToRemove));
  };

  const saveSkills = () => {
    setShowSkillsEditor(false);
    notify("Skills updated successfully");
  };

  const openExperienceEditor = () => {
    setDraftExperience(experience);
    setShowExperienceEditor(true);
  };

  const saveExperience = () => {
    setExperience(draftExperience);
    setShowExperienceEditor(false);
    notify("Experience updated successfully");
  };

  const openEducationEditor = () => {
    setDraftEducation(education);
    setShowEducationEditor(true);
  };

  const saveEducation = () => {
    setEducation(draftEducation);
    setShowEducationEditor(false);
    notify("Education updated successfully");
  };

  const handleResumeSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";

    setResume({
      name: file.name,
      type: extension,
      uploaded: `Uploaded ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`,
    });

    notify("Resume uploaded successfully");
  };

  const handleViewResume = () => {
    setShowResumePreview(true);
  };

  const handleUpdateResume = () => {
    resumeInputRef.current?.click();
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
                RS
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
                {profile.name}
              </h1>

              <p className="mt-1 text-[13px] font-medium text-indigo-100 sm:text-[14px]">
                {profile.role}
              </p>

              <div className="mt-2 flex flex-col gap-1.5 text-[11px] text-indigo-100 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-[12px]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} strokeWidth={1.7} />
                  {profile.location}
                </span>

                <span className="hidden h-3 w-px bg-white/25 sm:block" />

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
                  ["Full Name", profile.name],
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
                  onClick={openEducationEditor}
                  className="flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#DCE4EE] bg-white px-2.5 text-[11px] font-medium text-[#64748B] transition hover:border-[#C7D2FE] hover:text-[#5146E5]"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>

              <div className="rounded-[8px] border border-[#DCE4EE] bg-[#F8FAFC] p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <GraduationCap size={18} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-[12px] font-bold leading-5 text-[#172033] sm:text-[13px]">
                        {education.degree}
                      </h3>

                      <span className="w-fit rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[9px] font-semibold text-[#5146E5]">
                        Currently Studying
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] font-medium text-[#52627B] sm:text-[12px]">
                      {education.university}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-[10px] text-[#8FA0B8] sm:text-[11px]">
                      <CalendarDays size={11} />
                      {education.period}
                    </p>
                  </div>
                </div>
              </div>
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
                  2 sections remaining
                </span>

                <span className="text-[10px] font-semibold text-[#5146E5]">
                  Almost Complete
                </span>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#71839E]">
                Complete your profile to improve job matching and AI
                recommendations.
              </p>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => notify("Project experience section opened")}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] border border-[#F5B82E] bg-[#FFF2C7] px-3 text-left text-[10px] font-medium text-[#A85A00] transition hover:bg-[#FFEFB4]"
                >
                  <Plus size={12} />
                  Add project experience
                </button>

                <button
                  type="button"
                  onClick={() => notify("Portfolio section opened")}
                  className="flex h-[34px] w-full items-center gap-2 rounded-[7px] border border-[#F5B82E] bg-[#FFF2C7] px-3 text-left text-[10px] font-medium text-[#A85A00] transition hover:bg-[#FFEFB4]"
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
                  onClick={openExperienceEditor}
                  className="flex h-[30px] items-center gap-1.5 rounded-[6px] border border-[#DCE4EE] bg-white px-2.5 text-[11px] font-medium text-[#64748B] transition hover:border-[#C7D2FE] hover:text-[#5146E5]"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>

              <div className="rounded-[8px] border border-[#DCE4EE] bg-[#F8FAFC] p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] bg-[#EEF1FF] text-[#5146E5]">
                    <Code2 size={18} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[12px] font-bold leading-5 text-[#172033] sm:text-[13px]">
                        {experience.title}
                      </h3>

                      <span className="shrink-0 rounded-full bg-[#EEF1FF] px-2.5 py-1 text-[9px] font-semibold text-[#5146E5]">
                        {experience.duration}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] font-medium text-[#52627B] sm:text-[12px]">
                      {experience.company}
                    </p>

                    <p className="mt-1.5 text-[10px] leading-5 text-[#71839E] sm:text-[11px]">
                      {experience.description}
                    </p>
                  </div>
                </div>
              </div>
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[7px] bg-[#FFE4E4] text-[#EF4444]">
                    <FileText size={18} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-bold text-[#172033] sm:text-[11px]">
                      {resume.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-[4px] bg-[#FFE4E4] px-1.5 py-0.5 text-[8px] font-bold text-[#EF4444]">
                        {resume.type}
                      </span>

                      <span className="text-[8px] text-[#8FA0B8] sm:text-[9px]">
                        {resume.uploaded}
                      </span>
                    </div>
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
                  className="flex h-[34px] items-center justify-center gap-1.5 rounded-[7px] bg-[#5146E5] text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(79,70,229,0.18)] transition hover:bg-[#453BCF]"
                >
                  <Upload size={13} />
                  Update Resume
                </button>
              </div>

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
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
                    ["name", "Full Name"],
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

      {/* Experience Editor */}
      {showExperienceEditor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172033]/40 px-3 py-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[560px] rounded-[13px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#172033]">
                  Experience
                </h2>

                <p className="mt-1 text-[12px] text-[#8FA0B8]">
                  Add or update your work experience.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowExperienceEditor(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                  Job Title
                </span>

                <input
                  value={draftExperience.title}
                  onChange={(event) =>
                    setDraftExperience((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-[7px] border border-[#DCE4EE] px-3 text-[13px] outline-none focus:border-[#5146E5]"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                    Company
                  </span>

                  <input
                    value={draftExperience.company}
                    onChange={(event) =>
                      setDraftExperience((current) => ({
                        ...current,
                        company: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-[7px] border border-[#DCE4EE] px-3 text-[13px] outline-none focus:border-[#5146E5]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                    Duration
                  </span>

                  <input
                    value={draftExperience.duration}
                    onChange={(event) =>
                      setDraftExperience((current) => ({
                        ...current,
                        duration: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-[7px] border border-[#DCE4EE] px-3 text-[13px] outline-none focus:border-[#5146E5]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                  Description
                </span>

                <textarea
                  rows={4}
                  value={draftExperience.description}
                  onChange={(event) =>
                    setDraftExperience((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-[7px] border border-[#DCE4EE] px-3 py-2.5 text-[13px] leading-5 outline-none focus:border-[#5146E5]"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExperienceEditor(false)}
                className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveExperience}
                className="flex h-10 items-center gap-1.5 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white"
              >
                <Save size={13} />
                Save Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Education Editor */}
      {showEducationEditor && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172033]/40 px-3 py-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[560px] rounded-[13px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#172033]">
                  Education
                </h2>

                <p className="mt-1 text-[12px] text-[#8FA0B8]">
                  Update your education details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEducationEditor(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                  Degree
                </span>

                <input
                  value={draftEducation.degree}
                  onChange={(event) =>
                    setDraftEducation((current) => ({
                      ...current,
                      degree: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-[7px] border border-[#DCE4EE] px-3 text-[13px] outline-none focus:border-[#5146E5]"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                  University
                </span>

                <input
                  value={draftEducation.university}
                  onChange={(event) =>
                    setDraftEducation((current) => ({
                      ...current,
                      university: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-[7px] border border-[#DCE4EE] px-3 text-[13px] outline-none focus:border-[#5146E5]"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[12px] font-semibold text-[#52627B]">
                  Period
                </span>

                <input
                  value={draftEducation.period}
                  onChange={(event) =>
                    setDraftEducation((current) => ({
                      ...current,
                      period: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-[7px] border border-[#DCE4EE] px-3 text-[13px] outline-none focus:border-[#5146E5]"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEducationEditor(false)}
                className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEducation}
                className="flex h-10 items-center gap-1.5 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white"
              >
                <Save size={13} />
                Save Education
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Preview */}
      {showResumePreview && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172033]/40 px-3 py-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[680px] rounded-[13px] bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between border-b border-[#DCE4EE] pb-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#172033]">
                  {resume.name}
                </h2>

                <p className="mt-1 text-[11px] text-[#8FA0B8]">
                  Resume preview
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowResumePreview(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC] text-[#64748B]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-4 rounded-[9px] border border-[#DCE4EE] bg-[#F8FAFC] p-5 sm:p-8">
              <div className="mx-auto max-w-[520px] rounded-[6px] bg-white p-5 shadow-sm sm:p-8">
                <div className="border-b border-[#DCE4EE] pb-4">
                  <h1 className="text-[23px] font-bold text-[#172033]">
                    {profile.name}
                  </h1>

                  <p className="mt-1 text-[13px] text-[#5146E5]">
                    {profile.role}
                  </p>

                  <p className="mt-2 text-[11px] text-[#71839E]">
                    {profile.email} · {profile.phone} · {profile.location}
                  </p>
                </div>

                <div className="mt-5">
                  <h3 className="text-[13px] font-bold text-[#172033]">
                    Professional Summary
                  </h3>

                  <p className="mt-2 text-[11px] leading-5 text-[#71839E]">
                    Aspiring full stack developer with strong foundations in
                    React, JavaScript, Node.js and MongoDB.
                  </p>
                </div>

                <div className="mt-5">
                  <h3 className="text-[13px] font-bold text-[#172033]">
                    Skills
                  </h3>

                  <p className="mt-2 text-[11px] leading-5 text-[#71839E]">
                    {skills.join(" · ")}
                  </p>
                </div>

                <div className="mt-5">
                  <h3 className="text-[13px] font-bold text-[#172033]">
                    Experience
                  </h3>

                  <p className="mt-2 text-[11px] font-semibold text-[#172033]">
                    {experience.title}
                  </p>

                  <p className="mt-1 text-[10px] text-[#71839E]">
                    {experience.company} · {experience.duration}
                  </p>
                </div>

                <div className="mt-5">
                  <h3 className="text-[13px] font-bold text-[#172033]">
                    Education
                  </h3>

                  <p className="mt-2 text-[11px] font-semibold text-[#172033]">
                    {education.degree}
                  </p>

                  <p className="mt-1 text-[10px] text-[#71839E]">
                    {education.university} · {education.period}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResumePreview(false)}
                className="h-10 rounded-[7px] border border-[#DCE4EE] px-5 text-[12px] font-semibold text-[#64748B]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => notify("Resume download started")}
                className="flex h-10 items-center gap-1.5 rounded-[7px] bg-[#5146E5] px-5 text-[12px] font-semibold text-white"
              >
                <Download size={13} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
