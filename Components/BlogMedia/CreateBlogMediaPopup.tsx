import Box from "../Admin/UI/Box";
import CreateForm from "../Admin/UI/CreateForm";
import { API } from "../config";
import usePopup from "../Hooks/usePopup";
import classes from "./CreateBlogMediaPopup.module.css";

const CreateBlogMediaPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <Box>
      <CreateForm
        hookProps={{
          method: "POST",
          path: `${API}/auto/blogmedia`,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{ name: { title: "نام", type: "text" } }}
        onCancel={() => closePopup()}
      />
    </Box>
  );
};

export default CreateBlogMediaPopup;
