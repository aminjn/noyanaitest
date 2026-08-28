"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import FormatDate from "@/Components/UI/FormatDate";

export type BlogRRSPopulation = Population<Record<never, never>>;

export interface IBlogRRS<
  T extends BlogRRSPopulation = BlogRRSPopulation,
> extends MongoDoc {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminManageBlogRRSsPage = () => {
  return (
    <NodesManager<IBlogRRS>
      modelName="blogRrs"
      table={() => ({
        email: { name: "ایمیل", value: (node) => node.email, filter: "Text" },
        createdAt: {
          name: "ثبت شده در",
          value: (node) => new Date(node.createdAt),
          component: (node) => <FormatDate value={node.createdAt} />,
          filter: "Date",
        },
      })}
      title="عصویت در خبرنامه"
    />
  );
};

export default AdminManageBlogRRSsPage;
