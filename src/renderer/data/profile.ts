import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import type { Profile } from "@/shared/types/profile";
import { mutableCachedEntity } from "./cachedEntity";

const [useProfile] = mutableCachedEntity(window.electron.profile.get, (updater: (cur: Profile) => Profile, cur: Profile) => {
  const newProfile = updater(cur)
  window.electron.profile.update(newProfile.id, newProfile)
  return newProfile
})

export { useProfile }

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

export const useCurrentProfileId = (): string | null => useParams().profileId ?? null;

export const useCurrentProfile = (): Profile | null => {
  const profileId = useCurrentProfileId();
  const [profile] = useProfile(profileId);
  return profile;
};
