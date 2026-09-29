import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { IUser } from "@/Components/Hooks/useUser";
import { getUserLabel } from "../Lib/LabelGetters";
import {
  FullNotification,
  notificationSourceDict,
} from "./AdminManageNotificationsPage";

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
    <PopupCard title={isEdit ? "ویرایش اعلان" : "اعلان جدید"}>
      <CreateForm
        style={{ width: "min(40rem , 90dvw)" }}
        defaultValue={node}
        onCancel={() => closePopup()}
        renderer={{
          user: {
            type: "nodes",
            title: isEdit ? "کاربر" : "کاربران",
            path: `${API}/auto/user`,
            getOptionLabel: (n) => getUserLabel(n as IUser),
            getOptionValue: (n) => (n as IUser)._id,
            getDefaultValue: (inp) => inp.user?._id,
            multi: !isEdit,
          },
          title: { title: "عنوان", type: "text" },
          message: { title: "متن پیام", type: "area" },
          // a new admin message is always "Admin" (set by the server)
          ...(isEdit
            ? {
                source: {
                  title: "منبع",
                  type: "select" as const,
                  options: notificationSourceDict,
                },
              }
            : {}),
          link: { title: "لینک (اختیاری)", type: "text" },
        }}
        hookProps={{
          path: isEdit
            ? `${API}/auto/notification/${node._id}`
            : `${API}/admin/notification/bulk`,
          method: "POST",
          hasProblem: (inp) => {
            if (!isEdit && !(inp.user as unknown as string[] | undefined)?.length)
              return "لطفا حداقل یک کاربر را انتخاب کنید";
            if (isEdit && !inp.user && !node?.user)
              return "لطفا کاربر را انتخاب کنید";
            if (!inp.title && !node?.title) return "لطفا عنوان را وارد کنید";
            if (!inp.message && !node?.message)
              return "لطفا متن پیام را وارد کنید";
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
