import CreateByNamePopup from "../UI/CreateByNamePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// asks for the doctor's first and last name first
// (Components/Admin/UI/CreateByNamePopup.tsx) - opening it no longer creates
// an empty doctor profile
const CreateDoctorProfilePopup = ({ mutate }: { mutate: () => unknown }) => (
  <CreateByNamePopup
    modelName="doctorprofile"
    title={ta("پزشک جدید")}
    fields={[
      { key: "firstName", title: ta("نام") },
      { key: "lastName", title: ta("نام خانوادگی") },
    ]}
    editPath={(id) => `/doctorprofile/${id}`}
    mutate={mutate}
  />
);

export default CreateDoctorProfilePopup;
