import CreateByNamePopup from "../UI/CreateByNamePopup";

// asks for the name first (Components/Admin/UI/CreateByNamePopup.tsx) -
// opening it no longer creates an empty insurance
const CreateInsurancePopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="insurance"
    title="بیمه‌ی جدید"
    fieldTitle="نام بیمه"
    editPath={(id) => `/insurance/${id}`}
    mutate={mutate}
  />
);

export default CreateInsurancePopup;
