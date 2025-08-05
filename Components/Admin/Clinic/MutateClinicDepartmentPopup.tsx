import usePopup from "@/Components/Hooks/usePopup";
import CreateForm from "../UI/CreateForm";
import { IClinic, IClinicDepartment } from "./AdminManageClinicsPage";
import classes from "./MutateClinicDepartmentPopup.module.css";
import { API } from "@/Components/config";
import Box from "../UI/Box";

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
    <Box className={classes.main}>
      <CreateForm
        defaultValue={department}
        renderer={{
          name: { title: "نام", type: "text" },
          description: { title: "توضیحات", type: "text" },
          image: { title: "تصویر", type: "image" },
          active: { title: "فعال", type: "bool" },
          order: { type: "number", title: "رتبه" },
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
    </Box>
  );
};

export default MutateClinicDepartmentPopup;
