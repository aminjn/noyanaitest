import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { Fragment, useState } from "react";
import Loading from "../UI/Loading";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { adminPath } from "@/Components/helpers/adminPath";

const CreatePharmacyPopup = ({ mutate }: { mutate: () => unknown }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { closePopup } = usePopup();
  const push = useProgress();

  return (
    <Fragment>
      <Loading />
      <Act<{ data: { data: IPharmacy } }>
        path={isLoading ? `${API}/auto/pharmacy` : null}
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (status) {
            mutate();
            if (result) push(adminPath(`/pharmacy/${result.data.data._id}`));
            closePopup();
          }
        }}
      />
    </Fragment>
  );
};

export default CreatePharmacyPopup;
