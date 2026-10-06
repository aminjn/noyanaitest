"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminManageUserPage.module.css";

// A user's «پرو» membership on the admin user page (2026-10): status, end,
// today's AI messages, every period, and the support actions - a free
// period (grant) and ending the running one (cancel, no money moves; a
// refund is a wallet adjustment with its own reason).

type Period = {
  _id: string;
  days: number;
  startedAt: string;
  expiresAt: string;
  state: "active" | "scheduled" | "expired" | "cancelled";
  daysLeft: number | null;
  paid: number;
  granted: boolean;
};

type UserPro = {
  active: boolean;
  until: string | null;
  current: Period | null;
  history: Period[];
  ai: { pro: boolean; limit: number; used: number };
};

const stateLabels: Record<string, string> = {
  get active() {
    return ta("فعال");
  },
  get scheduled() {
    return ta("تمدید (شروع بعد از دوره‌ی فعلی)");
  },
  get expired() {
    return ta("منقضی");
  },
  get cancelled() {
    return ta("لغوشده");
  },
};

const GrantPopup = ({ userId, onDone }: { userId: string; onDone: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("اعطای اشتراک پرو")}>
      <CreateForm<{ days: number; note: string }>
        defaultValue={{ days: 30, note: "" }}
        renderer={{
          days: { type: "number", title: ta("مدت (روز)"), required: true },
          note: { type: "area", title: ta("دلیل"), required: true },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          method: "POST",
          path: `${API}/admin/pro/user/${userId}/grant`,
          successCb: () => {
            onDone();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const CancelPopup = ({ periodId, onDone }: { periodId: string; onDone: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("لغو دوره‌ی اشتراک پرو")}>
      <p className={classes.note}>
        {ta("مزایا همین حالا قطع می‌شود و پولی جابه‌جا نمی‌شود. اگر بازپرداخت لازم است، کیف پول را با دلیل اصلاح کنید.")}
      </p>
      <CreateForm<{ reason: string }>
        defaultValue={{ reason: "" }}
        renderer={{ reason: { type: "area", title: ta("دلیل"), required: true } }}
        onCancel={() => closePopup()}
        hookProps={{
          method: "POST",
          path: `${API}/admin/pro/subscription/${periodId}/cancel`,
          successCb: () => {
            onDone();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const UserProCard = ({ userId, canManage }: { userId: string; canManage: boolean }) => {
  const { setPopup } = usePopup();
  const { data, mutate } = useSWR<UserPro>(userId ? `${API}/admin/pro/user/${userId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res?.data),
  );
  if (!data) return null;
  const num = new Intl.NumberFormat(adminIntlTag());
  const date = new Intl.DateTimeFormat(adminIntlTag(), { timeZone: TEHRAN_TZ, dateStyle: "medium" });
  const fmt = (v?: string | null) => (v && !isNaN(new Date(v).getTime()) ? date.format(new Date(v)) : "—");
  const history = Array.isArray(data.history) ? data.history : [];
  const running = history.find((p) => p.state === "active") || null;

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <h2 className={classes.cardTitle}>{ta("اشتراک پرو")}</h2>
        {canManage && (
          <div className={classes.headLinks}>
            <button
              type="button"
              className={classes.link}
              onClick={() => setPopup("GrantPro", <GrantPopup userId={userId} onDone={() => mutate()} />)}
            >
              {ta("اعطای اشتراک")}
            </button>
            {running && (
              <button
                type="button"
                className={classes.link}
                onClick={() =>
                  setPopup("CancelPro", <CancelPopup periodId={running._id} onDone={() => mutate()} />)
                }
              >
                {ta("لغو دوره‌ی فعلی")}
              </button>
            )}
          </div>
        )}
      </div>
      <p className={classes.note}>
        {data.active
          ? ta("عضو پرو تا ${1}", [fmt(data.until)])
          : ta("این کاربر عضو پرو نیست.")}
        {" · "}
        {data.ai?.limit
          ? ta("پیام امروز دستیار هوشمند: ${1} از ${2}", [num.format(data.ai.used || 0), num.format(data.ai.limit)])
          : ta("پیام امروز دستیار هوشمند: ${1} (بدون محدودیت)", [num.format(data.ai?.used || 0)])}
      </p>
      {history.length > 0 && (
        <ul className={classes.profiles}>
          {history.map((p) => (
            <li key={p._id} className={classes.profile}>
              <span className={classes.profileType}>{stateLabels[p.state] || p.state}</span>
              <span className={classes.profileName}>
                {`${fmt(p.startedAt)} – ${fmt(p.expiresAt)} · ${
                  p.granted ? ta("اعطایی پشتیبانی") : `${currencize(p.paid || 0)} ${ta("تومان")}`
                }`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default UserProCard;
