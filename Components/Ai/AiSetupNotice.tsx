"use client";

import Link from "@/Components/i18n/Link";
import useUser from "@/Components/Hooks/useUser";
import { AI_SETTINGS_PATH, AiProfile, AiStatus, copilotFeatureOf, T, useAiText } from "./aiShared";
import AiLocked, { gateOfState } from "./AiLocked";
import classes from "./Ai.module.css";

const LICENSE_PATH: Partial<Record<AiProfile, string>> = {
  doctor: "/doctorpanel/license",
  clinic: "/clinicpanel/license",
  hospital: "/hospitalpanel/license",
  pharmacy: "/pharmacypanel/license",
  paraClinic: "/paraClinicPanel/license",
  insurance: "/insurancepanel/license",
  user: "/dashboard/pro",
};

// Why an AI button is not there: the server has no AI set up (the super
// admin turns it on in System settings -> AI), or the plan does not include
// it. Nothing when it works.
const AiSetupNotice = ({ profile, status }: { profile: AiProfile; status?: AiStatus }) => {
  const t = useAiText(profile);
  const { user } = useUser();
  if (!status) return null;
  if (!status.configured) {
    const staff = user?.role === "admin" || user?.role === "notadmin";
    return (
      <p className={classes.notice} role="note">
        <span>{t(T("aiNotConfigured", "دستیار هوش مصنوعی روی این سرور هنوز تنظیم نشده است."))}</span>
        {staff ? (
          // the admin panel has no language prefix
          <a href={AI_SETTINGS_PATH}>{t(T("aiOpenSettings", "تنظیمات سیستم ← هوش مصنوعی"))}</a>
        ) : (
          <span>{t(T("aiAskAdmin", "مدیر سایت می‌تواند آن را در «تنظیمات سیستم ← هوش مصنوعی» روشن کند."))}</span>
        )}
      </p>
    );
  }
  // the copilot's own feature: locked by plan, quota used up, or off
  const own = status.features?.[copilotFeatureOf(profile)];
  const gate = gateOfState(own);
  if (gate) return <AiLocked profile={profile} gate={{ ...gate, upgrade: gate.upgrade ?? LICENSE_PATH[profile] ?? null }} />;
  if (!status.inPlan)
    return (
      <p className={classes.notice} role="note">
        <span>{t(T("aiNotInPlan", "دستیار هوش مصنوعی در پلن فعلی شما نیست."))}</span>
        {LICENSE_PATH[profile] && <Link href={LICENSE_PATH[profile]!}>{t(T("aiUpgrade", "ارتقای پلن"))}</Link>}
      </p>
    );
  return null;
};

export default AiSetupNotice;
