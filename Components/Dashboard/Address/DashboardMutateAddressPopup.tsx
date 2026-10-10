import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import AddressForm from "./AddressForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";

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
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(["common", "dashboardAddress"]);
  return (
    <PopupCard title={getContent("addNewAddress")}>
      <AddressForm
        onSaved={() => {
          mutate();
          closePopup(popupName);
        }}
        onCancel={() => closePopup(popupName)}
      />
    </PopupCard>
  );
};

export default DashboardMutateAddressPopup;
