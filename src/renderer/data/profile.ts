import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import type { Profile } from "@/shared/types/profile";
import { EntityRendererState, ENTITY_PENDING, ENTITY_NOT_EXIST } from "./entity";
import { makeEventHub } from "@/shared/utils/event";

// Route /profileId
const updateProfileEventHub = makeEventHub<Profile>()

const useProfile = (profileId: string) => {
  const [profile, setProfile] = useState<EntityRendererState<Profile>>(ENTITY_PENDING);
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await window.electron.profile.get(profileId);
      setProfile(profile ?? ENTITY_NOT_EXIST);
    }
    loadProfile();
    const unwatch = updateProfileEventHub.watch([profileId], setProfile);
    return () => { unwatch() };
  }, [profileId]);
  return profile;
}

const updateProfile = (profileId: string, profile: Profile) => {
  updateProfileEventHub.notify([profileId], profile);
  return window.electron.profile.update(profileId, profile);
}

export { useProfile, updateProfile }

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

export const useCurrentProfile = (): EntityRendererState<Profile> => {
  const profileId = useCurrentProfileId();
  const profile = useProfile(profileId);
  return profile;
};
