import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { IClinic, IClinicDepartment } from "./AdminManageClinicsPage";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateClinicDepartmentPopup = ({
  clinic,
  mutate,
  department,
}: {
  clinic: IClinic;
  department?: IClinicDepartment;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("بخش کلینیک")}>
      <CreateForm
        defaultValue={department}
        renderer={{
          name: { title: ta("نام"), type: "text", required: true },
          description: { title: ta("توضیحات"), type: "text" },
          image: { title: ta("تصویر"), type: "image" },
          active: { title: ta("فعال"), type: "bool" },
          order: { type: "number", title: ta("رتبه") },
          summary: { type: "text", title: ta("خلاصه") },
          phone: { type: "text", title: ta("تلفن") },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/clinicdepartment${
            department ? `/${department._id}` : ""
          }`,
          method: "POST",
          mutator: department
            ? undefined
            : (inp) => ({ ...inp, clinic: clinic._id }),
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default MutateClinicDepartmentPopup;
