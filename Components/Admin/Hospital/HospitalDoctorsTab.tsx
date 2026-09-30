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
import { ta } from "@/Components/Admin/i18n/adminText";

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
          title={ta("پزشکان")}
          actions={[
            {
              title: ta("جدید"),
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
                name: ta("پزشک"),
                value: (node) =>
                  node.doctor ? getDoctorProfileLabel(node.doctor) : ta("حذف شده"),
                filter: "Text",
                component: (node) =>
                  node.doctor ? (
                    <InlineLink href={adminPath(`/doctorprofile/${node.doctor._id}`)}>
                      {getDoctorProfileLabel(node.doctor)}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
              },
              department: {
                name: ta("بخش"),
                value: (node) =>
                  node.department
                    ? node.department.name || node.department._id
                    : ta("ندارد"),
                filter: "Multi",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
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
                      title={ta("حذف")}
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
