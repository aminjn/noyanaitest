import { API } from "@/Components/config";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import classes from "./CreateBlogPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";

const CreateBlogPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <Box>
      <CreateForm
        hookProps={{
          path: `${API}/auto/blog`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{ title: { type: "text", title: "عنوان" } }}
        onCancel={closePopup}
        className={classes.main}
      />
    </Box>
  );
};

export default CreateBlogPopup;
