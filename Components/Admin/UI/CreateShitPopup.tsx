import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm, { FormRenderer } from "./CreateForm";
import { API } from "@/Components/config";

const CreateShitPopup = <T,>({
  renderer,
  mutate,
  modelName,
}: {
  renderer: FormRenderer<T>;
  mutate: () => unknown;
  modelName: string;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard>
      <CreateForm<T>
        renderer={renderer}
        onCancel={() => closePopup()}
        hookProps={{
          method: "POST",
          path: `${API}/auto/${modelName}`,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default CreateShitPopup;
