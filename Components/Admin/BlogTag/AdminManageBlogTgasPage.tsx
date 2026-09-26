"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";

export type BlogTagPopulation = Population<Record<never, never>>;

export interface IBlogTag<
  T extends BlogTagPopulation = BlogTagPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  hot: boolean;
}

export const blogTagFormRenderer: FormRenderer<IBlogTag> = {
  name: { title: "نام", type: "text" },
  isActive: { title: "فعال", type: "bool" },
  order: { title: "رتبه", type: "number" },
  hot: { title: "داغ", type: "bool" },
};

const AdminManageBlogTagsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBlogTag>
      modelName="blogTag"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        hot: {
          name: "داغ",
          value: (node) => booleanToValue[`${node.hot}`],
          component: (node) => <BooleanToIcon value={node.hot} />,
          filter: "Set",
        },
        order: {
          name: "رتبه",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="blogTag"
              value={node.order}
              mutate={mutate}
              _id={node._id}
            />
          ),
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/blogTag/${node._id}`)} title="ویرایش">
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      modelName="blogTag"
                      mutate={mutate}
                      nodeId={node._id}
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
      title="تگ بلاگ"
      create={blogTagFormRenderer}
    />
  );
};

export default AdminManageBlogTagsPage;
