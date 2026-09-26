import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm, { FormRenderer } from "./CreateForm";
import { API } from "@/Components/config";

const CreateShitPopup = <T,>({
  renderer,
  mutate,
  modelName,
  title,
}: {
  renderer: FormRenderer<T>;
  mutate: () => unknown;
  modelName: string;
  // Name of the list this record is added to (e.g. "مقالات").
  title?: string;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={title ? `افزودن به ${title}` : "افزودن مورد جدید"}>
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
