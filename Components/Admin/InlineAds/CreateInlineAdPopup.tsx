import usePopup from "@/Components/Hooks/usePopup";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import classes from "./CreateInlineAdPopup.module.css";
import { API } from "@/Components/config";

const CreateInlineAdPopup = ({ mutate }: { mutate: () => unknown }) => {
  const { closePopup } = usePopup();

  return (
    <Box>
      <CreateForm
        renderer={{ name: { type: "text", title: "نام" } }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/inlinead`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        styleManaged
      />
    </Box>
  );
};

export default CreateInlineAdPopup;
