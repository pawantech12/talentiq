"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  Building2,
  MapPin,
  Mail,
  Phone,
  BriefcaseBusiness,
  ShieldCheck,
  LockKeyhole,
  Settings,
  Pencil,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RecruiterProfilePage() {
  const router = useRouter();

  const emptyProfile = {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    company: "",
    department: "",
    experience: "",
    createdAt: null,
    emailVerified: false,
    accountStatus: "active",
  };

  const [profile, setProfile] = useState(emptyProfile);
  const [editForm, setEditForm] = useState(emptyProfile);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [editProfile, setEditProfile] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRecruiterProfile() {
      try {
        setIsLoadingProfile(true);
        setProfileError("");

        const { data } = await api.get("/profile");

        if (!data.success) {
          throw new Error(data.message || "Unable to load profile.");
        }

        const loadedProfile = {
          ...emptyProfile,
          ...data.profile,

          // API/database uses companyName.
          // The existing JSX uses company.
          company: data.profile.companyName || "",
        };

        if (mounted) {
          setProfile(loadedProfile);
          setEditForm(loadedProfile);
        }
      } catch (error) {
        if (mounted) {
          const message =
            error.response?.data?.message ||
            error.message ||
            "Unable to load recruiter profile.";

          setProfileError(message);
        }

        if (error.response?.status === 401) {
          router.replace("/login");
        }
      } finally {
        if (mounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadRecruiterProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleOpenEdit = () => {
    setEditForm(profile);
    setSuccessMessage("");
    setEditProfile(true);
  };

  const handleCloseEdit = () => {
    if (isSavingProfile) return;

    setEditForm(profile);
    setEditProfile(false);
  };

  const handleEditChange = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const requiredFields = [
      "fullName",
      "phone",
      "location",
      "jobTitle",
      "company",
      "department",
      "experience",
    ];

    const hasEmptyField = requiredFields.some(
      (field) => typeof editForm[field] !== "string" || !editForm[field].trim(),
    );

    if (hasEmptyField) {
      setProfileError("Please complete all required profile fields.");
      return;
    }

    try {
      setIsSavingProfile(true);
      setProfileError("");

      const payload = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        location: editForm.location.trim(),
        jobTitle: editForm.jobTitle.trim(),
        companyName: editForm.company.trim(),
        department: editForm.department.trim(),
        experience: editForm.experience.trim(),
      };

      const { data } = await api.patch("/profile", payload);

      if (!data.success) {
        throw new Error(data.message || "Unable to update profile.");
      }

      const updatedProfile = {
        ...emptyProfile,
        ...data.profile,
        company: data.profile.companyName || "",
      };

      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      setEditProfile(false);
      setSuccessMessage("Profile updated successfully.");

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setProfileError(
        error.response?.data?.message ||
          error.message ||
          "Unable to update profile.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenPassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setChangePassword(true);
  };

  const handleClosePassword = () => {
    if (isChangingPassword) return;

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPasswordError("");
    setChangePassword(false);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setPasswordError("");
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");

    if (!passwordForm.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (
      passwordForm.newPassword.length < 8 ||
      passwordForm.newPassword.length > 72
    ) {
      setPasswordError("New password must contain 8 to 72 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setIsChangingPassword(true);

      const { data } = await api.post("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to change password.");
      }

      setChangePassword(false);

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setSuccessMessage("Password changed successfully.");

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setPasswordError(
        error.response?.data?.message ||
          error.message ||
          "Unable to change password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout error:",
        error.response?.data?.message || error.message,
      );
    } finally {
      setLogoutModal(false);
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-7 xl:px-8">
        {/* =========================================================
            PAGE HEADING
        ========================================================== */}

        <div className="mb-5">
          <h1 className="text-[21px] font-bold leading-7 tracking-[-0.02em] text-[#111827] sm:text-[26px] sm:leading-8">
            Recruiter Profile
          </h1>

          <p className="mt-0.5 text-[13px] leading-5 text-[#64748b] sm:text-[14px]">
            Manage your personal and professional information.
          </p>
        </div>

        {/* =========================================================
            SUCCESS MESSAGE
        ========================================================== */}

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-3 text-[13px] font-medium text-[#16a34a]">
            <Check className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* =========================================================
            PROFILE SUMMARY
        ========================================================== */}

        <section className="mb-5 rounded-xl border border-[#dbe3ee] bg-white p-4 sm:px-5 sm:py-5 lg:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
              {/* Avatar */}
              <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-[#4f46e5] text-[24px] font-semibold text-white sm:h-[72px] sm:w-[72px] sm:text-[25px]">
                {profile.fullName
                  ?.trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "R"}
              </div>

              <div className="mt-3 sm:ml-5 sm:mt-0">
                <h2 className="text-[21px] font-bold leading-7 text-[#111827] sm:text-[23px]">
                  {profile.fullName}
                </h2>

                <p className="mt-0.5 text-[13px] font-medium text-[#4f46e5] sm:text-[14px]">
                  {profile.jobTitle}
                </p>

                <div className="mt-3 flex flex-col items-center gap-2 text-[12px] text-[#64748b] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {profile.company}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {profile.email}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-[13px] font-semibold text-white transition hover:bg-[#4338ca] sm:w-auto sm:min-w-[136px]"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </section>

        {/* =========================================================
            MAIN CONTENT
        ========================================================== */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,.95fr)] lg:gap-5">
          {/* =======================================================
              LEFT COLUMN
          ======================================================== */}

          <div className="space-y-4">
            {/* =====================================================
                PERSONAL INFORMATION
            ====================================================== */}

            <section className="rounded-xl border border-[#dbe3ee] bg-white px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
              <div className="flex items-center gap-2 border-b border-[#e5eaf1] pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff]">
                  <UserRound className="h-4 w-4 text-[#4f46e5]" />
                </div>

                <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                  Personal Information
                </h2>
              </div>

              <div className="mt-2">
                {/* Full Name */}
                <div className="flex min-h-[58px] items-center justify-between border-b border-[#edf1f5] py-3">
                  <div>
                    <p className="text-[11px] leading-4 text-[#64748b]">
                      Full Name
                    </p>

                    <p className="text-[13px] font-semibold leading-5 text-[#111827] sm:text-[14px]">
                      {profile.fullName}
                    </p>
                  </div>

                  <UserRound className="h-4 w-4 text-[#cbd5e1]" />
                </div>

                {/* Email */}
                <div className="flex min-h-[58px] items-center justify-between border-b border-[#edf1f5] py-3">
                  <div>
                    <p className="text-[11px] leading-4 text-[#64748b]">
                      Email Address
                    </p>

                    <p className="break-all text-[13px] font-semibold leading-5 text-[#111827] sm:text-[14px]">
                      {profile.email}
                    </p>
                  </div>

                  <Mail className="h-4 w-4 shrink-0 text-[#cbd5e1]" />
                </div>

                {/* Phone */}
                <div className="flex min-h-[58px] items-center justify-between border-b border-[#edf1f5] py-3">
                  <div>
                    <p className="text-[11px] leading-4 text-[#64748b]">
                      Phone Number
                    </p>

                    <p className="text-[13px] font-semibold leading-5 text-[#111827] sm:text-[14px]">
                      {profile.phone}
                    </p>
                  </div>

                  <Phone className="h-4 w-4 text-[#cbd5e1]" />
                </div>

                {/* Location */}
                <div className="flex min-h-[58px] items-center justify-between py-3">
                  <div>
                    <p className="text-[11px] leading-4 text-[#64748b]">
                      Location
                    </p>

                    <p className="text-[13px] font-semibold leading-5 text-[#111827] sm:text-[14px]">
                      {profile.location}
                    </p>
                  </div>

                  <MapPin className="h-4 w-4 text-[#cbd5e1]" />
                </div>
              </div>
            </section>

            {/* =====================================================
                PROFESSIONAL INFORMATION
            ====================================================== */}

            <section className="rounded-xl border border-[#dbe3ee] bg-white px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
              <div className="flex items-center gap-2 border-b border-[#e5eaf1] pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff]">
                  <BriefcaseBusiness className="h-4 w-4 text-[#4f46e5]" />
                </div>

                <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                  Professional Information
                </h2>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 py-2.5">
                  <p className="text-[11px] text-[#64748b]">Job Title</p>

                  <p className="mt-0.5 truncate text-[13px] font-semibold text-[#111827]">
                    {profile.jobTitle}
                  </p>
                </div>

                <div className="rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 py-2.5">
                  <p className="text-[11px] text-[#64748b]">Company</p>

                  <p className="mt-0.5 truncate text-[13px] font-semibold text-[#111827]">
                    {profile.company}
                  </p>
                </div>

                <div className="rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 py-2.5">
                  <p className="text-[11px] text-[#64748b]">Department</p>

                  <p className="mt-0.5 truncate text-[13px] font-semibold text-[#111827]">
                    {profile.department}
                  </p>
                </div>

                <div className="rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 py-2.5">
                  <p className="text-[11px] text-[#64748b]">
                    Years of Experience
                  </p>

                  <p className="mt-0.5 truncate text-[13px] font-semibold text-[#111827]">
                    {profile.experience}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* =======================================================
              RIGHT COLUMN
          ======================================================== */}

          <div className="space-y-4">
            {/* =====================================================
                ACCOUNT INFORMATION
            ====================================================== */}

            <section className="rounded-xl border border-[#dbe3ee] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-center gap-2 border-b border-[#e5eaf1] pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff]">
                  <ShieldCheck className="h-4 w-4 text-[#4f46e5]" />
                </div>

                <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                  Account Information
                </h2>
              </div>

              <div className="mt-2">
                <div className="flex min-h-[48px] items-center justify-between border-b border-[#edf1f5] gap-3">
                  <span className="text-[12px] text-[#64748b] sm:text-[13px]">
                    Account Type
                  </span>

                  <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold text-[#4f46e5]">
                    Recruiter
                  </span>
                </div>

                <div className="flex min-h-[48px] items-center justify-between border-b border-[#edf1f5] gap-3">
                  <span className="text-[12px] text-[#64748b] sm:text-[13px]">
                    Account Status
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                      profile.accountStatus === "disabled"
                        ? "bg-[#fef2f2] text-[#dc2626]"
                        : "bg-[#dcfce7] text-[#16a34a]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        profile.accountStatus === "disabled"
                          ? "bg-[#dc2626]"
                          : "bg-[#16a34a]"
                      }`}
                    />
                    {profile.accountStatus === "disabled"
                      ? "Disabled"
                      : "Active"}
                  </span>
                </div>

                <div className="flex min-h-[48px] items-center justify-between border-b border-[#edf1f5] gap-3">
                  <span className="text-[12px] text-[#64748b] sm:text-[13px]">
                    Member Since
                  </span>

                  <span className="text-right text-[12px] font-semibold text-[#111827] sm:text-[13px]">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </span>
                </div>

                <div className="flex min-h-[48px] items-center justify-between gap-3">
                  <span className="text-[12px] text-[#64748b] sm:text-[13px]">
                    Email Verification
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                      profile.emailVerified
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : "bg-[#fef3c7] text-[#b45309]"
                    }`}
                  >
                    {profile.emailVerified ? (
                      <>
                        <Check className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      "Not verified"
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* =====================================================
                SECURITY
            ====================================================== */}

            <section className="rounded-xl border border-[#dbe3ee] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-center gap-2 border-b border-[#e5eaf1] pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2ff]">
                  <LockKeyhole className="h-4 w-4 text-[#4f46e5]" />
                </div>

                <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                  Security
                </h2>
              </div>

              <div className="mt-3 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#64748b]">Password</p>

                    <p className="mt-0.5 truncate text-[13px] font-semibold tracking-[2px] text-[#111827]">
                      ••••••••••••
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenPassword}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[11px] font-semibold text-[#475569] transition hover:border-[#4f46e5] hover:text-[#4f46e5] sm:text-[12px]"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Change Password
                  </button>
                </div>
              </div>
            </section>

            {/* =====================================================
                ACCOUNT ACTIONS
            ====================================================== */}

            <section className="rounded-xl border border-[#dbe3ee] bg-white px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-center gap-2 border-b border-[#e5eaf1] pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f1f5f9]">
                  <Settings className="h-4 w-4 text-[#64748b]" />
                </div>

                <h2 className="text-[14px] font-bold text-[#111827] sm:text-[15px]">
                  Account Actions
                </h2>
              </div>

              <div className="mt-3 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-medium text-[#64748b]">
                      Sign out of your account
                    </p>

                    <p className="text-[11px] text-[#94a3b8]">
                      You will be returned to the login screen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLogoutModal(true)}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[12px] font-semibold text-[#ef4444] transition hover:border-[#fecaca] hover:bg-[#fffafa]"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ===========================================================
          EDIT PROFILE MODAL
      =========================================================== */}

      {editProfile && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f172a]/40 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseEdit();
            }
          }}
        >
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-[620px] sm:rounded-2xl">
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5eaf1] bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-[17px] font-bold text-[#111827]">
                  Edit Profile
                </h2>

                <p className="mt-0.5 text-[12px] text-[#64748b]">
                  Update your personal and professional information.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseEdit}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#111827]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSaveProfile}
              className="space-y-5 px-5 py-5 sm:px-6"
            >
              {/* Personal */}
              <div>
                <h3 className="mb-3 text-[13px] font-bold text-[#111827]">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Full Name
                    </label>

                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />

                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(event) =>
                          handleEditChange("fullName", event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none transition placeholder:text-[#94a3b8] focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />

                      <input
                        type="email"
                        value={editForm.email}
                        readOnly
                        className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />

                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(event) =>
                          handleEditChange("phone", event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Location
                    </label>

                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />

                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(event) =>
                          handleEditChange("location", event.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h3 className="mb-3 text-[13px] font-bold text-[#111827]">
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Job Title
                    </label>

                    <input
                      type="text"
                      value={editForm.jobTitle}
                      onChange={(event) =>
                        handleEditChange("jobTitle", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white px-3 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                      placeholder="Job title"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Company
                    </label>

                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(event) =>
                        handleEditChange("company", event.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white px-3 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Department
                    </label>

                    <div className="relative">
                      <select
                        value={editForm.department}
                        onChange={(event) =>
                          handleEditChange("department", event.target.value)
                        }
                        className="h-10 w-full appearance-none rounded-lg border border-[#dbe3ee] bg-white px-3 pr-9 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                      >
                        <option value="Human Resources">Human Resources</option>
                        <option value="Talent Acquisition">
                          Talent Acquisition
                        </option>
                        <option value="People Operations">
                          People Operations
                        </option>
                        <option value="Recruitment">Recruitment</option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                      Years of Experience
                    </label>

                    <div className="relative">
                      <select
                        value={editForm.experience}
                        onChange={(event) =>
                          handleEditChange("experience", event.target.value)
                        }
                        className="h-10 w-full appearance-none rounded-lg border border-[#dbe3ee] bg-white px-3 pr-9 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                      >
                        <option value="1 Year">1 Year</option>
                        <option value="2 Years">2 Years</option>
                        <option value="3 Years">3 Years</option>
                        <option value="4 Years">4 Years</option>
                        <option value="5 Years">5 Years</option>
                        <option value="6 Years">6 Years</option>
                        <option value="7 Years">7 Years</option>
                        <option value="8 Years">8 Years</option>
                        <option value="10+ Years">10+ Years</option>
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-2 border-t border-[#e5eaf1] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  disabled={isSavingProfile}
                  className="h-10 rounded-lg border border-[#dbe3ee] bg-white px-5 text-[13px] font-semibold text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-[13px] font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===========================================================
          CHANGE PASSWORD MODAL
      =========================================================== */}

      {changePassword && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f172a]/40 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClosePassword();
            }
          }}
        >
          <div className="w-full rounded-t-2xl bg-white shadow-2xl sm:max-w-[440px] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#e5eaf1] px-5 py-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#111827]">
                  Change Password
                </h2>

                <p className="mt-0.5 text-[12px] text-[#64748b]">
                  Keep your recruiter account secure.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePassword}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="space-y-4 px-5 py-5"
            >
              {/* Current password */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                  Current Password
                </label>

                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      handlePasswordChange(
                        "currentPassword",
                        event.target.value,
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white px-3 pr-10 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword((previous) => !previous)
                    }
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9]"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      handlePasswordChange("newPassword", event.target.value)
                    }
                    className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white px-3 pr-10 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                    placeholder="Minimum 8 characters"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((previous) => !previous)}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9]"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#64748b]">
                  Confirm New Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      handlePasswordChange(
                        "confirmPassword",
                        event.target.value,
                      )
                    }
                    className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white px-3 pr-10 text-[13px] text-[#111827] outline-none transition focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/10"
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#94a3b8] hover:bg-[#f1f5f9]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {passwordError && (
                <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2.5 text-[12px] font-medium text-[#dc2626]">
                  {passwordError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[#e5eaf1] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClosePassword}
                  disabled={isChangingPassword}
                  className="h-10 rounded-lg border border-[#dbe3ee] bg-white px-5 text-[13px] font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-[13px] font-semibold text-white transition hover:bg-[#4338ca] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isChangingPassword ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===========================================================
          LOGOUT CONFIRMATION
      =========================================================== */}

      {logoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0f172a]/40 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLogoutModal(false);
            }
          }}
        >
          <div className="w-full rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-[400px] sm:rounded-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fef2f2]">
              <LogOut className="h-5 w-5 text-[#ef4444]" />
            </div>

            <h2 className="mt-4 text-[17px] font-bold text-[#111827]">
              Logout from ResumeAI?
            </h2>

            <p className="mt-1.5 text-[13px] leading-5 text-[#64748b]">
              You will be signed out of your recruiter account and returned to
              the login screen.
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLogoutModal(false)}
                className="h-10 rounded-lg border border-[#dbe3ee] bg-white px-5 text-[13px] font-semibold text-[#475569] transition hover:bg-[#f8fafc]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#ef4444] px-5 text-[13px] font-semibold text-white transition hover:bg-[#dc2626]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
