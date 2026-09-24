import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import Table from "../Admin/UI/Table";
import WithTitle from "../Admin/UI/WithTitle";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import usePopup from "../Hooks/usePopup";
import { IUserVital } from "../Hooks/useUser";
import FormatDate from "../UI/FormatDate";
import AddVitalPopup from "./AddVitalPopup";

const NS: ContentNamespace[] = ["common", "dashboardVitalList"];

const VitalList = ({
  vitals,
  patient,
  mutate,
}: {
  vitals: IUserVital<{ Author: Record<never, never> }>[];
  patient?: string;
  mutate?: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  return (
    <WithTitle
      title={getContent("vitals")}
      actions={
        patient
          ? [
              {
                title: getContent("addVitals"),
                action: () =>
                  setPopup(
                    "AddVital",
                    <AddVitalPopup patient={patient} mutate={mutate} />
                  ),
              },
            ]
          : []
      }
    >
      <Table
        data={vitals}
        name={`${patient ? "Doctor" : "User"}ManageVitals`}
        renderer={{
          createdAt: {
            name: getContent("createdAt"),
            value: (node) => new Date(node.createdAt),
            component: (node) => <FormatDate value={node.createdAt} />,
            filter: "Date",
          },
          author: {
            name: getContent("doctor"),
            value: (node) => getDoctorProfileLabel(node.author),
            filter: "Text",
          },
          bloodOxygen: {
            name: getContent("bloodOxygen"),
            value: (node) => node.bloodOxygen,
            filter: "Number",
          },
          bloodPressure: {
            name: getContent("bloodPressure"),
            value: (node) => node.bloodPressure,
            filter: "Number",
          },
          bodyTemp: {
            name: getContent("bodyTemperature"),
            value: (node) => node.bodyTemp,
            filter: "Number",
          },
          heartRate: {
            name: getContent("heartRate"),
            value: (node) => node.heartRate,
            filter: "Number",
          },
        }}
      />
    </WithTitle>
  );
};

export default VitalList;
