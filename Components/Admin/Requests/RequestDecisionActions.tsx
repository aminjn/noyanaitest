"use client";

import { ReactNode, useState } from "react";
import classes from "./RequestDecisionActions.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import PopupCard from "@/Components/UI/PopupCard";
import AreaInput from "@/Components/UI/AreaInput";
import NodesSelector from "@/Components/UI/NodesSelector";
import DateInput from "@/Components/UI/DateInput";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import FormActions from "../UI/FormActions";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  isPendingStatus,
  RequestGroup,
  requestStatusColor,
  requestStatusLabel,
} from "./requestMeta";

export type LinkExistingConfig = {
  // e.g. "becomeclinic" -> POST /admin/becomeclinic/:id/approve {orgId}
  requestPath: string;
  // the centres to pick from, e.g. `${API}/auto/clinic`
  orgPath: string;
  // the selector's title, e.g. "انتخاب کلینیک"
  label: string;
  // admin page of the linked centre, e.g. (id) => `/clinic/${id}`
  target: (id: string) => string;
  // the applicant's user id: their own centre is not "someone else's"
  applicantUser?: string;
  // an older centre request with no licence expiry: the admin enters it
  // here (the backend refuses the approval without one)
  askLicenceExpiry?: boolean;
};

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

const idOf = (v: unknown): string =>
  typeof v === "string"
    ? v
    : v && typeof v === "object" && "_id" in v
      ? String((v as { _id: unknown })._id)
      : "";

