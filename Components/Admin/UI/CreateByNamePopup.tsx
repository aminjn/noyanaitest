import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "./CreateForm";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import { ta } from "@/Components/Admin/i18n/adminText";

// "New X": asks for the name first, creates the record, then opens its full
// edit page (2026-09). These popups used to POST an empty record the moment
// they opened, so every cancelled or mis-clicked "new" left a nameless row
// behind (a clinic listed by its id). Admin-only, Persian.
// `fields` asks for several required texts instead of the one `name` (a
// doctor's first and last name).
const CreateByNamePopup = ({
  modelName,
  title,
  fieldTitle = "",
  fields: _fields,
  editPath,
  mutate,
}: {
  // the /auto segment, e.g. "clinic"
  modelName: string;
  title: string;
  fieldTitle?: string;
  fields?: { key: string; title: string }[];
  // admin path of the new record's edit page, e.g. `/clinic/${id}`
  editPath: (id: string) => string;
  mutate?: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const push = useProgress();
  const fields = _fields?.length ? _fields : [{ key: "name", title: fieldTitle }];

  return (
    <PopupCard title={title}>
      <CreateForm<Record<string, string>, { data: { data: { _id: string } } }>
        hookProps={{
          path: `${API}/auto/${modelName}`,
          method: "POST",
          hasProblem: (inp) => {
            const missing = fields.find((field) => !inp[field.key]?.trim());
            return missing
              ? ta("لطفا ${1} را وارد کنید", [missing.title])
              : undefined;
          },
          successCb: (result) => {
            mutate?.();
            closePopup();
            const id = result?.data?.data?._id;
            if (id) push(adminPath(editPath(id)));
          },
        }}
        renderer={Object.fromEntries(
          fields.map((field) => [
            field.key,
            { type: "text", title: field.title, required: true } as const,
          ]),
        )}
        onCancel={closePopup}
      />
    </PopupCard>
  );
};

export default CreateByNamePopup;
