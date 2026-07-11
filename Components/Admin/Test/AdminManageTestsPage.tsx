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
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";

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
  name: { type: "text", title: "نام" },
  isActive: { type: "bool", title: "فعال" },
  order: { type: "number", title: "رتبه" },
  category: {
    type: "nodes",
    title: "دسته بندی",
    getOptionLabel: (node) =>
      (node as ITestCategory).name || (node as ITestCategory)._id,
    getOptionValue: (node) => (node as ITestCategory)._id,
    path: `${API}/auto/testCategory`,
    multi: false,
    getDefaultValue: (inp) => inp.category,
  },
  slug: { type: "text", title: "اسلاگ" },
  summary: { type: "text", title: "حلاصه" },
};

const AdminManageTestsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<ITest>
      modelName="test"
      create={testFormRenderer}
      title="تست ها"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: { name: "رتبه", value: (node) => node.order, filter: "Number" },
        slug: { name: "اسلاگ", value: (node) => node.slug },
        actions: {
          name: "غملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/test/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
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
