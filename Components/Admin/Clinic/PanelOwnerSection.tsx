"use client";
import { useState } from "react";
import useSWR from "swr";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import InlineLink from "../UI/InlineLink";
import UserSearchSelect, { UserOption, userOptionLabel } from "../UI/UserSearchSelect";
import { ProviderKind, providerAccessModel } from "../UI/ProviderStatus";
import { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";
import { CentreSection } from "./CentreSections";
import classes from "./PanelOwnerSection.module.css";

const errorText = (err: unknown) => (err as Error)?.message || ta("خطایی رخ داد");

// Sets ({user}) or clears ({user: null}) the owner through the dedicated,
// audited route PUT /admin/<kind>/<id>/owner (backend
// Controllers/adminProviderController.ts), never a raw /auto edit: the
// server refuses an account that already owns another provider of this
// kind, marks a doctor profile claimed and tells the new owner.
export const saveProviderOwner = (kind: ProviderKind, nodeId: string, userId: string | null) =>
  fetcher({
    url: `${API}/admin/${kind}/${nodeId}/owner`,
    method: "PUT",
    bodyParser: "JSON",
    payload: { user: userId },
  });

const ClearOwnerPopup = ({
  kind,
  nodeId,
  onDone,
}: {
  kind: ProviderKind;
  nodeId: string;
  onDone: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmationPopup
      message={ta("مالک پنل جدا شود؟ این حساب دیگر به پنل دسترسی ندارد.")}
      isLoading={busy}
      onConfirm={async () => {
        setBusy(true);
        try {
          await saveProviderOwner(kind, nodeId, null);
          pushNotification(ta("مالک پنل جدا شد"), "Success");
          closePopup();
          onDone();
        } catch (err) {
          pushNotification(errorText(err), "Error");
        } finally {
          setBusy(false);
        }
      }}
    />
  );
};

const asOwner = (user: unknown): UserOption | null => {
  if (!user) return null;
  if (typeof user === "string") return { _id: user };
  const u = user as IUser & { name?: string; status?: string };
  return u._id ? { _id: u._id, phone: u.phone, username: u.username, status: u.status } : null;
};

// The owner picker itself (search by phone / name / national id), shared by
// the centre «مالک پنل» section and the doctor's owner tab.
export const ProviderOwnerEditor = ({
  kind,
  node,
  mutate,
}: {
  kind: ProviderKind;
  node: { _id: string; user?: unknown };
  mutate: () => unknown;
}) => {
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const hasAccess = useAccessLevel();
  const canEdit = hasAccess(providerAccessModel[kind], "update");
  // some record endpoints return the owner as a bare id: look it up
  const ownerId = typeof node.user === "string" ? node.user : null;
  const { data: ownerDetails } = useSWR<UserOption | null>(
    ownerId ? `${API}/admin/users/${ownerId}` : null,
    (url: string) =>
      fetcher({ url })
        .then((res) => asOwner(res?.data?.data))
        .catch(() => null),
  );
  const current = ownerDetails || asOwner(node.user);
  const [picked, setPicked] = useState<UserOption | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!picked) {
      pushNotification(ta("یک حساب را جستجو و انتخاب کنید"), "Error");
      return;
    }
    setBusy(true);
    try {
      await saveProviderOwner(kind, node._id, picked._id);
      pushNotification(ta("مالک پنل ذخیره شد"), "Success");
      setPicked(null);
      mutate();
    } catch (err) {
      pushNotification(errorText(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.main}>
      <div className={classes.current}>
        <span className={classes.label}>{ta("مالک فعلی")}</span>
        {current ? (
          <InlineLink href={adminPath(`/user/${current._id}`)}>
            {userOptionLabel(current)}
          </InlineLink>
        ) : (
          <span className={classes.empty}>{ta("ندارد")}</span>
        )}
      </div>
      {canEdit && (
        <>
          <UserSearchSelect
            title={current ? ta("تغییر مالک پنل") : ta("حساب کاربری مالک پنل")}
            value={picked}
            onChange={setPicked}
            clearable
          />
          <FormActions>
            <Button onClick={save} isLoading={busy}>
              {ta("ذخیره")}
            </Button>
            {!!current && (
              <Button
                variant="Error"
                mode="Outline"
                onClick={() =>
                  setPopup(
                    `RemovePanelOwner-${kind}`,
                    <ClearOwnerPopup kind={kind} nodeId={node._id} onDone={mutate} />,
                  )
                }
              >
                {ta("جدا کردن مالک پنل")}
              </Button>
            )}
          </FormActions>
        </>
      )}
    </div>
  );
};

// «مالک پنل»: the user account that signs in to this centre's panel and
// manages it (one account per centre, unique on the backend). Shared by
// the clinic, hospital, insurance, pharmacy and para clinic record pages.
const PanelOwnerSection = ({
  node,
  mutate,
  modelName,
}: {
  node: { _id: string; user?: unknown };
  mutate: () => unknown;
  // the provider kind (backend admin segment)
  modelName: Exclude<ProviderKind, "doctorprofile">;
}) => (
  <CentreSection
    title={ta("مالک پنل")}
    hint={ta("حساب کاربری‌ای که وارد پنل این مرکز می‌شود و آن را مدیریت می‌کند.")}
  >
    <ProviderOwnerEditor kind={modelName} node={node} mutate={mutate} />
  </CentreSection>
);

export default PanelOwnerSection;
