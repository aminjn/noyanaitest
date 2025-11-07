"use client";

import useSWR from "swr";
import { ISymptom } from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import usePopup from "@/Components/Hooks/usePopup";
import WithTitle from "../UI/WithTitle";
import CreateSymptomPopup from "./CreateSymptomPopup";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import DeleteSymptomPopup from "./DeleteSymptomPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";

const AdminManageSymptomsPage = () => {
  const { data, error, mutate } = useSWR<ISymptom[]>(
    `${API}/auto/symptom`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="علائم"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateSymptom",
                  <CreateSymptomPopup mutate={mutate} />
                ),
            },
          ]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageSymptoms"
              renderer={{
                name: {
                  name: "نام",
                  value: (node) => node.name,
                  filter: "Text",
                },
                order: {
                  name: "رتبه",
                  value: (node) => node.order,
                  filter: "Number",
                },
                slug: {
                  name: "اسلاگ",
                  value: (node) => node.slug,
                  filter: "Text",
                },
                actions: {
                  name: "عملیات",
                  component: (node) => (
                    <TableActions>
                      <IconLink href={adminPath(`/symptom/${node._id}`)}>
                        <EditIcon />
                      </IconLink>
                      <IconButton
                        onClick={() =>
                          setPopup(
                            "DeleteSymptom",
                            <DeleteSymptomPopup node={node} mutate={mutate} />
                          )
                        }
                        variant="Danger"
                      >
                        <GarbageIcon />
                      </IconButton>
                    </TableActions>
                  ),
                },
              }}
            />
          )}
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSymptomsPage;
