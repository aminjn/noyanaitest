import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { IUser } from "@/Components/Hooks/useUser";
import { getUserLabel } from "../Lib/LabelGetters";
import {
  FullUserAlert,
  userAlertToggleFormRenderer,
} from "./AdminManageUserAlertsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateUserAlertPopup = ({
  mutate,
  node,
}: {
  node?: FullUserAlert;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const isEdit = !!node;

  return (
    <PopupCard
      title={
        isEdit ? ta("ویرایش تنظیمات اطلاع‌رسانی") : ta("تنظیمات اطلاع‌رسانی جدید")
      }
    >
      <CreateForm
        style={{ width: "min(40rem, 90dvw)" }}
        defaultValue={node}
        onCancel={() => closePopup()}
        renderer={{
          user: {
            type: "nodes",
            title: ta("کاربر"),
            path: `${API}/auto/user`,
            getOptionLabel: (n) => getUserLabel(n as IUser),
            getOptionValue: (n) => (n as IUser)._id,
            getDefaultValue: (inp) => inp.user?._id,
            readOnly: isEdit,
            required: true,
          },
          ...userAlertToggleFormRenderer,
        }}
        hookProps={{
          path: isEdit
            ? `${API}/auto/userAlert/${node._id}`
            : `${API}/auto/userAlert`,
          method: "POST",
          hasProblem: (inp) => {
            if (!isEdit && !inp.user) return ta("لطفا کاربر را انتخاب کنید");
          },
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default MutateUserAlertPopup;
