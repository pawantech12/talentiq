"use client";

import Link from "next/link";
import {
  UsersRound,
  GraduationCap,
  BriefcaseBusiness,
  Check,
  ArrowRight,
} from "lucide-react";

export default function WhoIsItForSection() {
  const studentFeatures = [
    "Resume AI Analysis",
    "Job Match Score",
    "Skill Assessment",
    "Application Tracking",
    "AI Mock Interview",
    "Personalized Feedback",
  ];

  const recruiterFeatures = [
    "Job Posting",
    "AI Resume Screening",
    "Candidate Scores",
    "Candidate Ranking",
    "Applicant Review",
    "Shortlisting",
  ];

  return (
    <section id="students" className="w-full bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-[48px] flex flex-col gap-14 max-sm:gap-8  lg:px-20 lg:py-[96px]">
        {/* Section Header */}
        <div className="flex flex-col gap-3 sm:gap-6 mx-auto text-center ">
          <div className="inline-flex w-fit mx-auto items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-[14px] py-[6px] text-xs font-semibold text-[#4F46E5]">
            <UsersRound className="h-[11px] w-[11px]" strokeWidth={2.3} />
            Built for Everyone
          </div>

          <h2 className="mx-auto max-w-[1000px] text-[28px] font-extrabold leading-[32px] tracking-[-1.2px] text-[#0F172A] sm:text-[38px]  lg:text-[44px] lg:tracking-[-1.8px]">
            Who Is ResumeAI For?
          </h2>
        </div>

        {/* Audience Cards */}
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-4  lg:grid-cols-2 lg:gap-6">
          {/* ================= STUDENTS ================= */}
          <article
            id="students"
            className="flex flex-col rounded-3xl gap-9 max-sm:gap-5 border border-[#DDD6FE] bg-[#F5F3FF] sm:p-[52px] p-6"
          >
            <div className="flex flex-col gap-5">
              {/* Badge */}
              <div>
                <span className="inline-flex  items-center gap-2 rounded-full border border-[#C4B5FD] bg-[#EDE9FE] px-4 py-[7px] max-sm:px-3 max-sm:py-[5px] text-xs font-bold text-[#7C3AED]">
                  <GraduationCap
                    className="h-[13px] w-[13px]"
                    strokeWidth={2}
                  />

                  <span>For Students</span>
                </span>
              </div>

              {/* Heading */}
              <h3 className=" text-2xl font-extrabold leading-[28.8px] tracking-[-1px] text-[#0F172A] sm:text-[34px] lg:leading-[46px]  lg:text-4xl lg:tracking-[-1.4px]">
                Build Confidence.
                <br />
                <span className="text-[#7C3AED]">Improve Your Skills.</span>
              </h3>

              {/* Description */}
              <p className=" max-w-[570px] text-[13px] leading-[1.6] text-[#475569] sm:text-base ">
                Understand how your resume matches a job, identify skill gaps,
                assess your knowledge and prepare for interviews.
              </p>
            </div>
            {/* Features */}
            <ul className="flex flex-col gap-3 max-sm:gap-[10px]">
              {studentFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-[#7C3AED]">
                    <Check
                      className="h-[12px] w-[12px] text-white"
                      strokeWidth={3}
                    />
                  </span>

                  <span className="text-[15px] max-sm:text-[13px] font-medium text-[#0F172A]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-auto">
              <Link
                href="/register?role=student"
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[8px] bg-gradient-to-r from-[#7C3AED] to-[#5B4FE8] px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(99,60,235,0.18)] transition-all duration-200 hover:from-[#6938EF] hover:to-[#4F46E5]"
              >
                <span>Explore Student Features</span>

                <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2} />
              </Link>
            </div>
          </article>

          {/* ================= RECRUITERS ================= */}
          <article
            id="recruiters"
            className="flex flex-col rounded-3xl gap-9 max-sm:gap-5 border border-[#C7D2FE] bg-[#EEF2FF] p-6 sm:p-[52px]"
          >
            <div className="flex flex-col gap-5">
              {/* Badge */}
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#AFC0FF] bg-white px-4 py-[7px] max-sm:px-3 max-sm:py-[5px] text-xs font-bold text-[#4F46E5]">
                  <BriefcaseBusiness
                    className="h-[13px] w-[13px]"
                    strokeWidth={2}
                  />

                  <span>For Recruiters</span>
                </span>
              </div>

              {/* Heading */}
              <h3 className="text-2xl font-extrabold leading-[28.8px] tracking-[-1px] text-[#0F172A] sm:text-[34px] lg:leading-[46px]  lg:text-4xl lg:tracking-[-1.4px]">
                Find Better Candidates.
                <br />
                <span className="text-[#4F46E5]">Faster.</span>
              </h3>

              {/* Description */}
              <p className="max-w-[570px] text-[13px] leading-[1.6] text-[#475569] sm:text-base ">
                Post jobs, analyze applications, compare candidates and identify
                the most relevant applicants using AI-assisted screening.
              </p>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-3 max-sm:gap-[10px]">
              {recruiterFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-[#4F46E5]">
                    <Check
                      className="h-[12px] w-[12px] text-white"
                      strokeWidth={3}
                    />
                  </span>

                  <span className="text-[14px] font-medium text-[#172035] sm:text-[15px]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-auto">
              <Link
                href="/register?role=recruiter"
                className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[8px] bg-gradient-to-r from-[#3730A3] to-[#4F46E5] px-5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(55,48,163,0.18)] transition-all duration-200 hover:from-[#312E81] hover:to-[#4338CA]"
              >
                <span>Explore Recruiter Features</span>

                <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2} />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
