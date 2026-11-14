"use client";

import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  LayoutGrid,
  Lightbulb,
  LogOut,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";

/*
 * ============================================================
 * STUDENT NAVIGATION
 * ============================================================
 */

const studentNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard/student",
    icon: LayoutGrid,
  },
  {
    label: "Find Jobs",
    href: "/dashboard/student/jobs",
    icon: Search,
  },
  {
    label: "My Applications",
    href: "/dashboard/student/applications",
    icon: BriefcaseBusiness,
  },
  {
    label: "Assessments",
    href: "/dashboard/student/assessments",
    icon: ClipboardCheck,
  },
  {
    label: "AI Mock Interview",
    href: "/dashboard/student/interview",
    icon: MessageSquare,
  },
  {
    label: "Feedback",
    href: "/dashboard/student/feedback",
    icon: Lightbulb,
  },
  {
    label: "Profile",
    href: "/dashboard/student/profile",
    icon: UserRound,
  },
];

/*
 * ============================================================
 * RECRUITER NAVIGATION
 * ============================================================
 */

const recruiterNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard/recruiter",
    icon: LayoutGrid,
  },
  {
    label: "Jobs",
    href: "/dashboard/recruiter/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Candidates",
    href: "/dashboard/recruiter/candidates",
    icon: UsersRound,
  },
  {
    label: "Applications",
    href: "/dashboard/recruiter/applications",
    icon: FileText,
  },
  {
    label: "AI Screening",
    href: "/dashboard/recruiter/ai-screening",
    icon: Sparkles,
  },
  {
    label: "Shortlisted",
    href: "/dashboard/recruiter/shortlisted",
    icon: Star,
  },
  {
    label: "Profile",
    href: "/dashboard/recruiter/profile",
    icon: UserRound,
  },
];

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function DashboardSidebar({
  role = "student",
  user: authenticatedUser = null,
  mobileSidebarOpen = false,
  onMobileClose = () => {},
  onLogout = () => {},
  loggingOut = false,
}) {
  const pathname = usePathname();

  const isRecruiter = role === "recruiter";

  const navigation = isRecruiter ? recruiterNavigation : studentNavigation;

  /*
   * ============================================================
   * AUTHENTICATED USER DATA
   * ============================================================
   */

  const defaultUser = isRecruiter
    ? {
        name: "Recruiter",
        initials: "R",
        role: "Recruiter",
        email: "",
      }
    : {
        name: "Student",
        initials: "S",
        role: "Student",
        email: "",
      };

  const fullName =
    authenticatedUser?.fullName || authenticatedUser?.name || defaultUser.name;

  const generatedInitials = fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const currentUser = {
    ...defaultUser,
    name: fullName,
    initials:
      authenticatedUser?.initials || generatedInitials || defaultUser.initials,
    role:
      authenticatedUser?.role === "recruiter"
        ? "Recruiter"
        : authenticatedUser?.role === "student"
          ? "Student"
          : defaultUser.role,
  };

  /*
   * ============================================================
   * ACTIVE STATE
   * ============================================================
   */

  const isActive = (item) => {
    if (item.label === "Dashboard") {
      return pathname === item.href;
    }

    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  };

  /*
   * ============================================================
   * MOBILE BOTTOM NAV
   * ============================================================
   */

  const mobileNavigation = isRecruiter
    ? [
        recruiterNavigation[0], // Dashboard
        recruiterNavigation[1], // Jobs
        recruiterNavigation[2], // Candidates
        recruiterNavigation[4], // AI Screening
        recruiterNavigation[6], // Profile
      ]
    : [
        studentNavigation[0], // Dashboard
        studentNavigation[1], // Find Jobs
        studentNavigation[2], // Applications
        studentNavigation[3], // Resume
        studentNavigation[6], // Profile
      ];

  /*
   * ============================================================
   * LOGOUT HANDLER
   * ============================================================
   */

  const handleLogout = () => {
    if (loggingOut) return;

    onLogout();
  };

  return (
    <>
      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className={[
          "fixed",
          "bottom-0",
          "left-0",
          "top-0",
          "z-40",
          "hidden",
          "border-r",
          "border-[#DCE4EE]",
          "bg-white",
          "md:flex",
          "md:flex-col",
          isRecruiter ? "w-[247px]" : "w-[225px]",
        ].join(" ")}
      >
        {/* ====================================================
            LOGO AREA
        ==================================================== */}

        {/* ====================================================
    LOGO AREA
==================================================== */}

        <div
          className="
    flex
    h-[64px]
    shrink-0
    items-center
    border-b
    border-[#DCE4EE]
    px-[20px]
  "
        >
          <Link href="/" className="flex flex-col gap-[6px]">
            <Image
              src="/logo.png"
              alt="ResumeAI Logo"
              width={128}
              height={32}
              priority
              className="h-auto w-[128px] object-contain"
            />

            <p
              className="
        mt-[2px]
        text-[10px]
        font-medium
        leading-[12px]
        text-[#61738E]
      "
            >
              {isRecruiter ? "Recruiter Portal" : "Student Portal"}
            </p>
          </Link>
        </div>

        {/* ====================================================
            MENU
        ==================================================== */}

        <div
          className={[
            "px-[12px]",
            "pt-[28px]",
            isRecruiter ? "pt-[28px]" : "pt-[15px]",
          ].join(" ")}
        >
          {!isRecruiter && (
            <p
              className="
                mb-[5px]
                px-[3px]
                text-[9px]
                font-[500]
                uppercase
                leading-[12px]
                text-[#91A2BC]
              "
            >
              Menu
            </p>
          )}

          <nav className="space-y-[3px]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onMobileClose}
                  className={[
                    "flex",
                    "h-[40px]",
                    "items-center",
                    "gap-[12px]",
                    "rounded-[8px]",
                    "px-[12px]",
                    "text-[14px]",
                    "font-[500]",
                    "transition-colors",
                    active
                      ? "bg-[#EEF0FF] text-[#5146E5]"
                      : "text-[#52627B] hover:bg-[#F6F8FC]",
                  ].join(" ")}
                >
                  <Icon size={17} strokeWidth={1.7} />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ====================================================
            DESKTOP PROFILE
        ==================================================== */}

        <div
          className="
            mt-auto
            border-t
            border-[#E8EDF4]
            px-[20px]
            py-[18px]
          "
        >
          <div className="flex items-center gap-[10px]">
            <div
              className="
                flex
                h-[36px]
                w-[36px]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#EEF0FF]
                text-[11px]
                font-[700]
                text-[#5146E5]
              "
            >
              {currentUser.initials}
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[12px]
                  font-[600]
                  leading-[16px]
                  text-[#111827]
                "
              >
                {currentUser.name}
              </p>

              <p
                className="
                  text-[11px]
                  leading-[15px]
                  text-[#71839E]
                "
              >
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            className="
              mt-4
              flex
              w-full
              items-center
              gap-2
              rounded-[8px]
              px-2
              py-2
              text-[12px]
              font-medium
              text-[#64748B]
              transition
              hover:bg-red-50
              hover:text-red-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <LogOut size={16} strokeWidth={1.7} />

            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* ======================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {mobileSidebarOpen && (
        <button
          type="button"
          className="
            fixed
            inset-0
            z-[60]
            cursor-default
            border-0
            bg-[#111827]/30
            p-0
            md:hidden
          "
          onClick={onMobileClose}
          aria-label="Close navigation menu"
        />
      )}

      {/* ======================================================
          MOBILE SIDEBAR DRAWER
      ====================================================== */}

      <aside
        className={[
          "fixed",
          "bottom-0",
          "left-0",
          "top-0",
          "z-[70]",
          "flex",
          "w-[280px]",
          "flex-col",
          "bg-white",
          "shadow-[8px_0_30px_rgba(15,23,42,0.12)]",
          "transition-transform",
          "duration-300",
          "ease-out",
          "md:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal={mobileSidebarOpen ? "true" : undefined}
        aria-label="Dashboard navigation"
        aria-hidden={!mobileSidebarOpen}
      >
        {/* ====================================================
    MOBILE DRAWER HEADER
==================================================== */}

        <div
          className="
    flex
    h-[64px]
    shrink-0
    items-center
    justify-between
    border-b
    border-[#DCE4EE]
    px-[18px]
  "
        >
          <Link
            href="/"
            onClick={onMobileClose}
            className="flex flex-col gap-[6px]"
          >
            <Image
              src="/logo.png"
              alt="ResumeAI Logo"
              width={128}
              height={32}
              priority
              className="h-auto w-[128px] object-contain"
            />

            <p
              className="
        mt-[2px]
        text-[10px]
        font-medium
        leading-[12px]
        text-[#61738E]
      "
            >
              {isRecruiter ? "Recruiter Portal" : "Student Portal"}
            </p>
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="
      flex
      h-[34px]
      w-[34px]
      shrink-0
      items-center
      justify-center
      rounded-[8px]
      border
      border-[#DCE4EE]
      bg-white
      text-[#61738E]
      transition
      hover:bg-[#F8FAFC]
      hover:text-[#5146E5]
    "
          >
            <X size={17} strokeWidth={1.7} />
          </button>
        </div>

        {/* ====================================================
            MOBILE DRAWER MENU
        ==================================================== */}

        <div className="flex-1 overflow-y-auto px-[12px] pt-[22px]">
          <p
            className="
              mb-[7px]
              px-[4px]
              text-[9px]
              font-[500]
              uppercase
              leading-[12px]
              text-[#91A2BC]
            "
          >
            Menu
          </p>

          <nav className="space-y-[3px]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onMobileClose}
                  className={[
                    "flex",
                    "h-[42px]",
                    "items-center",
                    "gap-[12px]",
                    "rounded-[8px]",
                    "px-[12px]",
                    "text-[14px]",
                    "font-[500]",
                    active
                      ? "bg-[#EEF0FF] text-[#5146E5]"
                      : "text-[#52627B] hover:bg-[#F6F8FC]",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={1.7} />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ====================================================
            MOBILE PROFILE
        ==================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-[#E8EDF4]
            px-[18px]
            py-[18px]
          "
        >
          <div className="flex items-center gap-[10px]">
            <div
              className="
                flex
                h-[36px]
                w-[36px]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#EEF0FF]
                text-[11px]
                font-[700]
                text-[#5146E5]
              "
            >
              {currentUser.initials}
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[12px]
                  font-[600]
                  leading-[16px]
                  text-[#111827]
                "
              >
                {currentUser.name}
              </p>

              <p
                className="
                  text-[11px]
                  leading-[15px]
                  text-[#71839E]
                "
              >
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            className="
              mt-4
              flex
              w-full
              items-center
              gap-2
              rounded-[8px]
              px-2
              py-2
              text-[12px]
              font-medium
              text-[#64748B]
              transition
              hover:bg-red-50
              hover:text-red-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <LogOut size={16} strokeWidth={1.7} />

            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* ======================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          flex
          h-[64px]
          border-t
          border-[#E3E8F0]
          bg-white
          md:hidden
        "
      >
        {mobileNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          let mobileLabel = item.label;

          if (isRecruiter) {
            if (item.label === "AI Screening") {
              mobileLabel = "AI Screen";
            }
          } else {
            if (item.label === "Find Jobs") {
              mobileLabel = "Jobs";
            }

            if (item.label === "My Applications") {
              mobileLabel = "Applications";
            }
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onMobileClose}
              className="
                flex
                flex-1
                flex-col
                items-center
                justify-center
                gap-[3px]
              "
            >
              <span
                className={[
                  "flex",
                  "h-[30px]",
                  "w-[34px]",
                  "items-center",
                  "justify-center",
                  "rounded-[8px]",
                  active ? "bg-[#EEF0FF] text-[#5146E5]" : "text-[#91A2BC]",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={1.7} />
              </span>

              <span
                className={[
                  "text-[10px]",
                  "font-[500]",
                  "leading-[12px]",
                  active ? "text-[#5146E5]" : "text-[#91A2BC]",
                ].join(" ")}
              >
                {mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
