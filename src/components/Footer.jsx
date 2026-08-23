"use client";

import { FileCheck2, Twitter, Linkedin, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Students", href: "#students" },
  { label: "For Recruiters", href: "#recruiters" },
];

const platformLinks = [
  { label: "Find Jobs", href: "#jobs" },
  { label: "Resume Analysis", href: "#resume-analysis" },
  { label: "Skill Assessment", href: "#skill-assessment" },
  { label: "AI Interview", href: "#ai-interview" },
];

const companyLinks = [
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer
      className="
        w-full
        bg-[#0d1529]
        md:bg-white
      "
    >
      {/* =========================================
          MAIN FOOTER
      ========================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1440px]
          px-[24px]
          py-[40px]
          md:px-[80px]
          md:py-[40px]
        "
      >
        <div
          className="
            flex
            flex-col
            md:flex-row
            md:justify-between
          "
        >
          {/* =====================================
              BRAND
          ====================================== */}

          <div
            className="
              w-full
              md:max-w-[280px]
            "
          >
            {/* Logo */}

            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-[10px]
              "
            >
              <Image
                src="/logo.png"
                alt="ResumeAI Logo"
                width={0}
                height={0}
                sizes="100vw"
                className="w-36"
              />
            </Link>

            {/* Description */}

            <p
              className="
                mt-[20px]
                max-w-[235px]
                text-[14px]
                font-[400]
                leading-[22px]
                text-[#657894]
              "
            >
              AI-powered resume screening, candidate ranking and career
              assessment.
            </p>
          </div>

          {/* =====================================
              FOOTER NAVIGATION
          ====================================== */}

          <div
            className="
              mt-[40px]
              grid
              grid-cols-2
              gap-x-[60px]
              gap-y-[30px]
              md:mt-[0]
              md:grid-cols-[105px_125px_82px]
              md:gap-[60px]
            "
          >
            {/* =====================================
                PRODUCT
            ====================================== */}

            <div>
              <h3
                className="
                  text-[12px]
                  font-[700]
                  uppercase
                  leading-[18px]
                  text-white
                  md:text-[#111827]
                "
              >
                Product
              </h3>

              <ul className="mt-[12px] space-y-[8px]">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="
                        text-[14px]
                        font-[400]
                        leading-[21px]
                        text-[#657894]
                        transition-colors
                        duration-150
                        hover:text-[#4f46e5]
                        md:text-[#657894]
                      "
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* =====================================
                PLATFORM
            ====================================== */}

            <div>
              <h3
                className="
                  text-[12px]
                  font-[700]
                  uppercase
                  leading-[18px]
                  text-white
                  md:text-[#111827]
                "
              >
                Platform
              </h3>

              <ul className="mt-[12px] space-y-[8px]">
                {platformLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="
                        text-[14px]
                        font-[400]
                        leading-[21px]
                        text-[#657894]
                        transition-colors
                        duration-150
                        hover:text-[#4f46e5]
                        md:text-[#657894]
                      "
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* =====================================
                COMPANY
            ====================================== */}

            <div>
              <h3
                className="
                  text-[12px]
                  font-[700]
                  uppercase
                  leading-[18px]
                  text-white
                  md:text-[#111827]
                "
              >
                Company
              </h3>

              <ul className="mt-[12px] space-y-[8px]">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="
                        text-[14px]
                        font-[400]
                        leading-[21px]
                        text-[#657894]
                        transition-colors
                        duration-150
                        hover:text-[#4f46e5]
                        md:text-[#657894]
                      "
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          BOTTOM BAR
      ========================================== */}

      <div
        className="
          border-t
          border-[#1f2a40]
          md:border-[#dce4ed]
        "
      >
        <div
          className="
            mx-auto
            flex
            w-full
            max-w-[1440px]
            flex-col
            px-[24px]
            py-[25px]
            md:flex-row
            md:items-center
            md:justify-between
            md:px-[80px]
            md:py-[20px]
          "
        >
          {/* Copyright */}

          <p
            className="
              text-[13px]
              font-[400]
              leading-[20px]
              text-[#596981]
              md:text-[#8da1bd]
            "
          >
            © 2026 ResumeAI. All rights reserved.
          </p>

          {/* Legal */}

          <div
            className="
              mt-[24px]
              flex
              items-center
              gap-[17px]
              md:mt-0
              md:gap-[24px]
            "
          >
            <a
              href="#privacy"
              className="
                text-[13px]
                font-[400]
                leading-[20px]
                text-[#596981]
                transition-colors
                hover:text-[#4f46e5]
                md:text-[#657894]
              "
            >
              Privacy Policy
            </a>

            <span
              className="
                h-[3px]
                w-[3px]
                rounded-full
                bg-[#526079]
                md:bg-[#c8d1dd]
              "
            />

            <a
              href="#terms"
              className="
                text-[13px]
                font-[400]
                leading-[20px]
                text-[#596981]
                transition-colors
                hover:text-[#4f46e5]
                md:text-[#657894]
              "
            >
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
