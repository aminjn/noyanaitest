"use client";

import useSWR from "swr";
import {
  genderSpecificOptionsDict,
  ISymptom,
} from "../Disease/AdminManageDiseasesPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import usePopup from "@/Components/Hooks/usePopup";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import DeleteSymptomPopup from "./DeleteSymptomPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";
import PublishToggle from "../UI/PublishToggle";
import { booleanToValue } from "@/Components/UI/BooleanToIcon";
import useProgress from "@/Components/Hooks/useProgress";

const AdminManageSymptomsPage = () => {
  const { data, error, mutate } = useSWR<ISymptom[]>(
    `${API}/auto/symptom`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("علائم")}
          actions={[
            {
              title: ta("جدید"),
              action: () => push(adminPath("/symptom/new")),
            },
          ]}
        >
          {!!data && (
            <Table
              data={data}
              name="AdminManageSymptoms"
              renderer={{
                name: {
                  name: ta("نام"),
                  value: (node) => node.name,
                  filter: "Text",
                },
                order: {
                  name: ta("ترتیب"),
                  value: (node) => node.order,
                  filter: "Number",
                  component: (node) => (
                    <OrderEditor
                      _id={node._id}
                      value={node.order}
                      mutate={mutate}
                      modelName="symptom"
                    />
                  ),
                },
                genderSpecific: {
                  name: ta("جنسیت"),
                  value: (node) =>
                    node.genderSpecific
                      ? genderSpecificOptionsDict[node.genderSpecific]
                      : undefined,
                  filter: "Set",
                },
                // on the site or hidden, switched right here
                published: {
                  name: ta("منتشرشده"),
                  value: (node) => booleanToValue[`${node.published !== false}`],
                  filter: "Set",
                  component: (node) => (
                    <PublishToggle
                      modelName="symptom"
                      _id={node._id}
                      value={node.published !== false}
                      mutate={mutate}
                    />
                  ),
                },
                reviewed: {
                  name: ta("بازبینی پزشکی"),
                  value: (node) => (node.reviewedBy ? ta("دارد") : ta("ندارد")),
                  filter: "Set",
                },
                actions: {
                  name: ta("عملیات"),
                  component: (node) => (
                    <TableActions>
                      <IconLink
                        href={adminPath(`/symptom/${node._id}`)}
                        title={ta("ویرایش")}
                      >
                        <EditIcon />
                      </IconLink>
                      <IconButton
                        variant="Danger"
                        title={ta("حذف")}
                        onClick={() =>
                          setPopup(
                            "DeleteSymptom",
                            <DeleteSymptomPopup node={node} mutate={mutate} />,
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
          )}
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSymptomsPage;
