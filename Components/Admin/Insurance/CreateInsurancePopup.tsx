import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import useProgress from "@/Components/Hooks/useProgress";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { adminPath } from "@/Components/helpers/adminPath";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";

const CreateInsurancePopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const push = useProgress();
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IInsurance } }>
        path={isLoading ? `${API}/auto/insurance` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (status) {
            mutate();
            if (result) push(adminPath(`/insurance/${result.data.data._id}`));
          }
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default CreateInsurancePopup;
