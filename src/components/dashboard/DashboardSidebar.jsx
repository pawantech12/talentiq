"use client";

import {
  LayoutGrid,
  Search,
  BriefcaseBusiness,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Lightbulb,
  UserRound,
} from "lucide-react";

import { usePathname } from "next/navigation";

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

export default function DashboardSidebar({ role = "student" }) {
  const pathname = usePathname();

  const navigation = studentNavigation;

  return (
    <>
      {/* ==========================================
          DESKTOP SIDEBAR
      =========================================== */}

      <aside
        className="
          fixed
          bottom-0
          left-0
          top-[58px]
          z-30
          hidden
          w-[225px]
          border-r border-[#DCE4EE]
          bg-white
          md:flex
          md:flex-col
        "
      >
        {/* Menu label */}
        <div className="px-[15px] pt-[15px]">
          <p
            className="
              mb-[5px]
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

              const active =
                pathname === item.href ||
                (item.label === "Dashboard" &&
                  pathname === "/dashboard/student");

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={[
                    "flex h-[38px] items-center gap-[12px] rounded-[8px] px-[11px]",
                    "text-[14px] font-[500] transition-colors",
                    active
                      ? "bg-[#EEF0FF] text-[#5146E5]"
                      : "text-[#52627B] hover:bg-[#F6F8FC]",
                  ].join(" ")}
                >
                  <Icon size={17} strokeWidth={1.7} />

                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Desktop profile */}
        <div className="mt-auto border-t-0 px-[25px] pb-[20px]">
          <div className="flex items-center gap-[10px]">
            <div
              className="
                flex h-[30px] w-[30px]
                items-center justify-center
                rounded-full
                bg-[#EEF0FF]
                text-[10px]
                font-[700]
                text-[#5146E5]
              "
            >
              RS
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
                Rahul Sharma
              </p>

              <p
                className="
                  text-[11px]
                  leading-[15px]
                  text-[#71839E]
                "
              >
                Student
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MOBILE BOTTOM NAV
      =========================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          flex
          h-[64px]
          border-t border-[#E3E8F0]
          bg-white
          md:hidden
        "
      >
        {[
          studentNavigation[0],
          studentNavigation[1],
          studentNavigation[2],
          studentNavigation[3],
          studentNavigation[7],
        ].map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.label === "Dashboard" && pathname === "/dashboard/student");

          return (
            <a
              key={item.label}
              href={item.href}
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
                  "flex h-[30px] w-[34px] items-center justify-center rounded-[8px]",
                  active ? "bg-[#EEF0FF] text-[#5146E5]" : "text-[#91A2BC]",
                ].join(" ")}
              >
                <Icon size={18} strokeWidth={1.7} />
              </span>

              <span
                className={[
                  "text-[10px] font-[500] leading-[12px]",
                  active ? "text-[#5146E5]" : "text-[#91A2BC]",
                ].join(" ")}
              >
                {item.label === "My Applications"
                  ? "Applications"
                  : item.label === "My Resume"
                    ? "Resume"
                    : item.label}
              </span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
