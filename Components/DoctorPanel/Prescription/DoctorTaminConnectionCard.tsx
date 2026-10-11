"use client";

import { useState } from "react";
import useSWR from "swr";
import classes from "./DoctorTaminConnectionCard.module.css";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import Button from "@/Components/UI/Button";
import Input from "@/Components/UI/Input";
import SelectInput from "@/Components/UI/SelectInput";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelTaminSettings"];

type TaminIdentity = Partial<{
  docId: string;
  docNationalCode: string;
  docMobileNo: string;
}>;

type TaminSettings = {
  environment: "production" | "test";
  configured?: boolean;
  token: {
    state: "missing" | "expired" | "refreshable" | "valid";
    tokenRefreshedAt?: string;
    tokenExpiresAt?: string;
  };
  identity: {
    effective: TaminIdentity;
    fromProfile: TaminIdentity;
    overrides: TaminIdentity;
  };
  workplace: { siamId: string; name?: string } | null;
  signoutUrl?: string;
};

type TaminClinic = { siamId: string; name: string; provinceName?: string };

const OWN_OFFICE = "__office";

const IDENTITY_FIELDS = [
  ["docId", "taminDocId"],
  ["docNationalCode", "taminDocNationalCode"],
  ["docMobileNo", "taminDocMobile"],
] as const;

