import { Fragment, useState } from "react";
import classes from "./CreateClinicPopup.module.css";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { IClinic } from "./AdminManageClinicsPage";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

const CreateClinicPopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { closePopup } = usePopup();
  const push = useProgress();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IClinic } }>
        path={isLoading ? `${API}/auto/clinic` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (status) mutate();
          if (result) push(adminPath(`/clinic/${result.data.data._id}`));
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateClinicPopup;
