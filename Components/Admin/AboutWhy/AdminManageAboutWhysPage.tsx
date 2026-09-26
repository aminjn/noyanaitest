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
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";

export const aboutWhyElems = ["Why", "Principle"] as const;

export type AboutWhyElem = (typeof aboutWhyElems)[number];

const aboutWhyElemDict: Record<AboutWhyElem, string> = {
  Principle: "ارزش",
  Why: "چرا",
};

export type AboutWhyPopulation = Population<Record<never, never>>;

export interface IAboutWhy<
  T extends AboutWhyPopulation = AboutWhyPopulation,
> extends MongoDoc {
  title?: string;
  content?: string;
  image?: string;
  isActive: boolean;
  order: number;
  elem: AboutWhyElem;
}

export const aboutWhyFormRenderer: FormRenderer<IAboutWhy> = {
  title: { type: "text", title: "عنوان" },
  order: { type: "number", title: "رتبه" },
  elem: { type: "select", title: "قسمت", options: aboutWhyElemDict },
  content: { type: "text", title: "توضیحات" },
  image: { title: "تصویر", type: "image" },
  isActive: { type: "bool", title: "فعال" },
};

const AdminManageAboutWhysPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IAboutWhy>
      title="درباره چرا"
      create={aboutWhyFormRenderer}
      modelName="aboutWhy"
      table={({ mutate }) => ({
        title: { name: "عنوان", value: (node) => node.title, filter: "Text" },
        elem: {
          name: "قسمت",
          value: (node) => aboutWhyElemDict[node.elem],
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
              modelName="aboutWhy"
              mutate={mutate}
            />
          ),
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/aboutWhy/${node._id}`)} title="ویرایش">
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      mutate={mutate}
                      modelName="aboutWhy"
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
    />
  );
};

export default AdminManageAboutWhysPage;
