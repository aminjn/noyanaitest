import CreateByNamePopup from "../UI/CreateByNamePopup";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty pharmacy
const CreatePharmacyPopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="pharmacy"
    title="داروخانه‌ی جدید"
    fieldTitle="نام داروخانه"
    editPath={(id) => `/pharmacy/${id}`}
    mutate={mutate}
  />
);

export default CreatePharmacyPopup;
