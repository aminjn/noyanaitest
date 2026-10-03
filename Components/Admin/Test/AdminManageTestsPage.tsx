"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import {
  ITestCategory,
  TestCategoryPopulation,
} from "../TestCategory/AdminManageTestCategoriesPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import usePopup from "@/Components/Hooks/usePopup";
import WithTitle from "../UI/WithTitle";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import { Fragment } from "react";
import CreateShitPopup from "../UI/CreateShitPopup";
import NodesManager from "../UI/NodesManager";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type TestPopulation = Population<{ Category: TestCategoryPopulation }>;

export interface ITest<
  T extends TestPopulation = TestPopulation,
> extends MongoDoc {
  name?: string;
  order: number;
  isActive: boolean;
  slug?: string;
  category?: T["Category"] extends TestCategoryPopulation
    ? ITestCategory<T["Category"]>
    : string;
  summary?: string;
}

export const testFormRenderer: FormRenderer<ITest> = {
  name: { type: "text", get title() {
  return ta("نام");
} },
  isActive: { type: "bool", get title() {
  return ta("فعال");
} },
  order: { type: "number", get title() {
  return ta("رتبه");
} },
  category: {
    type: "nodes",
    get title() {
  return ta("دسته بندی");
},
    getOptionLabel: (node) =>
      (node as ITestCategory).name || ta("بدون نام"),
    getOptionValue: (node) => (node as ITestCategory)._id,
    path: `${API}/auto/testCategory`,
    creatable: { path: `${API}/auto/testCategory` },
    multi: false,
    getDefaultValue: (inp) => inp.category,
  },
  summary: { type: "text", get title() {
  return ta("خلاصه");
} },
};

const AdminManageTestsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<ITest>
      modelName="test"
      create={testFormRenderer}
      title={ta("تست ها")}
      table={({ mutate }) => ({
        name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
        isActive: {
          name: ta("فعال"),
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
              modelName="test"
            />
          ),
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/test/${node._id}`)} title={ta("ویرایش")}>
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
                      modelName="test"
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

export default AdminManageTestsPage;
