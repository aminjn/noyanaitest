import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { IGalleryItem } from "./AdminManageDoctorGalleryTab";
import classes from "./MutateGalleryItemPopup.module.css";
import { IDoctor } from "./AdminManageDoctorsPage";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

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
    <Box className={classes.main}>
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
          image: { type: "image", title: "تصویر" },
          active: { type: "bool", title: "فعال" },
          alt: { title: "آلت", type: "text" },
          description: { type: "text", title: "توضیحات" },
          order: { type: "number", title: "رتبه" },
        }}
      />
    </Box>
  );
};

export default MutateGalleryItemPopup;