const RejectRequestPopup = ({
  url,
  popupKey,
  mutate,
}: {
  url: string;
  popupKey: string;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const valid = reason.trim().length >= 3;

  const submit = async () => {
    if (busy || !valid) return;
    setBusy(true);
    try {
      await fetcher({
        url,
        method: "POST",
        payload: { reason: reason.trim() },
        bodyParser: "JSON",
      });
      pushNotification(ta("درخواست رد شد و به متقاضی اطلاع داده شد."), "Success");
      closePopup(popupKey);
      await mutate();
    } catch (e) {
      pushNotification(errorText(e), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={ta("رد درخواست")}>
      <div className={classes.popup}>
        <AreaInput
          required
          title={ta("دلیل رد (به متقاضی نشان داده می‌شود)")}
          onChange={(e) => setReason(e.target.value)}
        />
        <FormActions>
          <Button
            variant={valid ? "Error" : "Disable"}
            isLoading={busy}
            onClick={submit}
          >
            {ta("رد درخواست")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup(popupKey)}>
            {ta("انصراف")}
          </Button>
        </FormActions>
      </div>
    </PopupCard>
  );
};

type OrgOption = { _id: string; name?: string; user?: unknown };

const LinkExistingPopup = ({
  nodeId,
  config,
  popupKey,
  mutate,
}: {
  nodeId: string;
  config: LinkExistingConfig;
  popupKey: string;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const push = useProgress();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const ready = !!orgId && (!config.askLicenceExpiry || !!expiresAt);

  const optionLabel = (node: unknown) => {
    const org = (node || {}) as OrgOption;
    const name = org.name || org._id || "";
    const owner = idOf(org.user);
    if (!owner) return name;
    if (config.applicantUser && owner === config.applicantUser)
      return ta("${1} (مرکز خود متقاضی)", [name]);
    return ta("${1} (دارای مالک)", [name]);
  };

  const submit = async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}/admin/${config.requestPath}/${nodeId}/approve`,
        method: "POST",
        payload: { orgId, ...(config.askLicenceExpiry && expiresAt ? { certificateExpiresAt: expiresAt } : {}) },
        bodyParser: "JSON",
      });
      pushNotification(ta("درخواست با اتصال به مرکز موجود تأیید شد."), "Success");
      closePopup(popupKey);
      await mutate();
      const id = res?.data?.node?._id;
      if (id) push(adminPath(config.target(String(id))));
    } catch (e) {
      pushNotification(errorText(e), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PopupCard title={ta("تأیید با اتصال به مرکز موجود")}>
      <div className={classes.popup}>
        <p className={classes.hint}>
          {ta("مرکزی که صاحب دیگری دارد پذیرفته نمی‌شود؛ مرکز انتخاب‌شده به متقاضی داده می‌شود و درخواست تأیید می‌شود.")}
        </p>
        <NodesSelector
          multi={false}
          path={config.orgPath}
          title={config.label}
          getOptionLabel={optionLabel}
          getOptionValue={(node) => idOf(node)}
          onChange={(v) => setOrgId(v || null)}
        />
        {!!config.askLicenceExpiry && (
          <DateInput title={ta("تاریخ انقضای پروانه")} onChange={(d) => setExpiresAt(d)} />
        )}
        <FormActions>
          <Button
            variant={ready ? "Success" : "Disable"}
            isLoading={busy}
            onClick={submit}
          >
            {ta("تأیید")}
          </Button>
          <Button variant="Neutral" onClick={() => closePopup(popupKey)}>
            {ta("انصراف")}
          </Button>
        </FormActions>
      </div>
    </PopupCard>
  );
};

// One decision block for every provider-verification request (2026-09): the
// kind's own approve button while pending, reject with a reason the
// applicant is told, "in review" for addition requests, approve by linking
// an existing centre, and reopen for a rejected one. The state changes are
// one-way on the backend (/admin/requests/...), so there is no free status
// select any more.
const RequestDecisionActions = ({
  group,
  kind,
  nodeId,
  status,
  rejectReason,
  mutate,
  approve,
  linkExisting,
}: {
  group: RequestGroup;
  kind: string;
  nodeId: string;
  status?: string;
  rejectReason?: string;
  mutate: () => unknown;
  approve?: ReactNode;
  linkExisting?: LinkExistingConfig;
}) => {
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState<"reopen" | "processing" | null>(null);
  const base = `${API}/admin/requests/${group}/${kind}/${nodeId}`;

  const post = async (action: "reopen" | "processing", done: string) => {
    if (busy) return;
    setBusy(action);
    try {
      await fetcher({ url: `${base}/${action}`, method: "POST" });
      pushNotification(done, "Success");
      await mutate();
    } catch (e) {
      pushNotification(errorText(e), "Error");
    } finally {
      setBusy(null);
    }
  };

  const statusBadge = (
    <Badge color={requestStatusColor(status)} size="L">
      {requestStatusLabel(status)}
    </Badge>
  );

  if (isPendingStatus(group, status))
    return (
      <div className={classes.main}>
        <div className={classes.statusRow}>
          <span className={classes.label}>{ta("وضعیت")}</span>
          {statusBadge}
        </div>
        <FormActions className={classes.actions}>
          {approve}
          {!!linkExisting && (
            <Button
              variant="Success"
              mode="Outline"
              onClick={() =>
                setPopup(
                  "RequestLinkExisting",
                  <LinkExistingPopup
                    nodeId={nodeId}
                    config={linkExisting}
                    popupKey="RequestLinkExisting"
                    mutate={mutate}
                  />,
                )
              }
            >
              {ta("تأیید با اتصال به مرکز موجود")}
            </Button>
          )}
          {group === "addition" && status === "Pending" && (
            <Button
              variant="Info"
              mode="Outline"
              isLoading={busy === "processing"}
              onClick={() =>
                post("processing", ta("درخواست در حال بررسی علامت خورد."))
              }
            >
              {ta("در حال بررسی")}
            </Button>
          )}
          <Button
            variant="Error"
            mode="Outline"
            onClick={() =>
              setPopup(
                "RequestReject",
                <RejectRequestPopup
                  url={`${base}/reject`}
                  popupKey="RequestReject"
                  mutate={mutate}
                />,
              )
            }
          >
            {ta("رد درخواست")}
          </Button>
        </FormActions>
      </div>
    );

  if (status === "Rejected")
    return (
      <div className={classes.main}>
        <div className={classes.statusRow}>
          <span className={classes.label}>{ta("وضعیت")}</span>
          {statusBadge}
        </div>
        <div className={classes.reason}>
          <span className={classes.label}>{ta("دلیل رد")}</span>
          <p>{rejectReason || "—"}</p>
        </div>
        <FormActions className={classes.actions}>
          <Button
            variant="Primary"
            mode="Outline"
            isLoading={busy === "reopen"}
            onClick={() =>
              post("reopen", ta("درخواست دوباره باز شد و در انتظار بررسی است."))
            }
          >
            {ta("بازگشایی درخواست")}
          </Button>
        </FormActions>
      </div>
    );

  return (
    <div className={classes.main}>
      <div className={classes.statusRow}>
        <span className={classes.label}>{ta("وضعیت")}</span>
        {statusBadge}
      </div>
      <p className={classes.hint}>
        {ta("این درخواست بررسی و بسته شده است.")}
      </p>
    </div>
  );
};

export default RequestDecisionActions;
