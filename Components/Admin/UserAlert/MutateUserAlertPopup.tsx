import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
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
            type: "users",
            title: ta("کاربر"),
            getDefaultValue: (inp) => inp.user,
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
