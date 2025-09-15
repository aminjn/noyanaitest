import useSWR from "swr";
import classes from "./ClinicDoctorsTab.module.css";
import { IClinic, IClinicDoctor } from "./AdminManageClinicsPage";
import { API } from "@/Components/config";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateClinicDoctorPopup from "./MutateClinicDoctorPopup";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { fetcher } from "@/Components/helpers/fetcher";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteClinicDoctorPopup from "./DeleteClinicDoctorPopup";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";

const ClinicDoctorsTab = ({ clinic }: { clinic: IClinic }) => {
  const { data, error, mutate } = useSWR<
    IClinicDoctor<{
      DepartmentPopulated: Record<string, never>;
      DoctorPopulated: Record<string, never>;
    }>[]
  >(`${API}/auto/clinicdoctor?clinic=${clinic._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={`پزشکان ${clinic.name || clinic._id}`}
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateClinicDoctor",
                  <MutateClinicDoctorPopup mutate={mutate} clinic={clinic} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageClinicDoctors"
            renderer={{
              doctor: {
                name: "پزشک",
                value: (node) =>
                  node.doctor ? getDoctorProfileLabel(node.doctor) : "حذف شده",
                filter: "Text",
                component: (node) =>
                  node.doctor ? (
                    <InlineLink href={adminPath(`/doctor/${node.doctor._id}`)}>
                      {getDoctorProfileLabel(node.doctor)}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
              },
              department: {
                name: "دپارتمان",
                value: (node) =>
                  node.department
                    ? node.department.name || node.department._id
                    : "ندارد",
                filter: "Multi",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateClinicDoctor",
                          <MutateClinicDoctorPopup
                            mutate={mutate}
                            node={node}
                            clinic={clinic}
                          />
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteClinicDoctor",
                          <DeleteClinicDoctorPopup
                            mutate={mutate}
                            node={node}
                          />
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
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default ClinicDoctorsTab;
