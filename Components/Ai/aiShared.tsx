"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { API, adminKey } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useLocale from "@/Components/Hooks/useLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ta } from "@/Components/Admin/i18n/adminText";
import { usePathname } from "@/Components/i18n/navigation";

// AI in every panel (2026-10, backend Routers/panelAiRouter.ts): which
// profile's assistant a page belongs to, what the server allows it (plan,
// provider, limits, the tools open to this user), and the texts the
// backend sends as {k: content key, fa: Persian} - the panels show the
// key's translation, the super admin panel the Persian through ta().

export type AiProfile = "doctor" | "clinic" | "hospital" | "pharmacy" | "paraClinic" | "insurance" | "user" | "admin";

const PANEL_TO_PROFILE: Record<string, AiProfile> = {
  doctorpanel: "doctor",
  clinicpanel: "clinic",
  hospitalpanel: "hospital",
  pharmacypanel: "pharmacy",
  paraClinicPanel: "paraClinic",
  insurancepanel: "insurance",
  dashboard: "user",
  [adminKey]: "admin",
};

// the profile of the current page (none on the secretary's own home: she
// works inside the org panels she was given)
export const useAiProfile = (): AiProfile | null => {
  const segment = (usePathname() || "").split("/").filter(Boolean)[0] || "";
  return PANEL_TO_PROFILE[segment] || null;
};

export const aiBase = (profile: AiProfile) => `${API}/ai/${profile}`;

export type AiStatus = {
  panel: AiProfile;
  inPlan: boolean;
  configured: boolean;
  stt: boolean;
  owner: boolean;
  limit: number;
  used: number;
  pro?: boolean;
  planModule?: string;
  acl?: Record<string, boolean>;
  tools?: { name: string; kind: string }[];
};

export const useAiStatus = (profile: AiProfile | null) => {
  const { data, error, mutate } = useSWR<AiStatus>(
    profile ? `${aiBase(profile)}/status` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { revalidateOnFocus: false, shouldRetryOnError: false, dedupingInterval: 60_000 },
  );
  const ok = !!data && data.inPlan && data.configured;
  return { status: data, error, mutate, ok, hasTool: (name: string) => !!data?.tools?.some((t) => t.name === name) };
};

export type Txt = { k: string; fa: string; p?: string[] };

// a text of the AI layer: a content key in the panels, Persian in the admin
export const useAiText = (profile?: AiProfile | null) => {
  const getContent = useLocale();
  return useCallback(
    (t: Txt | string | undefined | null, vars?: string[]): string => {
      if (!t) return "";
      if (typeof t === "string") {
        if (profile === "admin") return ta(t, vars);
        const v = getContent(t as ContentKey, vars);
        return v;
      }
      const p = vars || t.p;
      if (profile === "admin") return ta(t.fa, p);
      const v = getContent(t.k as ContentKey, p);
      if (v !== t.k) return v;
      // a key not merged yet: the Persian source
      let s = t.fa;
      (p || []).forEach((x, i) => (s = s.split(`\${${i + 1}}`).join(x)));
      return s;
    },
    [getContent, profile],
  );
};

// a UI text with its Persian source (the admin panel and keys not merged yet)
export const T = (k: string, fa: string): Txt => ({ k, fa });

export const AI_SETTINGS_PATH = `/${adminKey}/appConfig?tab=ai`;
