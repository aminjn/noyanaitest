import PopupCard from "@/Components/UI/PopupCard";
import {
  ITicket,
  ticketStatusDict,
} from "@/Components/Dashboard/Support/SupportPage";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

const ChangeTicketStatusPopup = ({
  ticket,
  mutate,
}: {
  ticket: Pick<ITicket, "_id" | "status">;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title="تغییر وضعیت تیکت">
      <CreateForm
        styleManaged
        defaultValue={ticket}
        renderer={{
          status: {
            type: "select",
            title: "وضعیت",
            options: ticketStatusDict,
          },
        }}
        hookProps={{
          path: `${API}/auto/ticket/${ticket._id}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default ChangeTicketStatusPopup;
