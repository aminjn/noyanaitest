import PopupCard from "@/Components/UI/PopupCard";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { IGalleryItem } from "./AdminManageDoctorGalleryTab";
import { IDoctor } from "./AdminManageDoctorsPage";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateGalleryItemPopup = ({
  mutate,
  doc,
  node,
}: { mutate: () => unknown } & (
  | { doc: IDoctorProfile | IDoctor; node?: never }
  | { node: IGalleryItem; doc?: never }
)) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={ta("تصویر گالری")}>
      <CreateForm
        styleManaged
        defaultValue={node}
        hookProps={{
          method: "POST",
          path: `${API}/auto/galleryitem${node ? `/${node._id}` : ""}`,
          mutator: doc
            ? (inp) => ({
                ...inp,
                owner: doc._id,
                ownerPath: (doc as IDoctor).name ? "Doctor" : "DoctorProfile",
              })
            : undefined,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
        renderer={{
          image: { type: "image", title: ta("تصویر") },
          active: { type: "bool", title: ta("فعال") },
          alt: { title: ta("آلت"), type: "text" },
          description: { type: "text", title: ta("توضیحات") },
          order: { type: "number", title: ta("رتبه") },
        }}
      />
    </PopupCard>
  );
};

export default MutateGalleryItemPopup;
