import PopupCard from "@/Components/UI/PopupCard";
import { IShortLink } from "./AdminManageShortLinksPage";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const MutateShortLinkPopup = ({
  mutate,
  node,
}: {
  node?: IShortLink;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm
        style={{ width: "min(40rem , 90dvw)" }}
        onCancel={() => closePopup()}
        renderer={{
          target: { title: "مقصد", type: "text" },
          token: { title: "توکن", type: "text" },
        }}
        hookProps={{
          path: `${API}/auto/shortlink${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        defaultValue={node}
      />
    </PopupCard>
  );
};

export default MutateShortLinkPopup;
