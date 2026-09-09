import useSWR from "swr";
import classes from "./HospitalDoctorsTab.module.css";
import { IHospital, IHospitalDoctor } from "./AdminManageHospitalsPage";
import { API } from "@/Components/config";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateHospitalDoctorPopup from "./MutateHospitalDoctorPopup";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { fetcher } from "@/Components/helpers/fetcher";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteHospitalDoctorPopup from "./DeleteHospitalDoctorPopup";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";

const HospitalDoctorsTab = ({ hospital }: { hospital: IHospital }) => {
  const { data, error, mutate } = useSWR<
    IHospitalDoctor<{
      DepartmentPopulated: Record<string, never>;
      DoctorPopulated: Record<string, never>;
    }>[]
  >(`${API}/auto/hospitaldoctor?hospital=${hospital._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={`پزشکان ${hospital.name || hospital._id}`}
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateHospitalDoctor",
                  <MutateHospitalDoctorPopup mutate={mutate} hospital={hospital} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageHospitalDoctors"
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
                          "MutateHospitalDoctor",
                          <MutateHospitalDoctorPopup
                            mutate={mutate}
                            node={node}
                            hospital={hospital}
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
                          "DeleteHospitalDoctor",
                          <DeleteHospitalDoctorPopup
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

export default HospitalDoctorsTab;
