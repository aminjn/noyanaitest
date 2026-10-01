import { IUserAddress } from "./DashboardManageAddressesPage";
import classes from "./DashboardManageAddressLocationTab.module.css";
import LocationForm from "@/Components/Map/LocationForm";
import { API } from "@/Components/config";

// The address's map pin (the courier's destination) and, from it, the
// address text: the shared panel location form. The address is required on
// the model, so it is only sent when it has text.
const DashboardManageAddressLocationTab = ({
  mutate,
  address,
}: {
  address: IUserAddress;
  mutate: () => unknown;
}) => {
  return (
    <div className={classes.main}>
      <LocationForm
        path={`${API}/user/address/${address._id}`}
        entity={address}
        mutate={mutate}
      />
    </div>
  );
};

export default DashboardManageAddressLocationTab;
