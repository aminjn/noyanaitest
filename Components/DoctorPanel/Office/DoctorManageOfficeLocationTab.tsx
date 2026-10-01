import { IOffice } from "./DoctorManageOfficesPage";
import classes from "./DoctorManageOfficeLocationTab.module.css";
import LocationForm from "@/Components/Map/LocationForm";
import { API } from "@/Components/config";

// The office's point and address: the shared panel location form.
const DoctorManageOfficeLocationTab = ({
  mutate,
  office,
}: {
  office: IOffice;
  mutate: () => unknown;
}) => {
  return (
    <div className={classes.main}>
      <LocationForm
        path={`${API}/doctor/office/${office._id}`}
        entity={office}
        mutate={mutate}
      />
    </div>
  );
};

export default DoctorManageOfficeLocationTab;
