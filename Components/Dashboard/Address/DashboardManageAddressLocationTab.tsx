import { IUserAddress } from "./DashboardManageAddressesPage";
import classes from "./DashboardManageAddressLocationTab.module.css";
import PointPicker from "@/Components/Admin/UI/PointPicker";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import useLocale from "@/Components/Hooks/useLocale";
import useNotification from "@/Components/Hooks/useNotification";
import { API } from "@/Components/config";
import useForm from "@/Components/Hooks/useForm";

const DashboardManageAddressLocationTab = ({
  mutate,
  address,
}: {
  address: IUserAddress;
  mutate: () => unknown;
}) => {
  const { setInput, isLoading, submit, input } = useForm<{
    coords: [number, number];
  }>({
    path: `${API}/user/address/${address._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) => ({ location: inp.coords }),
  });

  const getContent = useLocale();

  const pushNotification = useNotification();

  return (
    <div className={classes.main}>
      <PointPicker
        defaultValue={address.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
      />
      <FormActions>
        <Button
          onClick={() => {
            if (!input.coords) return pushNotification("checkInput", "Warn");
            submit();
          }}
          isLoading={!!isLoading}
        >
          {getContent("submit")}
        </Button>
      </FormActions>
    </div>
  );
};

export default DashboardManageAddressLocationTab;
