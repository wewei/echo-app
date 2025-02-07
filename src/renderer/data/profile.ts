import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import type { Profile } from "../../shared/types/profile";

const profiles = new Map<string, Profile>();

export const useProfile = (
  profileId: string
): [Profile | null, (updater: (prev: Profile) => Profile) => void] => {
  const [profile, setProfile] = useState<Profile | null>(profiles.get(profileId));
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await window.electron.profile.get(profileId);
      profiles.set(profileId, profile);
      setProfile(profile);
    };
    if (!profile) {
      loadProfile();
    }
  }, [profileId]);

  return [
    profile,
    (updater: (prev: Profile) => Profile) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const newProfile = updater(prev);
        profiles.set(profileId, newProfile);
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

export const useCurrentProfile = (): Profile | null => {
  const profileId = useParams().profileId;
  const [profile] = useProfile(profileId);
  return profile;
};
