"use client";

import useSWR from "swr";
import Table from "../../UI/Table";
import classes from "./AdminManageOldBlogsPage.module.css";
import { IOldBlog } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";
import FormatDate from "@/Components/UI/FormatDate";

const AdminManageOldBlogsPage = () => {
  const { data, error } = useSWR<IOldBlog[]>(`${API}/old/blog`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="AdminManageOldBlogs"
          renderer={{
            _id: { name: "آی دی", value: (node) => node._id, filter: "Text" },
            publishedAt: {
              name: "تاریخ انتشار",
              value: (node) =>
                node.publishedAt ? new Date(node.publishedAt) : "",
              component: (node) => <FormatDate value={node.publishedAt} />,
            },
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            slug: { name: "اسلاگ", value: (node) => node.slug, filter: "Text" },
            summary: {
              name: "خلاصه",
              value: (node) => node.summary,
              filter: "Text",
            },
            content: { name: "محتوا", value: (node) => node.mainContent },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldBlogsPage;
