import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import {
  FullNotification,
  notificationSourceDict,
} from "./AdminManageNotificationsPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateNotificationPopup = ({
  mutate,
  node,
}: {
  node?: FullNotification;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const isEdit = !!node;

  return (
    <PopupCard title={isEdit ? ta("ویرایش اعلان") : ta("اعلان جدید")}>
      <CreateForm
        style={{ width: "min(40rem , 90dvw)" }}
        defaultValue={node}
        onCancel={() => closePopup()}
        renderer={{
          user: {
            type: "users",
            title: isEdit ? ta("کاربر") : ta("کاربران"),
            getDefaultValue: (inp) => inp.user,
            multi: !isEdit,
          },
          title: { title: ta("عنوان"), type: "text" },
          message: { title: ta("متن پیام"), type: "area" },
          // a new admin message is always "Admin" (set by the server)
          ...(isEdit
            ? {
                source: {
                  title: ta("منبع"),
                  type: "select" as const,
                  options: notificationSourceDict,
                },
              }
            : {}),
          link: { title: ta("لینک (اختیاری)"), type: "text" },
        }}
        hookProps={{
          path: isEdit
            ? `${API}/auto/notification/${node._id}`
            : `${API}/admin/notification/bulk`,
          method: "POST",
          hasProblem: (inp) => {
            if (!isEdit && !(inp.user as unknown as string[] | undefined)?.length)
              return ta("لطفا حداقل یک کاربر را انتخاب کنید");
            if (isEdit && !inp.user && !node?.user)
              return ta("لطفا کاربر را انتخاب کنید");
            if (!inp.title && !node?.title) return ta("لطفا عنوان را وارد کنید");
            if (!inp.message && !node?.message)
              return ta("لطفا متن پیام را وارد کنید");
          },
          mutator: isEdit
            ? undefined
            : (inp) => ({
                users: inp.user,
                title: inp.title,
                message: inp.message,
                link: inp.link,
              }),
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default MutateNotificationPopup;
