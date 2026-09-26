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

export const privacySectionpages = ["Privacy", "Policy"] as const;

export type PrivacySectionPage = (typeof privacySectionpages)[number];

export const privacySectionPageDict: Record<PrivacySectionPage, string> = {
  Policy: "مقررات",
  Privacy: "خریم خصوصی",
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
  title: { type: "text", title: "عنوان" },
  content: { type: "area", title: "محتوا" },
  order: { type: "number", title: "رتبه" },
  isActive: { type: "bool", title: "فعال" },
  page: { type: "select", options: privacySectionPageDict, title: "صفحه" },
};

const AdminManagePrivacySectionsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IPrivacySection>
      modelName="privacySection"
      title="بخش های مقررات"
      create={privacySectionFormRenderer}
      table={({ mutate }) => ({
        title: { name: "عنوان", value: (node) => node.title, filter: "Text" },
        page: {
          name: "صفحه",
          value: (node) => privacySectionPageDict[node.page],
          filter: "Set",
        },
        isActive: {
          name: "وضعیت",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: {
          name: "رتبه",
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
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/privacy/${node._id}`)}
                title="ویرایش"
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
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
