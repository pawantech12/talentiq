"use client";

import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

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
    label: "My Resume",
    href: "/dashboard/student/resume",
    icon: FileText,
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
 * Matches uploaded recruiter dashboard design.
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
 * USER DATA
 * ============================================================
 */

const users = {
  student: {
    name: "Rahul Sharma",
    initials: "RS",
    role: "Student",
  },

  recruiter: {
    name: "Anita Mehta",
    initials: "AM",
    role: "Recruiter",
  },
};

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function DashboardSidebar({
  role = "student",
  mobileSidebarOpen = false,
  onMobileClose = () => {},
}) {
  const pathname = usePathname();

  const isRecruiter = role === "recruiter";

  const navigation = isRecruiter ? recruiterNavigation : studentNavigation;

  const user = isRecruiter ? users.recruiter : users.student;

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
        studentNavigation[7], // Profile
      ];

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

        <div
          className={[
            "flex",
            "h-[64px]",
            "shrink-0",
            "items-center",
            "border-b",
            "border-[#DCE4EE]",
            isRecruiter ? "px-[20px]" : "px-[20px]",
          ].join(" ")}
        >
          <Link href="/" className="flex items-center gap-[10px]">
            {/* Logo square */}
            <div
              className="
                flex
                h-[32px]
                w-[32px]
                shrink-0
                items-center
                justify-center
                rounded-[7px]
                bg-[#5146E5]
                text-[17px]
                font-bold
                text-white
              "
            >
              R
            </div>

            <div className="min-w-0">
              <p
                className="
                  text-[17px]
                  font-bold
                  leading-[19px]
                  tracking-[-0.3px]
                  text-[#111827]
                "
              >
                ResumeAI
              </p>

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
            </div>
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
              {user.initials}
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
                {user.name}
              </p>

              <p
                className="
                  text-[11px]
                  leading-[15px]
                  text-[#71839E]
                "
              >
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ======================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {mobileSidebarOpen && (
        <div
          className="
            fixed
            inset-0
            z-[60]
            bg-[#111827]/30
            md:hidden
          "
          onClick={onMobileClose}
          aria-hidden="true"
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
            className="flex items-center gap-[10px]"
          >
            <div
              className="
                flex
                h-[32px]
                w-[32px]
                items-center
                justify-center
                rounded-[7px]
                bg-[#5146E5]
                text-[17px]
                font-bold
                text-white
              "
            >
              R
            </div>

            <div>
              <p
                className="
                  text-[17px]
                  font-bold
                  leading-[19px]
                  tracking-[-0.3px]
                  text-[#111827]
                "
              >
                ResumeAI
              </p>

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
            </div>
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close sidebar"
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
              {user.initials}
            </div>

            <div>
              <p
                className="
                  text-[12px]
                  font-[600]
                  leading-[16px]
                  text-[#111827]
                "
              >
                {user.name}
              </p>

              <p
                className="
                  text-[11px]
                  leading-[15px]
                  text-[#71839E]
                "
              >
                {user.role}
              </p>
            </div>
          </div>
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

            if (item.label === "My Resume") {
              mobileLabel = "Resume";
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
