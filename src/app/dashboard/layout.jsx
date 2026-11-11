"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const isRecruiter = pathname?.startsWith("/dashboard/recruiter");
  const role = isRecruiter ? "recruiter" : "student";

  const isAssessmentPage =
    pathname?.match(
      /^\/dashboard\/student\/jobs\/[^/]+\/assessment(?:\/result)?\/?$/,
    ) !== null;
  const isInterviewPage = pathname?.includes("/interview/session");
  const isSpecialPage = isAssessmentPage || isInterviewPage;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

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

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileSidebarOpen]);

  // Fetch the currently authenticated user.
  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load current user.");
        }

        const data = await response.json();

        if (!data.success || !data.user) {
          throw new Error("Invalid user response.");
        }

        if (!cancelled) {
          const fullName = data.user.fullName || "User";

          const initials = fullName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0).toUpperCase())
            .join("");

          setUser({
            id: data.user.id,
            name: fullName,
            fullName,
            email: data.user.email,
            role: data.user.role === "recruiter" ? "Recruiter" : "Student",
            roleValue: data.user.role,
            initials: initials || "U",
            profile: data.user.profile || {},
          });

          // Prevent a student account from using recruiter dashboard
          // and vice versa.
          const actualDashboard =
            data.user.role === "recruiter"
              ? "/dashboard/recruiter"
              : "/dashboard/student";

          if (
            pathname?.startsWith("/dashboard/") &&
            !pathname.startsWith(actualDashboard)
          ) {
            router.replace(actualDashboard);
          }
        }
      } catch (error) {
        console.error("Current user error:", error);

        if (!cancelled) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      setUser(null);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      alert("Unable to log out. Please try again.");
    }
  };

  // Do not display dashboard content before authentication is checked.
  if (loadingUser || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E0E7FF] border-t-[#4F46E5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader
        role={role}
        user={user}
        assessment={isAssessmentPage}
        interview={isInterviewPage}
        mobileSidebarOpen={mobileSidebarOpen}
        onMenuClick={() => setMobileSidebarOpen(true)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      <div className="flex">
        {!isSpecialPage && (
          <DashboardSidebar
            role={role}
            user={user}
            mobileSidebarOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
            onLogout={handleLogout}
            loggingOut={loggingOut}
          />
        )}

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
