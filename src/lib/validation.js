import { normalizeEmail } from "@/lib/security";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function cleanSkills(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 30);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 30);
  }

  return [];
}

export function validateRegistration(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      error: "Invalid registration details.",
      field: null,
    };
  }

  const fullName = cleanString(body.fullName, 100);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const role =
    typeof body.role === "string" ? body.role.toLowerCase().trim() : "";

  if (fullName.length < 2) {
    return {
      error: "Enter your full name (at least 2 characters).",
      field: "fullName",
    };
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return {
      error: "Enter a valid email address.",
      field: "email",
    };
  }

  if (password.length < 8 || password.length > 72) {
    return {
      error: "Password must be between 8 and 72 characters.",
      field: "password",
    };
  }

  if (!["student", "recruiter"].includes(role)) {
    return {
      error: "Choose a valid account type.",
      field: "role",
    };
  }

  let profile = {};

  if (role === "student") {
    const education = cleanString(body.education, 200);
    const skills = cleanSkills(body.skills ?? body.primarySkills);

    if (!education) {
      return {
        error: "Enter your education details.",
        field: "education",
      };
    }

    if (skills.length === 0) {
      return {
        error: "Enter at least one primary skill.",
        field: "skills",
      };
    }

    profile = {
      student: {
        education: [
          {
            degree: education,
            university: "",
            period: "",
          },
        ],
        skills,
        phone: "",
        location: "",
        dob: "",
        role: "",
        currentRole: "",
        careerGoal: "",
        preferredLocation: "",
        experienceLevel: "Fresher",
        expectedRole: "",
        experiences: [],
        projects: [],
        portfolioLinks: [],
        resume: null,
      },
    };
  }

  if (role === "recruiter") {
    const companyName = cleanString(body.companyName, 150);
    const recruiterName = cleanString(body.recruiterName || fullName, 100);

    if (!companyName) {
      return {
        error: "Enter your company name.",
        field: "companyName",
      };
    }

    if (recruiterName.length < 2) {
      return {
        error: "Enter the recruiter name.",
        field: "recruiterName",
      };
    }

    profile = {
      recruiter: {
        recruiterName,
        companyName,
        phone: cleanString(body.phone, 30),
        location: cleanString(body.location, 150),
        jobTitle: cleanString(body.jobTitle, 100),
        department: cleanString(body.department, 100),
        experience: cleanString(body.experience, 50),
      },
    };
  }

  return {
    data: {
      fullName,
      email,
      password,
      role,
      profile,
    },
    error: null,
    field: null,
  };
}
