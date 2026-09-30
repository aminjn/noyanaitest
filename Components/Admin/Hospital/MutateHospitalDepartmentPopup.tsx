import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { IHospital, IHospitalDepartment } from "./AdminManageHospitalsPage";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateHospitalDepartmentPopup = ({
  hospital,
  mutate,
  department,
}: {
  hospital: IHospital;
  department?: IHospitalDepartment;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("بخش بیمارستان")}>
      <CreateForm
        defaultValue={department}
        renderer={{
          name: { title: ta("نام"), type: "text" },
          description: { title: ta("توضیحات"), type: "text" },
          image: { title: ta("تصویر"), type: "image" },
          active: { title: ta("فعال"), type: "bool" },
          order: { type: "number", title: ta("رتبه") },
          summary: { type: "text", title: ta("خلاصه") },
          phone: { type: "text", title: ta("تلفن") },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/hospitaldepartment${
            department ? `/${department._id}` : ""
          }`,
          method: "POST",
          mutator: department
            ? undefined
            : (inp) => ({ ...inp, hospital: hospital._id }),
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default MutateHospitalDepartmentPopup;
