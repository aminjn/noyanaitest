import PopupCard from "@/Components/UI/PopupCard";
import { IUserAddress } from "./DashboardManageAddressesPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const NS: ContentNamespace[] = ["common", "dashboardMutateAddressPopup"];

// popupName must match the name the opener passed to setPopup (the cart
// opens it as "CartAddAddress", the addresses page as
// "DashboardMutateAddress")
const DashboardMutateAddressPopup = ({
  mutate,
  popupName = "CartAddAddress",
}: {
  mutate: () => unknown;
  popupName?: string;
}) => {
  const getContent = useScopedLocale(NS);

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IUserAddress>
        renderer={{
          displayName: { type: "text", title: getContent("displayName") },
          address: { type: "text", title: getContent("address") },
          // left empty, the account's own number is used
          receiverPhone: { type: "text", title: getContent("receiverPhone") },
          postalCode: { type: "text", title: getContent("postalCode") },
        }}
        hookProps={{
          method: "POST",
          path: `${API}/user/address`,
          successCb: () => {
            mutate();
            closePopup(popupName);
          },
        }}
        onCancel={() => closePopup(popupName)}
      />
    </PopupCard>
  );
};

export default DashboardMutateAddressPopup;
