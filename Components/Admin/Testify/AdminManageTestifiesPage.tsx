"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import usePopup from "@/Components/Hooks/usePopup";
import { FormRenderer } from "../UI/CreateForm";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type TestifyPopulation = Population<Record<never, never>>;

export interface ITestify<
  T extends TestifyPopulation = TestifyPopulation,
> extends MongoDoc {
  name?: string;
  image?: string;
  title?: string;
  content?: string;
  isActive: boolean;
  order: number;
}

export const testifyFormRenderer: FormRenderer<ITestify> = {
  name: { type: "text", get title() {
  return ta("نام");
} },
  order: { type: "number", get title() {
  return ta("رتبه");
} },
  isActive: { type: "bool", get title() {
  return ta("فعال");
} },
  title: { type: "text", get title() {
  return ta("عنوان");
} },
  image: { type: "image", get title() {
  return ta("تصویر");
} },
  content: { type: "area", get title() {
  return ta("نظر");
} },
};

const AdminManageTestifiesPage = () => {
  const { setPopup } = usePopup();
  return (
    <NodesManager<ITestify>
      create={testifyFormRenderer}
      modelName="testify"
      table={({ mutate }) => ({
        name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
        title: { name: ta("عنوان"), value: (node) => node.title, filter: "Text" },
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
              _id={node._id}
              value={node.order}
              mutate={mutate}
              modelName="testify"
            />
          ),
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/testify/${node._id}`)}
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
                      mutate={mutate}
                      nodeId={node._id}
                      modelName="testify"
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
      title={ta("تستیفای")}
    />
  );
};

export default AdminManageTestifiesPage;
