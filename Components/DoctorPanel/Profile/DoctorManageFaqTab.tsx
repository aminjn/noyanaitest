import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import MutateDoctorFaqPopup from "./MutateDoctorFaqPopup";
import Table from "@/Components/Admin/UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteDoctorFaqPopup from "./DeleteDoctorFaqPopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

export type DoctorFaqPopulation = Population<{
  Doctor: DoctorProfilePopulation;
}>;
export interface IDoctorFaq<T extends DoctorFaqPopulation = DoctorFaqPopulation>
  extends MongoDoc {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  question: string;
  answer: string;
  active: boolean;
  order: number;
}

const DoctorManageFaqTab = () => {
  const { data, error, mutate } = useSWR<IDoctorFaq[]>(
    `${API}/doctor/faq`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          style={{ boxShadow: "none" }}
          title={getContent("faqs")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "MutateDoctorFaq",
                  <MutateDoctorFaqPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="DoctorManageFaqs"
            renderer={{
              question: {
                name: getContent("question"),
                value: (node) => node.question,
                filter: "Text",
              },
              answer: {
                name: getContent("answer"),
                value: (node) => node.answer,
                filter: "Text",
              },
              active: {
                name: getContent("isActive"),
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              order: {
                name: getContent("order"),
                value: (node) => node.order,
                filter: "Number",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateDoctorFaqPopup",
                          <MutateDoctorFaqPopup node={node} mutate={mutate} />
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorFaq",
                          <DeleteDoctorFaqPopup node={node} mutate={mutate} />
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

export default DoctorManageFaqTab;
