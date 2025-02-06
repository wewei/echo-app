import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Profile } from "../../shared/types/profile";

export const useProfile = (
  profileId: string
): [Profile | null, (updater: (prev: Profile) => Profile) => void] => {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await window.electron.profile.get(profileId);
      setProfile(profile);
    };
    loadProfile();
  }, [profileId]);

  return [
    profile,
    (updater: (prev: Profile) => Profile) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const newProfile = updater(prev);
        window.electron.profile.update(profileId, newProfile);
        return newProfile;
      });
    },
  ];
};

export const useProfiles = (): [
  Profile[],
  () => Promise<Profile>,
  (profileId: string) => Promise<void>
] => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const loadProfiles = async () => {
      const profiles = await window.electron.profile.getAll();
      setProfiles(profiles);
    };
    loadProfiles();
  }, []);
  return [
    profiles,
    async () => {
      const newProfile = await window.electron.profile.create(
        t("profile.defaultName"),
        ""
      );
      setProfiles([...profiles, newProfile]);
      return newProfile;
    },
    async (profileId: string) => {
      await window.electron.profile.delete(profileId);
      setProfiles(profiles.filter((p) => p.id !== profileId));
    },
  ];
};