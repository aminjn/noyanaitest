import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { IAccessLevel } from "./AdminManageAccessLevelsPage";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";

// Name first: an unnamed access level used to be created on open, and the
// admin list and the "assign to user" picker showed it as a blank row.
const CreateAccessLevelPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  const push = useProgress();

  return (
    <PopupCard title={ta("سطح دسترسی جدید")}>
      <CreateForm<{ name: string }, { data: { data: IAccessLevel } }>
        hookProps={{
          path: `${API}/auto/accesslevel`,
          method: "POST",
          hasProblem: (inp) =>
            !inp.name?.trim() ? ta("لطفا نام سطح دسترسی را وارد کنید") : undefined,
          successCb: (result) => {
            mutate();
            closePopup();
            const id = result?.data?.data?._id;
            if (id) push(adminPath(`/accesslevel/${id}`));
          },
        }}
        renderer={{ name: { type: "text", title: ta("نام سطح دسترسی") } }}
        onCancel={closePopup}
        style={{ width: "min(28rem, 90dvw)" }}
      />
    </PopupCard>
  );
};

export default CreateAccessLevelPopup;
