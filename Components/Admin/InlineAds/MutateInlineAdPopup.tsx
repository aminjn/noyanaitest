import { API } from "@/Components/config";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import { IInlineAdvertisement } from "./AdminManageInlineAdsPage";
import classes from "./MutateInlineAdPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";

const MutateInlineAdPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node?: IInlineAdvertisement;
}) => {
  const { closePopup } = usePopup();

  return (
    <Box>
      <CreateForm
        styleManaged
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/inlinead${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup("MutateInlineAd");
          },
        }}
        renderer={{
          name: { type: "text", title: "نام" },
          title: { type: "text", title: "عنوان" },
          subTitle: { type: "text", title: "توضیحات" },
          image: { type: "image", title: "تصویر" },
          target: { type: "text", title: "مقصد" },
          active: { type: "bool", title: "فعال" },
          expiration: { type: "date", title: "تاریخ انقضا" },
        }}
        onCancel={() => closePopup("MutateInlineAd")}
      />
    </Box>
  );
};

export default MutateInlineAdPopup;
