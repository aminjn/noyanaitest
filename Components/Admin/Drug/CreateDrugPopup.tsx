import CreateByNamePopup from "../UI/CreateByNamePopup";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty drug
const CreateDrugPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="drug"
    title="داروی جدید"
    fieldTitle="نام دارو"
    editPath={(id) => `/drug/${id}`}
    mutate={mutate}
  />
);

export default CreateDrugPopup;
