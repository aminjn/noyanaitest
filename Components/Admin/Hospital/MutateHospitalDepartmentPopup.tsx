import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { IHospital, IHospitalDepartment } from "./AdminManageHospitalsPage";
import classes from "./MutateHospitalDepartmentPopup.module.css";
import { API } from "@/Components/config";
import Box from "../UI/Box";

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
    <Box className={classes.main}>
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
    </Box>
  );
};

export default MutateHospitalDepartmentPopup;
