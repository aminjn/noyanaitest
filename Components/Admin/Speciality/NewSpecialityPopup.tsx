import Act from "@/Components/UI/Act";
import Box from "../UI/Box";
import Loading from "../UI/Loading";
import classes from "./NewSpecialityPopup.module.css";
import { ISpeciality } from "./AdminManageSpecialitiesPage";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

const NewSpecialityPopup = () => {
  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <Box>
      <Loading />
      <Act<{ data: { data: ISpeciality } }>
        path={`${API}/auto/speciality`}
        method="POST"
        payload={{}}
        onDone={(status, data) => {
          if (!status || !data) return closePopup();
          push(adminPath(`/speciality/${data.data.data._id}`));
          closePopup();
        }}
      />
    </Box>
  );
};

export default NewSpecialityPopup;
