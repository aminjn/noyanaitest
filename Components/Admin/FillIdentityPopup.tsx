import { API } from "../config";
import { IUser } from "../Hooks/useUser";
import PopupCard from "../UI/PopupCard";
import { getUserLabel } from "./Lib/LabelGetters";
import CreateForm from "./UI/CreateForm";

const FillIdentityPopup = () => {
  return (
    <PopupCard>
      <CreateForm<{ user: string }>
        hookProps={{ path: `${API}/admin/tity`, method: "POST" }}
        renderer={{
          user: {
            type: "nodes",
            path: `${API}/auto/user`,
            getOptionLabel: (node) => getUserLabel(node as IUser),
            getOptionValue: (node) => (node as IUser)._id,
            title: "user",
            multi: false,
          },
        }}
      />
    </PopupCard>
  );
};

export default FillIdentityPopup;
