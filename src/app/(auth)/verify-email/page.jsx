"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Clock3,
  FileCheck2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VerifyEmailPage() {
  // Start with all OTP fields empty
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [seconds, setSeconds] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  /* ------------------------------------------------------------
     RESEND COUNTDOWN
  ------------------------------------------------------------ */

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  /* ------------------------------------------------------------
     OTP CHANGE
  ------------------------------------------------------------ */

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "").slice(-1);

    const updatedOtp = [...otp];
    updatedOtp[index] = numericValue;

    setOtp(updatedOtp);

    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ------------------------------------------------------------
     BACKSPACE
  ------------------------------------------------------------ */

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ------------------------------------------------------------
     PASTE OTP
  ------------------------------------------------------------ */

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const updatedOtp = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    const nextIndex = Math.min(pastedValue.length, 5);

    inputRefs.current[nextIndex]?.focus();
  };

  /* ------------------------------------------------------------
     RESEND OTP
  ------------------------------------------------------------ */

  const handleResend = () => {
    if (seconds > 0 || isResending) return;

    setIsResending(true);

    setTimeout(() => {
      // Clear all OTP fields after resend
      setOtp(["", "", "", "", "", ""]);

      setSeconds(30);
      setIsResending(false);

      inputRefs.current[0]?.focus();
    }, 500);
  };

  /* ------------------------------------------------------------
     VERIFY
  ------------------------------------------------------------ */

  const handleVerify = (event) => {
    event.preventDefault();

    const verificationCode = otp.join("");

    console.log("Verification code:", verificationCode);

    // Add your API verification logic here.
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-6 py-8 sm:px-8 md:flex md:items-center md:justify-center md:py-10">
      {/* VERIFICATION CARD */}

      <div className="w-full max-w-[440px] md:rounded-[20px] md:border md:border-[#DCE3EE] md:bg-white md:px-10 md:py-12 md:shadow-[0_10px_35px_rgba(30,64,175,0.07)]">
        {/* LOGO */}

        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="ResumeAI Logo"
            width={0}
            height={0}
            sizes="100vw"
            className="w-36"
          />
        </div>

        {/* EMAIL ICON */}

        <div className="mt-8 flex justify-center sm:mt-9">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#C7D2FE] bg-[#EEF2FF]">
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#5B3FE8] text-white shadow-[0_4px_10px_rgba(79,70,229,0.2)]">
              <Mail size={24} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* TITLE */}

        <div className="mt-6 text-center">
          <h1 className="text-[25px] font-bold leading-[1.15] tracking-[-0.6px] text-[#111827] sm:text-[27px]">
            Verify your email
          </h1>

          <p className="mt-2 text-[14px] leading-[21px] text-[#64748B]">
            We've sent a 6-digit verification code to
          </p>

          {/* EMAIL BADGE */}

          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3.5 py-1 text-[13px] font-semibold text-[#5146E5]">
            <Mail size={13} strokeWidth={1.8} />

            <span>pawan@example.com</span>
          </div>
        </div>

        {/* DIVIDER */}

        <div className="mt-7 h-px w-full bg-[#EEF2F7] sm:mt-7" />

        {/* FORM */}

        <form onSubmit={handleVerify} className="mt-6">
          {/* OTP LABEL */}

          <label className="block text-[13px] font-semibold text-[#172033]">
            Enter verification code
          </label>

          {/* OTP INPUTS */}

          <div className="mt-3 grid grid-cols-6 gap-2 sm:gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                aria-label={`Verification digit ${index + 1}`}
                placeholder="—"
                className="
    h-[48px]
    w-full
    rounded-[9px]
   border-[1.5px]
    border-[#DCE3EE]
    bg-[#F8FAFC]
    text-center
    text-[24px]
    font-semibold
    text-[#172033]
    caret-[#4F46E5]
    outline-none
    transition-all

    placeholder:text-[#CBD5E1]

    focus:border-2
    focus:border-[#4F46E5]
    focus:bg-[#EEF2FF]
    focus:ring-0
    focus:placeholder:text-transparent

    sm:h-[56px]
  "
              />
            ))}
          </div>

          {/* RESEND */}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-center text-[13px]">
            <span className="text-[#64748B]">Didn't receive the code?</span>

            <button
              type="button"
              onClick={handleResend}
              disabled={seconds > 0 || isResending}
              className={`font-medium transition-colors ${
                seconds > 0 || isResending
                  ? "cursor-not-allowed text-[#B8C4D6]"
                  : "text-[#4F46E5] hover:text-[#4338CA]"
              }`}
            >
              Resend OTP
            </button>

            {/* COUNTDOWN */}

            <span className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-[#F1F5F9] px-2.5 py-1 text-[11px] font-medium text-[#94A3B8]">
              <Clock3 size={12} strokeWidth={1.8} />

              {seconds > 0
                ? `Resend in ${seconds}s`
                : isResending
                  ? "Sending..."
                  : "Resend now"}
            </span>
          </div>

          {/* VERIFY BUTTON */}

          <button
            type="submit"
            className="mt-8 flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#39309B] to-[#5146E5] text-[15px] font-semibold text-white shadow-[0_7px_18px_rgba(79,70,229,0.25)] transition-all hover:from-[#31288D] hover:to-[#473BD7] active:scale-[0.99] sm:mt-7"
          >
            <span>Verify Email</span>

            <ArrowRight size={19} strokeWidth={2} />
          </button>

          {/* BACK TO REGISTRATION */}

          <div className="mt-4 text-center text-[13px]">
            <span className="text-[#94A3B8]">Wrong email? </span>

            <Link
              href="/register"
              className="font-semibold text-[#4F46E5] transition-colors hover:text-[#4338CA]"
            >
              Back to Registration
            </Link>
          </div>
        </form>

        {/* BOTTOM DIVIDER */}

        <div className="mt-6 h-px w-full bg-[#EEF2F7]" />

        {/* SECURITY MESSAGE */}

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-[12px] leading-[18px] text-[#94A3B8]">
          <ShieldCheck
            size={14}
            strokeWidth={1.7}
            className="shrink-0 text-[#94A3B8]"
          />

          <span>Your email helps us keep your ResumeAI account secure.</span>
        </div>
      </div>
    </main>
  );
}
