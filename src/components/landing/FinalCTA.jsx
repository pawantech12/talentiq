"use client";

import { ArrowRight, Sparkles, ShieldCheck, Zap, Users } from "lucide-react";

export default function FinalCTA() {
  return (
    <section
      className="
        relative
        w-full
        overflow-hidden
        bg-[#0F172A]
        px-[22px]
        py-[48px]
        md:px-20
        md:py-28
      "
    >
      {/* =========================================
          BACKGROUND DECORATIONS
      ========================================== */}

      {/* Desktop / large-screen decorative stars */}
      <Sparkles
        className="
          absolute
          left-[5.5%]
          top-[80px]
          hidden
          text-[#4735d9]
          md:block
        "
        size={18}
        strokeWidth={1.2}
      />

      <Sparkles
        className="
          absolute
          left-[13.9%]
          top-[179px]
          hidden
          text-[#2739a7]
          md:block
        "
        size={13}
        strokeWidth={1.1}
      />

      <Sparkles
        className="
          absolute
          right-[8.1%]
          top-[99px]
          hidden
          text-[#4735d9]
          md:block
        "
        size={17}
        strokeWidth={1.2}
      />

      <Sparkles
        className="
          absolute
          right-[17.3%]
          top-[199px]
          hidden
          text-[#2739a7]
          md:block
        "
        size={14}
        strokeWidth={1.1}
      />

      {/* Lightning decorations */}
      <Zap
        className="
          absolute
          left-[8.5%]
          top-[299px]
          hidden
          text-[#1d2d5a]
          md:block
        "
        size={14}
        strokeWidth={1.1}
      />

      <Zap
        className="
          absolute
          right-[10.2%]
          top-[280px]
          hidden
          text-[#1d2d5a]
          md:block
        "
        size={16}
        strokeWidth={1.1}
      />

      {/* =========================================
          CONTENT
      ========================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-[900px]
          flex-col
          gap-9
          items-center
          text-center
        "
      >
        <div className="flex flex-col gap-5">
          {/* =========================================
            PLATFORM BADGE
        ========================================== */}

          <div
            className="
            inline-flex
            items-center
            gap-[8px]
            w-fit mx-auto
            rounded-full
            border
            border-[#312E81]
            bg-[#1E1B4B]
            px-4 py-[6px]
            text-[12px]
            font-semibold
            leading-none
            text-[#A5B4FC]
          "
          >
            <span
              className="
              h-[6px]
              w-[6px]
              rounded-full
              bg-[#5746e8]
              shadow-[0_0_7px_rgba(87,70,232,0.8)]
            "
            />

            <span>ResumeAI Platform</span>
          </div>

          {/* Small decorative sparkles around badge */}
          <Sparkles
            className="
            absolute
            left-[calc(50%-165px)]
            top-[5px]
            text-[#7447ff]
          "
            size={17}
            strokeWidth={1.4}
          />

          <Sparkles
            className="
            absolute
            right-[calc(50%-165px)]
            top-[5px]
            text-[#7447ff]
          "
            size={16}
            strokeWidth={1.4}
          />

          {/* =========================================
            HEADING
        ========================================== */}

          <h2
            className="
            max-w-[650px]
            text-[28px]
            font-extrabold
            leading-[32px]
            tracking-[-1.1px]
            text-white
            md:text-[52px]
            md:leading-[64px]
            md:tracking-[-1.8px]
          "
          >
            Ready to Make Hiring
            <br />
            Smarter?
          </h2>

          {/* =========================================
            DESCRIPTION
        ========================================== */}

          <p
            className="
            max-w-[590px]
            text-sm
          
            leading-[21px]
            text-[#94A3B8]
            sm:text-lg
            sm:leading-[30px]
            
          "
          >
            Whether you're looking for your next opportunity or your next great
            <br className="hidden md:block" />
            candidate, ResumeAI helps you make better decisions with AI.
          </p>
        </div>

        <div className="flex flex-col gap-5 w-full">
          {/* =========================================
            BUTTONS
        ========================================== */}

          <div
            className="
          mx-auto
            flex
            w-full
            max-w-[408px]
            flex-col
            gap-5 sm:gap-4
            sm:flex-row
          "
          >
            {/* Primary */}
            <button
              type="button"
              className="
              px-9 py-4 rounded-[10px] bg-gradient-to-tr from-[#312E81] to-[#4F46E5] text-white flex items-center justify-center gap-[10px] text-base font-bold 
            "
            >
              <span>Get Started</span>

              <ArrowRight
                size={19}
                strokeWidth={1.9}
                className="
                transition-transform
                duration-200
                group-hover:translate-x-[3px]
              "
              />
            </button>

            {/* Secondary */}
            <button
              type="button"
              className="
              px-9 py-4 rounded-[10px] border border-[#334155] text-[#CBD5E1] flex items-center justify-center gap-[10px] text-base font-semibold
            "
            >
              Explore Platform
            </button>
          </div>

          {/* =========================================
            TRUST / BENEFIT ROW
        ========================================== */}

          <div
            className="
            hidden
            items-center
            justify-center
            text-[13px]
            font-[400]
            text-[#67758f]
            md:flex
          "
          >
            {/* Item 1 */}
            <div className="flex items-center gap-[7px] px-[17px]">
              <ShieldCheck
                size={15}
                strokeWidth={1.7}
                className="text-[#5c4eff]"
              />

              <span>No credit card required</span>
            </div>

            <span className="h-[18px] w-px bg-[#28344b]" />

            {/* Item 2 */}
            <div className="flex items-center gap-[7px] px-[17px]">
              <Zap size={15} strokeWidth={1.7} className="text-[#5c4eff]" />

              <span>Setup in minutes</span>
            </div>

            <span className="h-[18px] w-px bg-[#28344b]" />

            {/* Item 3 */}
            <div className="flex items-center gap-[7px] px-[17px]">
              <Users size={15} strokeWidth={1.7} className="text-[#5c4eff]" />

              <span>10,000+ users</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
