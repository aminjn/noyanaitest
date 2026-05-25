import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import classes from "./PatientProfilesTab.module.css";
import Button from "@/Components/UI/Button";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "@/Components/Admin/UI/Table";
import useSWR from "swr";
import { IPatientProfile } from "../../Patient/PatientFiles";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import Ixon from "@/Components/UI/Ixon";
import LinkAltIcon from "@/Components/Icons/LinkAltIcon";
import FileIcon from "@/Components/Icons/FileIcon";
import EditAltIcon from "@/Components/Icons/EditAltIcon";
import { PrescriptionCtx } from "../PrescriptionContext";
import PatientProfileOverviewPopup from "./PatientProfileOverviewPopup";
const PatientProfilesTab = ({ ctx }: { ctx: PrescriptionCtx }) => {
  const { patient, setProfile } = ctx;

  const { data, error } = useSWR<
    IPatientProfile<{ Doctor: Record<never, never> }>[]
  >(
    patient ? `${API}/doctor/presc/patient/${patient._id}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.profiles),
  );

  const getContent = useLocale();

  const { setPopup, closePopup } = usePopup();

  return (
    <div className={classes.main}>
      <Button className={classes.new} tailIcon={<EditAltIcon />}>
        {getContent("newMedicalProfile")}
      </Button>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <Table
            data={data}
            name="DoctorManagePrescPatientProfiles"
            renderer={{
              doctor: {
                name: getContent("treatingDoctor"),
                value: (node) => getDoctorProfileLabel(node.doctor),
                filter: "Multi",
              },
              title: {
                name: getContent("patinetProfileTitle"),
                value: (node) => node.title,
                filter: "Text",
              },
              createdAt: {
                name: getContent("patientProfileCreatedAt"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
                component: (node) => (
                  <FormatDate value={new Date(node.createdAt)} />
                ),
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={getContent("attachToThisPrescription")}
                      onClick={() => {
                        setProfile(node);
                        closePopup();
                      }}
                    >
                      <LinkAltIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "PatientProfileOverview",
                          <PatientProfileOverviewPopup
                            ctx={ctx}
                            profile={node}
                          />,
                        )
                      }
                    >
                      <FileIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        )}
      </HandleLoading>
    </div>
  );
};

export default PatientProfilesTab;
