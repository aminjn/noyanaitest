import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { IHospital, IHospitalDepartment } from "./AdminManageHospitalsPage";
import { API } from "@/Components/config";

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
    <PopupCard title="بخش بیمارستان">
      <CreateForm
        defaultValue={department}
        renderer={{
          name: { title: "نام", type: "text" },
          description: { title: "توضیحات", type: "text" },
          image: { title: "تصویر", type: "image" },
          active: { title: "فعال", type: "bool" },
          order: { type: "number", title: "رتبه" },
          summary: { type: "text", title: "خلاصه" },
          phone: { type: "text", title: "تلفن" },
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
