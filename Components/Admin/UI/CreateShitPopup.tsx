import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm, { FormRenderer } from "./CreateForm";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

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
    <PopupCard
      title={title ? ta("افزودن به ${1}", [title]) : ta("افزودن مورد جدید")}
      // a long form gets the wide popup (CreateForm splits it into tabs)
      size={Object.keys(renderer).length >= 9 ? "wide" : "normal"}
    >
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
