import { IInvoice } from "@/Components/Booking/SelectSessionToReservePopup";
import classes from "./CheckoutPopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const CheckoutPopup = ({
  invoice,
  mutate,
}: {
  invoice: IInvoice;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        renderer={{ secret: { title: "Say My Name", type: "text" } }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/checkout/invoice/${invoice._id}`,
          method: "PUT",
          successCb: () => {
            closePopup();
            mutate();
          },
        }}
      />
    </PopupCard>
  );
};

export default CheckoutPopup;