// Tamin e-prescription connection of the doctor panel (backend
// Lib/taminEp.ts): login state, the identity Tamin checks every
// prescription against, and the workplace used for eligibility checks.
// Login goes through the authorize URL the backend builds (environment,
// client id, registered redirect address, PKCE + state).
const DoctorTaminConnectionCard = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const pushNotification = useNotification();
  const { data, mutate } = useSWR<TaminSettings>(
    `${API}/doctor/tamin/settings`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [busy, setBusy] = useState<string | null>(null);
  const [identity, setIdentity] = useState<TaminIdentity>({});
  const [clinics, setClinics] = useState<TaminClinic[] | null>(null);
  const [workplace, setWorkplace] = useState<string | null>(null);

  const fail = (err: unknown) => {
    if (err instanceof FetchError) pushNotification(err.message, "Error");
  };

  const login = () => {
    setBusy("login");
    fetcher<{ data?: { authorizeUrl?: string } }>({
      url: `${API}/doctor/tamin`,
    })
      .then((res) => {
        const url = res?.data?.authorizeUrl;
        if (!url) throw new Error("no authorize url");
        window.location.href = url;
      })
      .catch((err) => {
        setBusy(null);
        fail(err);
      });
  };

  const loadClinics = () => {
    setBusy("clinics");
    fetcher<{ data?: TaminClinic[] }>({ url: `${API}/doctor/tamin/clinics` })
      .then((res) => setClinics(Array.isArray(res?.data) ? res.data : []))
      .catch(fail)
      .finally(() => setBusy(null));
  };

  const dirty = Object.keys(identity).length > 0 || workplace !== null;

  const save = () => {
    if (!data || !dirty) return;
    const payload: Record<string, unknown> = {};
    for (const [key] of IDENTITY_FIELDS)
      if (identity[key] !== undefined)
        payload[key] = identity[key]?.trim() || null;
    if (workplace !== null) {
      const clinic = clinics?.find((c) => c.siamId === workplace);
      payload.workplace =
        workplace === OWN_OFFICE
          ? null
          : {
              siamId: workplace,
              name: clinic?.name || data.workplace?.name || "",
            };
    }
    setBusy("save");
    fetcher({
      url: `${API}/doctor/tamin/settings`,
      method: "PATCH",
      payload,
      bodyParser: "JSON",
    })
      .then(() => {
        pushNotification(getContent("taminSettingsSaved"), "Success");
        setIdentity({});
        setWorkplace(null);
        mutate();
      })
      .catch(fail)
      .finally(() => setBusy(null));
  };

  if (!data?.token || !data.identity) return null;

  const connected =
    data.token.state === "valid" || data.token.state === "refreshable";
  const overrides = data.identity.overrides || {};
  const fromProfile = data.identity.fromProfile || {};
  const workplaceOptions: Record<string, string> = {
    [OWN_OFFICE]: getContent("taminOwnOffice"),
    ...(data.workplace
      ? {
          [data.workplace.siamId]: data.workplace.name || data.workplace.siamId,
        }
      : {}),
    ...Object.fromEntries(
      (clinics || []).map((c) => [
        c.siamId,
        c.provinceName ? `${c.name} - ${c.provinceName}` : c.name,
      ]),
    ),
  };
  const expiresAt = data.token.tokenExpiresAt
    ? new Date(data.token.tokenExpiresAt)
    : null;

  return (
    <WithTitle title={getContent("taminConnection")} className={classes.card}>
      <div className={classes.main}>
        <div className={classes.row}>
          <span className={classes.status} role="status">
            <span
              className={`${classes.dot} ${connected ? classes.dotOn : ""}`}
              aria-hidden
            />
            {connected
              ? getContent("taminConnected")
              : data.token.state === "expired"
                ? getContent("taminSessionExpired")
                : getContent("taminNotConnected")}
          </span>
          {data.environment === "test" && (
            <span className={classes.badge}>
              {getContent("taminTestEnvironment")}
            </span>
          )}
          {connected && !!expiresAt && !Number.isNaN(expiresAt.getTime()) && (
            <span className={classes.muted}>
              {getContent("taminTokenValidUntil", [
                expiresAt.toLocaleString(intlTag, {
                  timeZone: TEHRAN_TZ,
                  hour: "numeric",
                  minute: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              ])}
            </span>
          )}
        </div>
        {data.configured === false ? (
          <p className={classes.muted}>{getContent("taminNotConfigured")}</p>
        ) : (
          <div className={classes.row}>
            <Button isLoading={busy === "login"} onClick={login} size="M">
              {data.token.state === "missing"
                ? getContent("taminLogin")
                : getContent("taminRelogin")}
            </Button>
            {connected && !!data.signoutUrl && (
              <Button
                href={data.signoutUrl}
                variant="Error"
                mode="Inline"
                size="M"
              >
                {getContent("taminLogout")}
              </Button>
            )}
          </div>
        )}

        <strong>{getContent("taminIdentity")}</strong>
        <p className={classes.muted}>{getContent("taminIdentityHint")}</p>
        <div className={classes.fields}>
          {IDENTITY_FIELDS.map(([key, title]) => (
            <Input
              key={`${key}-${overrides[key] || ""}`}
              title={
                // the profile value that is sent while the field is empty
                fromProfile[key]
                  ? `${getContent(title)} (${fromProfile[key]})`
                  : getContent(title)
              }
              inputMode="numeric"
              inputClass={classes.ltr}
              defaultValue={overrides[key] || ""}
              onChange={(e) =>
                setIdentity((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          ))}
        </div>

        <div className={classes.row}>
          <SelectInput
            key={`${Object.keys(workplaceOptions).length}-${data.workplace?.siamId || ""}`}
            title={getContent("taminWorkplace")}
            options={workplaceOptions}
            defaultValue={data.workplace?.siamId || OWN_OFFICE}
            onChange={(e) => setWorkplace(e.target.value || OWN_OFFICE)}
            className={classes.select}
          />
          {connected && (
            <Button
              mode="Outline"
              size="M"
              isLoading={busy === "clinics"}
              onClick={loadClinics}
            >
              {getContent("taminLoadClinics")}
            </Button>
          )}
        </div>

        <div className={classes.row}>
          <Button
            onClick={save}
            isLoading={busy === "save"}
            size="M"
            variant={dirty ? "Primary" : "Disable"}
          >
            {getContent("taminSaveSettings")}
          </Button>
        </div>
      </div>
    </WithTitle>
  );
};

export default DoctorTaminConnectionCard;
