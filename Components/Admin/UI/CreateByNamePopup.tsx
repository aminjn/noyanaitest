import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "./CreateForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

// "New X": asks for the name first, creates the record, then opens its full
// edit page (2026-09). These popups used to POST an empty record the moment
// they opened, so every cancelled or mis-clicked "new" left a nameless row
// behind (a clinic listed by its id). Admin-only, Persian.
const CreateByNamePopup = ({
  modelName,
  title,
  fieldTitle,
  editPath,
  mutate,
}: {
  // the /auto segment, e.g. "clinic"
  modelName: string;
  title: string;
  fieldTitle: string;
  // admin path of the new record's edit page, e.g. `/clinic/${id}`
  editPath: (id: string) => string;
  mutate?: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const push = useProgress();

  return (
    <PopupCard title={title}>
      <CreateForm<{ name: string }, { data: { data: { _id: string } } }>
        hookProps={{
          path: `${API}/auto/${modelName}`,
          method: "POST",
          hasProblem: (inp) =>
            !inp.name?.trim() ? `لطفا ${fieldTitle} را وارد کنید` : undefined,
          successCb: (result) => {
            mutate?.();
            closePopup();
            const id = result?.data?.data?._id;
            if (id) push(adminPath(editPath(id)));
          },
        }}
        renderer={{ name: { type: "text", title: fieldTitle, required: true } }}
        onCancel={closePopup}
      />
    </PopupCard>
  );
};

export default CreateByNamePopup;
