"use client";

import { useState } from "react";
import Link from "next/link";
import { FileCheck2, Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How It Works",
    href: "#how-it-works",
  },
  {
    label: "For Students",
    href: "#students",
  },
  {
    label: "For Recruiters",
    href: "#recruiters",
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white">
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-20">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-[10px]"
          onClick={closeMobileMenu}
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

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-[36px]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-[#475569] transition-colors duration-200 hover:text-[#4F46E5]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-[32px] lg:flex">
          <Link
            href="/login"
            className="text-[15px] font-medium text-[#475569] transition-colors duration-200 hover:text-[#4F46E5]"
          >
            Log In
          </Link>

          <Link
            href="/register"
            className="flex h-[38px] items-center justify-center rounded-[9px] bg-[#4F46E5] px-[22px] text-[14px] font-semibold text-white shadow-[0_2px_6px_rgba(79,70,229,0.25)] transition-all duration-200 hover:bg-[#4338CA]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="ml-auto flex items-center gap-[10px] lg:hidden">
          <Link
            href="/register"
            className="flex h-[34px] min-w-[109px] items-center justify-center rounded-[8px] bg-[#4F46E5] px-4 text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(79,70,229,0.2)] transition-colors duration-200 hover:bg-[#4338CA]"
          >
            Get Started
          </Link>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative z-[70] flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] transition-colors duration-200 hover:bg-[#EEF2FF] hover:text-[#4F46E5]"
          >
            {mobileMenuOpen ? (
              <X size={18} strokeWidth={2} />
            ) : (
              <Menu size={18} strokeWidth={2} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-[50] bg-[#0F172A]/30 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Side Menu */}
      <aside
        className={`fixed right-0 top-0 z-[60] h-screen w-[min(320px,85vw)] border-l border-[#E2E8F0] bg-white shadow-[-8px_0_30px_rgba(15,23,42,0.10)] transition-transform duration-300 ease-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Drawer Header */}
        <div className="flex h-[72px] items-center justify-between border-b border-[#E2E8F0] px-5">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-[10px]"
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
        </div>

        {/* Drawer Navigation */}
        <div className="px-5 py-5">
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="border-b border-[#F1F5F9] py-4 text-[15px] font-medium text-[#475569] transition-colors duration-200 hover:text-[#4F46E5]"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="py-4 text-[15px] font-medium text-[#475569] transition-colors duration-200 hover:text-[#4F46E5]"
            >
              Log In
            </Link>

            {/* Mobile CTA */}
            <Link
              href="/register"
              onClick={closeMobileMenu}
              className="mt-5 flex h-[42px] items-center justify-center rounded-[9px] bg-[#4F46E5] text-[14px] font-semibold text-white shadow-[0_2px_6px_rgba(79,70,229,0.25)] transition-colors duration-200 hover:bg-[#4338CA]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
