import useSWR, { mutate } from "swr";
import classes from "./DoctorHospitalsTab.module.css";
import { IHospitalDoctor } from "@/Components/Admin/Hospital/AdminManageHospitalsPage";
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
import UnjoinHospitalPopup from "./UnjoinHospitalPopup";
import { CentreSplitCell, CentreSplitOffers } from "../_UI/CentreSplitCell";
import { InsurerSplit } from "@/Components/_Common/CenterDoctors/useCenterDoctors";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelHospital"];

const DoctorHospitalsTab = () => {
  const { data, error, mutate } = useSWR<
    IHospitalDoctor<{
      HospitalPopulated: Record<string, never>;
      DepartmentPopulated: Record<string, never>;
    }>[]
  >(`${API}/doctor/hospital`, (url: string) =>
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
            kind="hospital"
            items={(Array.isArray(data) ? data : []).map((m) => ({
              _id: m._id,
              centreName: m.hospital?.name,
              insurerSplit: (m as { insurerSplit?: InsurerSplit | null })
                .insurerSplit,
            }))}
            onChanged={() => mutate()}
          />
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
                // the centre's share of the insurers' payments (accept a change)
                insurerSplit: {
                  name: getContent("cisTitle"),
                  component: (node) => (
                    <CentreSplitCell
                      kind="hospital"
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
                            "UnjoinHospital",
                            <UnjoinHospitalPopup mutate={mutate} node={node} />,
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

export default DoctorHospitalsTab;
