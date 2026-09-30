"use client";
import { ReactNode } from "react";
import FormActions from "../UI/FormActions";
import CreateForm from "../UI/CreateForm";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import { getUserLabel } from "../Lib/LabelGetters";
import { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";
import { CentreSection } from "./CentreSections";

// «مالک پنل»: the user account that signs in to this centre's panel and
// manages it (one account per centre, unique on the backend). Shared by
// the clinic, hospital, insurance, pharmacy and para clinic record pages.
const PanelOwnerSection = ({
  node,
  mutate,
  modelName,
  removePopup,
  removeTitle,
}: {
  node: { _id: string; user?: unknown };
  mutate: () => unknown;
  // the /auto segment the centre is saved through
  modelName: string;
  // the confirmation popup that detaches the owner, if the centre has one
  removePopup?: ReactNode;
  removeTitle?: string;
}) => {
  const { setPopup } = usePopup();
  const user =
    node.user && typeof node.user === "object"
      ? (node.user as IUser)
      : undefined;

  return (
    <CentreSection
      title={ta("مالک پنل")}
      hint={ta("حساب کاربری‌ای که وارد پنل این مرکز می‌شود و آن را مدیریت می‌کند.")}
    >
      <CreateForm<{ user?: unknown }>
        defaultValue={node}
        layout="flat"
        renderer={{
          user: {
            title: ta("حساب کاربری مالک پنل"),
            type: "nodes",
            multi: false,
            getOptionLabel: (el) => getUserLabel(el as IUser),
            path: `${API}/auto/user`,
            getOptionValue: (el) => (el as IUser)._id,
            getDefaultValue: () =>
              user?._id || (typeof node.user === "string" ? node.user : undefined),
          },
        }}
        hookProps={{
          path: `${API}/auto/${modelName}/${node._id}`,
          method: "POST",
          successCb: () => mutate(),
        }}
      />
      {!!node.user && !!removePopup && (
        <FormActions>
          <Button
            variant="Error"
            onClick={() => setPopup(`RemovePanelOwner-${modelName}`, removePopup)}
          >
            {removeTitle || ta("جدا کردن مالک پنل")}
          </Button>
        </FormActions>
      )}
    </CentreSection>
  );
};

export default PanelOwnerSection;
