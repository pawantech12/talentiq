"use client";

import { Bell, FileCheck2, Search, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardHeader({
  user = {
    name: "Rahul Sharma",
    initials: "RS",
    role: "Student",
  },
}) {
  return (
    <header
      className="
        sticky top-0 z-40
        h-[58px]
        w-full
        border-b border-[#DCE4EE]
        bg-white
      "
    >
      <div className="flex h-full items-center">
        {/* =====================================
            DESKTOP LOGO AREA
        ====================================== */}

        <div
          className="
            hidden
            h-full
            w-[225px]
            shrink-0
            items-center
            border-r border-[#DCE4EE]
            px-[20px]
            md:flex
          "
        >
          <Link href="/" className="flex items-center gap-[9px]">
            <Image
              src="/logo.png"
              alt="ResumeAI Logo"
              width={0}
              height={0}
              sizes="100vw"
              className="w-32"
            />
          </Link>
        </div>

        {/* =====================================
            DESKTOP TITLE
        ====================================== */}

        <div
          className="
            hidden
            min-w-0
            flex-1
            px-[28px]
            md:block
          "
        >
          <h1
            className="
              text-[20px]
              font-[700]
              leading-[22px]
              tracking-[-0.35px]
              text-[#111827]
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-[1px]
              text-[12px]
              leading-[16px]
              text-[#71839E]
            "
          >
            Track your applications and improve your job readiness.
          </p>
        </div>

        {/* =====================================
            MOBILE LOGO
        ====================================== */}

        <div className="flex flex-1 items-center px-[20px] md:hidden">
          <Link href="/" className="flex items-center gap-[9px]">
            <Image
              src="/logo.png"
              alt="ResumeAI Logo"
              width={0}
              height={0}
              sizes="100vw"
              className="w-32"
            />
          </Link>
        </div>

        {/* =====================================
            RIGHT ACTIONS
        ====================================== */}

        <div
          className="
            flex
            h-full
            items-center
            gap-[10px]
            px-[20px]
            md:px-[28px]
          "
        >
          {/* Search - desktop only */}
          <button
            type="button"
            aria-label="Search"
            className="
              hidden
              h-[36px] w-[36px]
              items-center justify-center
              rounded-[9px]
              border border-[#DCE4EE]
              bg-[#F8FAFC]
              text-[#71839E]
              md:flex
            "
          >
            <Search size={17} strokeWidth={1.7} />
          </button>

          {/* Notification */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              flex
              h-[36px] w-[36px]
              items-center justify-center
              rounded-[9px]
              border border-[#DCE4EE]
              bg-[#F8FAFC]
              text-[#71839E]
            "
          >
            <Bell size={17} strokeWidth={1.7} />
          </button>

          {/* Desktop User */}
          <button
            type="button"
            className="
              hidden
              h-[38px]
              items-center
              gap-[9px]
              rounded-[8px]
              border border-[#DCE4EE]
              bg-white
              px-[9px]
              md:flex
            "
          >
            <span
              className="
                flex
                h-[27px] w-[27px]
                items-center justify-center
                rounded-full
                bg-[#EEF0FF]
                text-[10px]
                font-[700]
                text-[#5146E5]
              "
            >
              {user.initials}
            </span>

            <span className="pr-[2px] text-left">
              <span
                className="
                  block
                  text-[11px]
                  font-[700]
                  leading-[13px]
                  text-[#111827]
                "
              >
                {user.name}
              </span>

              <span
                className="
                  block
                  text-[10px]
                  leading-[13px]
                  text-[#71839E]
                "
              >
                {user.role}
              </span>
            </span>
          </button>

          {/* Mobile avatar */}
          <div
            className="
              flex
              h-[34px] w-[34px]
              items-center justify-center
              rounded-full
              bg-[#EEF0FF]
              text-[10px]
              font-[700]
              text-[#5146E5]
              md:hidden
            "
          >
            {user.initials}
          </div>
        </div>
      </div>
    </header>
  );
}
