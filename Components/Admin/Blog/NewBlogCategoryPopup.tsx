import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import classes from "./NewBlogCategoryPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import Box from "../UI/Box";

const NewBlogCategoryPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  return (
    <Box>
      <CreateForm
        className={classes.main}
        renderer={{ title: { title: "عنوان", type: "text" } }}
        hookProps={{
          path: `${API}/auto/blogcategory`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={closePopup}
      />
    </Box>
  );
};

export default NewBlogCategoryPopup;
