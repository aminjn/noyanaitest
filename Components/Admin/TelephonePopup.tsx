import { API } from "../config";
import { IUser } from "../Hooks/useUser";
import PopupCard from "../UI/PopupCard";
import CreateForm from "./UI/CreateForm";

const TelephonePopup = () => {
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
        hookProps={{ path: `${API}/admin/call`, method: "POST" }}
      />
    </PopupCard>
  );
};

export default TelephonePopup;
