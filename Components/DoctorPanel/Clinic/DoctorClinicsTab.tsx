import useSWR, { mutate } from "swr";
import classes from "./DoctorClinicsTab.module.css";
import { IClinicDoctor } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import TableBox from "@/Components/UI/TableBox";
import Table from "@/Components/Admin/UI/Table";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import UnjoinClinicPopup from "./UnjoinClinicPopup";
import { CentreSplitCell, CentreSplitOffers } from "../_UI/CentreSplitCell";
import { InsurerSplit } from "@/Components/_Common/CenterDoctors/useCenterDoctors";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelClinic"];

const DoctorClinicsTab = () => {
  const { data, error, mutate } = useSWR<
    IClinicDoctor<{
      ClinicPopulated: Record<string, never>;
      DepartmentPopulated: Record<string, never>;
    }>[]
  >(`${API}/doctor/clinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          {/* the centres' proposed shares of the insurers' payments */}
          <CentreSplitOffers
            kind="clinic"
            items={(Array.isArray(data) ? data : []).map((m) => ({
              _id: m._id,
              centreName: m.clinic?.name,
              insurerSplit: (m as { insurerSplit?: InsurerSplit | null })
                .insurerSplit,
            }))}
            onChanged={() => mutate()}
          />
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
                // the centre's share of the insurers' payments (accept a change)
                insurerSplit: {
                  name: getContent("cisTitle"),
                  component: (node) => (
                    <CentreSplitCell
                      kind="clinic"
                      split={
                        (node as { insurerSplit?: InsurerSplit | null })
                          .insurerSplit
                      }
                    />
                  ),
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
                            <UnjoinClinicPopup mutate={mutate} node={node} />,
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
        </>
      )}
    </HandleLoading>
  );
};

export default DoctorClinicsTab;
