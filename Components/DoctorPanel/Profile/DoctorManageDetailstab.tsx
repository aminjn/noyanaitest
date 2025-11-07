import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useDoctor from "@/Components/Hooks/useDoctor";
import useForm from "@/Components/Hooks/useForm";
import useLocale from "@/Components/Hooks/useLocale";
import { IDoctorProfile } from "../DoctorPanelPage";
import { provinceOptions } from "@/Components/Enums/Provinces";
import { cityOptions } from "@/Components/Enums/Cities";

const DoctorManageDetailsTab = () => {
  const { doctor, mutate } = useDoctor();
  const form = useForm<IDoctorProfile>({
    path: `${API}/doctor/profile`,
    method: "POST",
    successCb: () => {
      mutate();
    },
  });

  const getContent = useLocale();

  return (
    <HandleLoading data={!!doctor}>
      {!!doctor && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={doctor}
          hookProvided={form}
          renderer={{
            introduction: { type: "area", title: getContent("introduction") },
            services: { type: "strings", title: getContent("services") },
            achivements: { type: "strings", title: getContent("achivemets") },
            website: { type: "text", title: getContent("website") },
            landLine: { type: "text", title: getContent("landLine") },
            address: { type: "text", title: getContent("address") },
            province: {
              type: "select",
              title: getContent("province"),
              options: provinceOptions,
            },
            city: {
              type: "select",
              title: getContent("city"),
              options: cityOptions(form.input.province || doctor.province),
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorManageDetailsTab;
