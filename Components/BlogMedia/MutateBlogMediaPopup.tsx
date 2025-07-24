import Box from "../Admin/UI/Box";
import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import usePopup from "../Hooks/usePopup";
import { IBlogMedia } from "./AdminManageBlogMediasPage";
import classes from "./MutateBlogMediaPopup.module.css";

const MutateBlogMediaPopup = ({
  mutate,
  defaultValue,
}: {
  defaultValue?: IBlogMedia;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <Box className={classes.main}>
      <CreateForm
        onCancel={() => closePopup("MutateBlogMedia")}
        hookProps={{
          path: `${API}/auto/blogmedia${
            defaultValue ? `/${defaultValue._id}` : ""
          }`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup("MutateBlogMedia");
          },
        }}
        renderer={{
          name: { type: "text", title: "نام" },
          file: { type: "image", title: "تصویر" },
        }}
        styleManaged
        defaultValue={defaultValue}
      />
    </Box>
  );
};

export default MutateBlogMediaPopup;
