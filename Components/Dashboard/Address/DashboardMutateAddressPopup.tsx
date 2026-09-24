import PopupCard from "@/Components/UI/PopupCard";
import { IUserAddress } from "./DashboardManageAddressesPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const NS: ContentNamespace[] = ["common", "dashboardMutateAddressPopup"];

const DashboardMutateAddressPopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);

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
