import { IGalleryItem } from "@/Components/Admin/Doctor/AdminManageDoctorGalleryTab";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import { API } from "@/Components/config";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";

const MutateGalleryItemPopup = ({
  mutate,
  defaultValue,
}: {
  defaultValue?: IGalleryItem;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <PopupCard>
      <CreateForm
        style={{ width: "min(90dvw , 40rem)" }}
        defaultValue={defaultValue}
        hookProps={{
          method: "POST",
          path: `${API}/doctor/gallery${
            defaultValue ? `/${defaultValue._id}` : ""
          }`,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
        renderer={{
          alt: { type: "text", title: getContent("alt") },
          description: { type: "text", title: getContent("description") },
          order: { type: "number", title: getContent("order") },
          active: { type: "bool", title: getContent("isActive") },
          image: { type: "image", title: getContent("image") },
        }}
      />
    </PopupCard>
  );
};

export default MutateGalleryItemPopup;
