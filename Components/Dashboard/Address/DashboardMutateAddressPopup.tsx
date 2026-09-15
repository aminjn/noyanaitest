import PopupCard from "@/Components/UI/PopupCard";
import { IUserAddress } from "./DashboardManageAddressesPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const DashboardMutateAddressPopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IUserAddress>
        renderer={{
          displayName: { type: "text", title: getContent("displayName") },
          address: { type: "text", title: getContent("address") },
        }}
        hookProps={{
          method: "POST",
          path: `${API}/user/address`,
          successCb: () => {
            mutate();
            closePopup("CartAddAddress");
          },
        }}
        onCancel={() => closePopup("CartAddAddress")}
      />
    </PopupCard>
  );
};

export default DashboardMutateAddressPopup;
