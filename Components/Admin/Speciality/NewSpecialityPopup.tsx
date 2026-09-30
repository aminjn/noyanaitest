import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import { ISpeciality } from "./AdminManageSpecialitiesPage";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";

// Asks for the name first (like "new article"): an empty speciality used to
// be created on open, so every cancelled popup left a nameless one behind.
// The slug is generated from the name by the backend job.
const NewSpecialityPopup = () => {
  const { closePopup } = usePopup();
  const push = useProgress();

  return (
    <PopupCard title={ta("تخصص جدید")}>
      <CreateForm<{ name: string }, { data: { data: ISpeciality } }>
        hookProps={{
          path: `${API}/auto/speciality`,
          method: "POST",
          hasProblem: (inp) =>
            !inp.name?.trim() ? ta("لطفا نام تخصص را وارد کنید") : undefined,
          successCb: (result) => {
            closePopup();
            const id = result?.data?.data?._id;
            if (id) push(adminPath(`/speciality/${id}`));
          },
        }}
        renderer={{ name: { type: "text", title: ta("نام تخصص") } }}
        onCancel={closePopup}
        style={{ width: "min(28rem, 90dvw)" }}
      />
    </PopupCard>
  );
};

export default NewSpecialityPopup;
