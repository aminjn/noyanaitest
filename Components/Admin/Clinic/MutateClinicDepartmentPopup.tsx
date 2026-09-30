import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { IClinic, IClinicDepartment } from "./AdminManageClinicsPage";
import { API } from "@/Components/config";

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
    <PopupCard title="بخش کلینیک">
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
