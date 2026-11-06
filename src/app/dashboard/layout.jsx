"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  /*
   * ============================================================
   * ROLE
   * ============================================================
   *
   * For now the role is detected from the dashboard URL.
   *
   * Later, when authentication/user data is available, you can
   * replace this with:
   *
   * const role = user.role;
   *
   * without changing the sidebar/header components.
   */
  const isRecruiter = pathname?.startsWith("/dashboard/recruiter");

  const role = isRecruiter ? "recruiter" : "student";

  /*
   * ============================================================
   * SPECIAL PAGES
   * ============================================================
   */

  const isAssessmentPage = pathname?.includes("/assessment");

  const isInterviewPage = pathname?.includes("/interview/session");

  const isSpecialPage = isAssessmentPage || isInterviewPage;

  /*
   * ============================================================
   * MOBILE SIDEBAR
   * ============================================================
   */

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /*
   * Close mobile sidebar whenever the route changes.
   */
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  /*
   * Close sidebar with Escape.
   */
  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileSidebarOpen]);

  /*
   * Prevent background scrolling while mobile drawer is open.
   */
  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <DashboardHeader
        role={role}
        assessment={isAssessmentPage}
        interview={isInterviewPage}
        mobileSidebarOpen={mobileSidebarOpen}
        onMenuClick={() => setMobileSidebarOpen(true)}
      />

      <div className="flex">
        {/* ======================================================
            SIDEBAR
        ====================================================== */}

        {!isSpecialPage && (
          <DashboardSidebar
            role={role}
            mobileSidebarOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <main
          className={[
            "min-w-0 flex-1",
            !isSpecialPage
              ? role === "recruiter"
                ? "md:ml-[247px]"
                : "md:ml-[225px]"
              : "",
          ].join(" ")}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
