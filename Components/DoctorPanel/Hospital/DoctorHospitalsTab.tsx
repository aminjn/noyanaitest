import useSWR, { mutate } from "swr";
import classes from "./DoctorHospitalsTab.module.css";
import { IHospitalDoctor } from "@/Components/Admin/Hospital/AdminManageHospitalsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import TableBox from "@/Components/UI/TableBox";
import Table from "@/Components/Admin/UI/Table";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useLocale from "@/Components/Hooks/useLocale";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import UnjoinHospitalPopup from "./UnjoinHospitalPopup";

const DoctorHospitalsTab = () => {
  const { data, error, mutate } = useSWR<
    IHospitalDoctor<{
      HospitalPopulated: Record<string, never>;
      DepartmentPopulated: Record<string, never>;
    }>[]
  >(`${API}/doctor/hospital`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox title={getContent("hospitalsList")}>
          <Table
            data={data}
            name="DoctorManageHospitals"
            renderer={{
              name: {
                name: getContent("hospitalName"),
                value: (node) => node.hospital?.name,
                filter: "Text",
                component: (node) =>
                  node.hospital ? (
                    <InlineLink
                      target="_blank"
                      href={`/hospital/${node.hospital.slug || node.hospital._id}`}
                    >
                      {node.hospital.name}
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
                          "UnjoinHospital",
                          <UnjoinHospitalPopup mutate={mutate} node={node} />
                        )
                      }
                    >
                      <GarbageIcon />
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

export default DoctorHospitalsTab;
