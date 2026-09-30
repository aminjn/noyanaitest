import PopupCard from "@/Components/UI/PopupCard";
import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import { IInlineAdvertisement } from "./AdminManageInlineAdsPage";
import usePopup from "@/Components/Hooks/usePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateInlineAdPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node?: IInlineAdvertisement;
}) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={ta("تبلیغ خطی")}>
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
          name: { type: "text", title: ta("نام") },
          title: { type: "text", title: ta("عنوان") },
          subTitle: { type: "text", title: ta("توضیحات") },
          image: { type: "image", title: ta("تصویر") },
          target: { type: "text", title: ta("مقصد") },
          active: { type: "bool", title: ta("فعال") },
          expiration: { type: "date", title: ta("تاریخ انقضا") },
        }}
        onCancel={() => closePopup("MutateInlineAd")}
      />
    </PopupCard>
  );
};

export default MutateInlineAdPopup;
