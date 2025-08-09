import useSWR, { mutate } from "swr";
import classes from "./DoctorClinicsTab.module.css";
import { IClinicDoctor } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import TableBox from "@/Components/UI/TableBox";
import Table from "@/Components/Admin/UI/Table";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import UnjoinClinicPopup from "./UnjoinClinicPopup";

const DoctorClinicsTab = () => {
  const { data, error, mutate } = useSWR<
    IClinicDoctor<{
      ClinicPopulated: Record<string, never>;
      DepartmentPopulated: Record<string, never>;
    }>[]
  >(`${API}/doctor/clinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox title={getContent("clinicsList")}>
          <Table
            data={data}
            name="DoctorManageClinics"
            renderer={{
              name: {
                name: getContent("clinicName"),
                value: (node) => node.clinic?.name,
                filter: "Text",
                component: (node) =>
                  node.clinic ? (
                    <InlineLink
                      target="_blank"
                      href={`/clinic/${node.clinic.slug || node.clinic._id}`}
                    >
                      {node.clinic.name}
                    </InlineLink>
                  ) : (
                    "-"
                  ),
              },
              department: {
                name: getContent("department"),
                value: (node) =>
                  node.department?.name || getContent("noDepartment"),
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "UnjoinClinic",
                          <UnjoinClinicPopup mutate={mutate} node={node} />
                        )
                      }
                    >
                      <Garbageicon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default DoctorClinicsTab;
