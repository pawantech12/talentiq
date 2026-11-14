"use client";

import {
  LogOut,
  ArrowRightFromLine,
  Bell,
  Building2,
  ClipboardList,
  Clock3,
  Layers3,
  MapPin,
  Menu,
  Search,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

export default function DashboardHeader({
  role = "student",
  assessment = false,
  interview = false,
  mobileSidebarOpen = false,
  onMenuClick = () => {},
  onLogout = () => {},
  loggingOut = false,
  user,
}) {
  /*
   * ============================================================
   * USER DATA
   * ============================================================
   */

  const defaultUser =
    role === "recruiter"
      ? {
          name: "Recruiter",
          initials: "R",
          role: "Recruiter",
        }
      : {
          name: "Student",
          initials: "S",
          role: "Student",
        };

  const currentUser = {
    ...defaultUser,
    ...(user || {}),
    name: user?.fullName || user?.name || defaultUser.name,
    role:
      user?.role === "recruiter"
        ? "Recruiter"
        : user?.role === "student"
          ? "Student"
          : defaultUser.role,
    initials:
      user?.initials ||
      (user?.fullName || user?.name || "")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") ||
      defaultUser.initials,
  };

  const isRecruiter = role === "recruiter";

  /*
   * ============================================================
   * AI MOCK INTERVIEW ACTIVE HEADER
   * ============================================================
   */

  if (interview) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#DCE4EE] bg-white">
        {/* ======================================================
            DESKTOP / TABLET HEADER
        ====================================================== */}

        <div className="hidden h-[68px] items-center px-8 lg:flex">
          {/* Logo + Interview Status */}

          <div className="flex min-w-0 flex-1 items-center">
            <Link href="/" className="flex shrink-0 items-center">
              <Image
                src="/logo.png"
                alt="ResumeAI Logo"
                width={128}
                height={32}
                priority
                className="h-auto w-[128px]"
              />
            </Link>

            <div className="mx-4 h-[32px] w-px bg-[#DCE4EE]" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                  Interview in Progress
                </span>
              </div>

              <p className="mt-1 text-[12px] font-medium leading-none text-[#61738E]">
                AI Mock Interview
              </p>
            </div>
          </div>

          {/* Center Job Information */}

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
            <h1 className="text-[16px] font-bold leading-[20px] tracking-[-0.15px] text-[#172033]">
              Full Stack Developer
            </h1>

            <div className="mt-1 flex items-center gap-2 text-[12px] text-[#71829A]">
              <span className="flex items-center gap-1">
                <Building2 size={13} strokeWidth={1.6} />
                ABC Technologies
              </span>

              <span className="h-3 w-px bg-[#DCE4EE]" />

              <span className="flex items-center gap-1">
                <MapPin size={13} strokeWidth={1.6} />
                Mumbai
              </span>
            </div>
          </div>

          {/* Right Side */}

          <div className="flex flex-1 items-center justify-end">
            <div className="flex items-center gap-2 pr-5">
              <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#172033]">
                <Layers3
                  size={15}
                  strokeWidth={1.7}
                  className="text-[#61738E]"
                />
                Question 3 of 8
              </span>

              <div className="h-[32px] w-px bg-[#DCE4EE]" />
            </div>

            <div className="flex items-center gap-1.5 pr-5">
              <Clock3 size={15} strokeWidth={1.7} className="text-[#4F46E5]" />

              <span className="text-[16px] font-bold leading-none text-[#172033]">
                08:42
              </span>
            </div>

            <div className="h-[32px] w-px bg-[#DCE4EE]" />

            <button
              type="button"
              onClick={() => window.history.back()}
              className="
                ml-5
                flex
                h-[34px]
                items-center
                gap-2
                rounded-[8px]
                border
                border-[#DCE4EE]
                bg-white
                px-4
                text-[12px]
                font-medium
                text-[#64748B]
                transition
                hover:border-[#C7D2FE]
                hover:bg-[#F8FAFC]
                hover:text-[#4F46E5]
              "
            >
              <X size={14} strokeWidth={1.7} />
              Exit Interview
            </button>
          </div>
        </div>

        {/* ======================================================
            MOBILE HEADER
        ====================================================== */}

        <div className="lg:hidden">
          <div className="flex h-[52px] items-center border-b border-[#EEF2F7] px-3">
            <div className="flex flex-1 items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="ResumeAI Logo"
                  width={112}
                  height={28}
                  priority
                  className="h-auto w-[112px]"
                />
              </Link>
            </div>

            <div className="mr-2 flex h-[30px] items-center gap-1.5 rounded-[8px] bg-[#EEF0FF] px-2.5 text-[#4F46E5]">
              <Clock3 size={13} strokeWidth={1.8} />

              <span className="text-[13px] font-bold">08:42</span>
            </div>

            <button
              type="button"
              aria-label="Exit interview"
              onClick={() => window.history.back()}
              className="
                flex
                h-[30px]
                items-center
                gap-1
                rounded-[8px]
                border
                border-[#DCE4EE]
                bg-white
                px-2.5
                text-[12px]
                font-medium
                text-[#64748B]
              "
            >
              <X size={13} strokeWidth={1.7} />

              <span>Exit</span>
            </button>
          </div>

          <div className="flex h-[40px] items-center justify-between border-b border-[#DCE4EE] px-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />

                <span className="text-[11px] font-semibold text-[#16A34A]">
                  Interview in Progress
                </span>
              </div>

              <p className="mt-0.5 truncate text-[11px] leading-none text-[#52627B]">
                Full Stack Developer · ABC Technologies
              </p>
            </div>

            <div className="ml-3 shrink-0 rounded-full bg-[#EEF0FF] px-2.5 py-1 text-[11px] font-bold text-[#4F46E5]">
              3 / 8
            </div>
          </div>

          <div className="px-4 py-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-[#52627B]">
                Question 3 of 8
              </span>

              <span className="text-[12px] font-semibold text-[#4F46E5]">
                37.5% Complete
              </span>
            </div>

            <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#E8ECF5]">
              <div
                className="h-full rounded-full bg-[#5146E5]"
                style={{ width: "37.5%" }}
              />
            </div>
          </div>
        </div>

        <div className="hidden h-[4px] bg-[#EEF0FF] lg:block">
          <div className="h-full bg-[#5146E5]" style={{ width: "37.5%" }} />
        </div>
      </header>
    );
  }

  /*
   * ============================================================
   * ASSESSMENT HEADER
   * ============================================================
   */

  if (assessment) {
    return (
      <header className="sticky top-0 z-50 h-[58px] w-full border-b border-[#DCE4EE] bg-white">
        <div className="flex h-full items-center px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="ResumeAI Logo"
                width={128}
                height={32}
                priority
                className="h-auto w-[128px]"
              />
            </Link>
          </div>

          <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
            <ClipboardList
              size={16}
              strokeWidth={1.7}
              className="text-[#52627B]"
            />

            <span className="hidden text-[15px] font-semibold text-[#111827] sm:inline">
              Skill Assessment
            </span>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="
                hidden
                h-[32px]
                items-center
                gap-1.5
                rounded-[8px]
                border
                border-[#DCE4EE]
                bg-white
                px-3
                text-[12px]
                font-medium
                text-[#64748B]
                transition
                hover:border-[#C7D2FE]
                hover:text-[#4F46E5]
                sm:inline-flex
              "
            >
              <ArrowRightFromLine size={14} strokeWidth={1.7} />
              Exit Assessment
            </button>

            <button
              type="button"
              aria-label="Exit assessment"
              onClick={() => window.history.back()}
              className="
                flex
                h-[34px]
                w-[34px]
                items-center
                justify-center
                rounded-[8px]
                border
                border-[#DCE4EE]
                bg-white
                text-[#64748B]
                transition
                hover:border-[#C7D2FE]
                hover:text-[#4F46E5]
                sm:hidden
              "
            >
              <ArrowRightFromLine size={16} strokeWidth={1.7} />
            </button>

            <div className="hidden items-center gap-2 sm:flex">
              <span
                className="
                  flex
                  h-[34px]
                  w-[34px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#4F46E5]
                  text-[10px]
                  font-bold
                  text-white
                "
              >
                {currentUser.initials}
              </span>

              <div className="leading-none">
                <p className="text-[11px] font-bold text-[#111827]">
                  {currentUser.name}
                </p>

                <p className="mt-1 text-[10px] text-[#71839E]">
                  {currentUser.role}
                </p>
              </div>
            </div>

            <div
              className="
                flex
                h-[34px]
                w-[34px]
                items-center
                justify-center
                rounded-full
                bg-[#4F46E5]
                text-[10px]
                font-bold
                text-white
                sm:hidden
              "
            >
              {currentUser.initials}
            </div>
          </div>
        </div>
      </header>
    );
  }

  /*
   * ============================================================
   * NORMAL DASHBOARD HEADER
   * ============================================================
   */

  return (
    <header
      className={[
        "sticky",
        "top-0",
        "z-40",
        "h-[64px]",
        "w-full",
        "border-b",
        "border-[#DCE4EE]",
        "bg-white",
        isRecruiter
          ? "md:ml-[247px] md:w-[calc(100%-247px)]"
          : "md:ml-[225px] md:w-[calc(100%-225px)]",
      ].join(" ")}
    >
      <div className="flex h-full items-center">
        {/* ====================================================
            MOBILE MENU + LOGO
        ==================================================== */}

        <div className="flex flex-1 items-center gap-[8px] px-[12px] md:hidden">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="
              flex
              h-[36px]
              w-[36px]
              shrink-0
              items-center
              justify-center
              rounded-[9px]
              border
              border-[#DCE4EE]
              bg-white
              text-[#52627B]
              transition
              hover:bg-[#F8FAFC]
              hover:text-[#5146E5]
            "
          >
            {mobileSidebarOpen ? (
              <X size={18} strokeWidth={1.7} />
            ) : (
              <Menu size={18} strokeWidth={1.7} />
            )}
          </button>

          <Link href="/" className="flex min-w-0 items-center">
            <Image
              src="/logo.png"
              alt="ResumeAI Logo"
              width={108}
              height={28}
              priority
              className="h-auto w-[108px]"
            />
          </Link>
        </div>

        {/* ====================================================
            DESKTOP PAGE TITLE
        ==================================================== */}

        <div className="hidden min-w-0 flex-1 px-[28px] md:block">
          <h1 className="text-[20px] font-bold leading-[22px] tracking-[-0.35px] text-[#111827]">
            {isRecruiter ? "Recruiter Dashboard" : "Dashboard"}
          </h1>

          <p className="mt-[1px] text-[12px] leading-[16px] text-[#71839E]">
            {isRecruiter
              ? "Manage jobs, candidates, and recruitment activity."
              : "Track your applications and improve your job readiness."}
          </p>
        </div>

        {/* ====================================================
            RIGHT ACTIONS
        ==================================================== */}

        <div
          className="
            flex
            h-full
            items-center
            gap-[10px]
            px-[12px]
            md:px-[28px]
          "
        >
          {/* ==================================================
              RECRUITER SEARCH
          ================================================== */}

          {isRecruiter && (
            <div
              className="
                hidden
                h-[38px]
                w-[220px]
                items-center
                gap-[8px]
                rounded-[9px]
                border
                border-[#DCE4EE]
                bg-[#F8FAFC]
                px-[11px]
                lg:flex
              "
            >
              <Search
                size={16}
                strokeWidth={1.7}
                className="shrink-0 text-[#91A2BC]"
              />

              <input
                type="text"
                placeholder="Search candidates..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[12px]
                  font-medium
                  text-[#111827]
                  outline-none
                  placeholder:text-[#91A2BC]
                "
                aria-label="Search candidates"
              />
            </div>
          )}

          {/* ==================================================
              MOBILE SEARCH
          ================================================== */}

          {isRecruiter && (
            <button
              type="button"
              aria-label="Search candidates"
              className="
                flex
                h-[36px]
                w-[36px]
                items-center
                justify-center
                rounded-[9px]
                border
                border-[#DCE4EE]
                bg-[#F8FAFC]
                text-[#71839E]
                lg:hidden
              "
            >
              <Search size={17} strokeWidth={1.7} />
            </button>
          )}

          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <button
            type="button"
            aria-label="Notifications"
            className="
              flex
              h-[36px]
              w-[36px]
              items-center
              justify-center
              rounded-[9px]
              border
              border-[#DCE4EE]
              bg-[#F8FAFC]
              text-[#71839E]
              transition
              hover:border-[#C7D2FE]
              hover:text-[#4F46E5]
            "
          >
            <Bell size={17} strokeWidth={1.7} />
          </button>

          {/* ==================================================
              DESKTOP USER
          ================================================== */}

          <div className="hidden items-center gap-[9px] md:flex">
            <div
              className="
                flex
                h-[36px]
                w-[36px]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#4F46E5]
                text-[10px]
                font-bold
                text-white
              "
            >
              {currentUser.initials}
            </div>

            <div className="leading-none">
              <p
                className="
                  text-[12px]
                  font-bold
                  leading-[14px]
                  text-[#111827]
                "
              >
                {currentUser.name}
              </p>

              <p
                className="
                  mt-[3px]
                  text-[10px]
                  leading-[12px]
                  text-[#71839E]
                "
              >
                {currentUser.role}
              </p>
            </div>
          </div>

          {/* ==================================================
              MOBILE USER
          ================================================== */}

          <div
            className="
              flex
              h-[34px]
              w-[34px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#4F46E5]
              text-[10px]
              font-bold
              text-white
              md:hidden
            "
          >
            {currentUser.initials}
          </div>

          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
            className="
    flex
    h-[36px]
    items-center
    justify-center
    gap-2
    rounded-[9px]
    border
    border-[#DCE4EE]
    bg-white
    px-3
    text-[12px]
    font-medium
    text-[#64748B]
    transition
    hover:border-red-200
    hover:bg-red-50
    hover:text-red-600
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
          >
            <LogOut size={16} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </header>
  );
}
