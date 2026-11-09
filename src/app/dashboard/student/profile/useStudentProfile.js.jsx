"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";

const emptyProfile = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  dob: "",
  role: "",
  currentRole: "",
  careerGoal: "",
  preferredLocation: "",
  experienceLevel: "Fresher",
  expectedRole: "",
  skills: [],
  education: [],
  experiences: [],
  projects: [],
  portfolioLinks: [],
  resume: null,
};

export function useStudentProfile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/profile");

      setProfile({
        ...emptyProfile,
        ...data.profile,

        skills: data.profile.skills || [],

        education: (data.profile.education || []).map((item) => ({
          ...item,
          _id: item._id || crypto.randomUUID(),
        })),

        experiences: (data.profile.experiences || []).map((item) => ({
          ...item,
          _id: item._id || crypto.randomUUID(),
        })),

        projects: (data.profile.projects || []).map((item) => ({
          ...item,
          _id: item._id || crypto.randomUUID(),
        })),

        portfolioLinks: (data.profile.portfolioLinks || []).map((item) => ({
          ...item,
          _id: item._id || crypto.randomUUID(),
        })),
      });

      return data.profile;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

  const updateProfile = useCallback(async (changes) => {
    setSaving(true);
    setError("");

    try {
      const { data } = await api.patch("/profile", changes);

      setProfile((previous) => ({
        ...previous,
        ...data.profile,
      }));

      return data.profile;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to update profile";

      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const saveProject = useCallback(
    async (project) => {
      const current = profile.projects || [];

      const next = project._id
        ? current.map((item) =>
            String(item._id) === String(project._id) ? project : item,
          )
        : [...current, { ...project, _id: crypto.randomUUID() }];

      return updateProfile({ projects: next });
    },
    [profile.projects, updateProfile],
  );

  const deleteProject = useCallback(
    async (projectId) => {
      const next = (profile.projects || []).filter(
        (item) => String(item._id) !== String(projectId),
      );

      return updateProfile({ projects: next });
    },
    [profile.projects, updateProfile],
  );

  const savePortfolioLink = useCallback(
    async (link) => {
      const current = profile.portfolioLinks || [];

      const next = link._id
        ? current.map((item) =>
            String(item._id) === String(link._id) ? link : item,
          )
        : [...current, { ...link, _id: crypto.randomUUID() }];

      return updateProfile({ portfolioLinks: next });
    },
    [profile.portfolioLinks, updateProfile],
  );

  const deletePortfolioLink = useCallback(
    async (linkId) => {
      const next = (profile.portfolioLinks || []).filter(
        (item) => String(item._id) !== String(linkId),
      );

      return updateProfile({ portfolioLinks: next });
    },
    [profile.portfolioLinks, updateProfile],
  );

  // Save Experience
  const saveExperience = useCallback(
    async (experience) => {
      const current = profile.experiences || [];

      const next = experience._id
        ? current.map((item) =>
            String(item._id) === String(experience._id) ? experience : item,
          )
        : [
            ...current,
            {
              ...experience,
              _id: crypto.randomUUID(),
            },
          ];

      return updateProfile({ experiences: next });
    },
    [profile.experiences, updateProfile],
  );

  // Delete Experience
  const deleteExperience = useCallback(
    async (experienceId) => {
      const next = (profile.experiences || []).filter(
        (item) => String(item._id) !== String(experienceId),
      );

      return updateProfile({ experiences: next });
    },
    [profile.experiences, updateProfile],
  );

  // Save Education
  const saveEducation = useCallback(
    async (educationItem) => {
      const current = profile.education || [];

      const next = educationItem._id
        ? current.map((item) =>
            String(item._id) === String(educationItem._id)
              ? educationItem
              : item,
          )
        : [
            ...current,
            {
              ...educationItem,
              _id: crypto.randomUUID(),
            },
          ];

      return updateProfile({ education: next });
    },
    [profile.education, updateProfile],
  );

  // Delete Education
  const deleteEducation = useCallback(
    async (educationId) => {
      const next = (profile.education || []).filter(
        (item) => String(item._id) !== String(educationId),
      );

      return updateProfile({ education: next });
    },
    [profile.education, updateProfile],
  );

  return {
    profile,
    setProfile,
    loading,
    saving,
    error,
    loadProfile,
    updateProfile,
    saveProject,
    deleteProject,
    savePortfolioLink,
    deletePortfolioLink,
    saveExperience,
    deleteExperience,

    saveEducation,
    deleteEducation,
  };
}
