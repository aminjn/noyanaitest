import { ICallRoom } from "@/Components/Dashboard/Call/DashboardManageCallsPage";
import CreateForm from "../UI/CreateForm";
import { IUser } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";

const CreateCallPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<{ callee: string; caller: string }>
        style={{ width: "min(90dvw , 40rem)" }}
        renderer={{
          callee: {
            type: "nodes",
            title: "caller",
            getOptionLabel: (node) =>
              (node as IUser).phone || (node as IUser)._id,
            getOptionValue: (node) => (node as IUser)._id,
            path: `${API}/auto/user`,
            multi: false,
          },
          caller: {
            type: "nodes",
            title: "callee",
            getOptionLabel: (node) =>
              (node as IUser).phone || (node as IUser)._id,
            getOptionValue: (node) => (node as IUser)._id,
            path: `${API}/auto/user`,
            multi: false,
          },
        }}
        hookProps={{
          path: `${API}/auto/callroom`,
          method: "POST",
          mutator: (inp) => ({
            callType: "voice",
            participants: [inp.caller, inp.callee],
          }),
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default CreateCallPopup;
