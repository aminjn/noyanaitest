import { IGalleryItem } from "@/Components/Admin/Doctor/AdminManageDoctorGalleryTab";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import { API } from "@/Components/config";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

const MutateGalleryItemPopup = ({
  mutate,
  defaultValue,
}: {
  defaultValue?: IGalleryItem;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

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
