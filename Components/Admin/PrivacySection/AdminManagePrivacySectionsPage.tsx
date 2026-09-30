"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import usePopup from "@/Components/Hooks/usePopup";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export const privacySectionpages = ["Privacy", "Policy"] as const;

export type PrivacySectionPage = (typeof privacySectionpages)[number];

export const privacySectionPageDict: Record<PrivacySectionPage, string> = {
  get Policy() {
  return ta("مقررات");
},
  get Privacy() {
  return ta("خریم خصوصی");
},
};

export type PrivacySectionPopulation = Population<Record<never, never>>;

export interface IPrivacySection<
  T extends PrivacySectionPopulation = PrivacySectionPopulation,
> extends MongoDoc {
  title?: string;
  content?: string;
  isActive: boolean;
  order: number;
  page: PrivacySectionPage;
}

export const privacySectionFormRenderer: FormRenderer<IPrivacySection> = {
  title: { type: "text", get title() {
  return ta("عنوان");
} },
  content: { type: "area", get title() {
  return ta("محتوا");
} },
  order: { type: "number", get title() {
  return ta("رتبه");
} },
  isActive: { type: "bool", get title() {
  return ta("فعال");
} },
  page: { type: "select", options: privacySectionPageDict, get title() {
  return ta("صفحه");
} },
};

const AdminManagePrivacySectionsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IPrivacySection>
      modelName="privacySection"
      title={ta("بخش های مقررات")}
      create={privacySectionFormRenderer}
      table={({ mutate }) => ({
        title: { name: ta("عنوان"), value: (node) => node.title, filter: "Text" },
        page: {
          name: ta("صفحه"),
          value: (node) => privacySectionPageDict[node.page],
          filter: "Set",
        },
        isActive: {
          name: ta("وضعیت"),
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: {
          name: ta("رتبه"),
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              value={node.order}
              _id={node._id}
              modelName="privacySection"
              mutate={mutate}
            />
          ),
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/privacy/${node._id}`)}
                title={ta("ویرایش")}
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title={ta("حذف")}
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      nodeId={node._id}
                      modelName="privacySection"
                      mutate={mutate}
                    />,
                  )
                }
              >
                <GarbageIcon />
              </IconButton>
            </TableActions>
          ),
        },
      })}
    />
  );
};

export default AdminManagePrivacySectionsPage;
