"use client";

import useSWR from "swr";
import Table from "../../UI/Table";
import classes from "./AdminManageOldBlogsPage.module.css";
import { IOldBlog } from "../Doctor/AdminManageOldDoctorsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../../UI/HandleLoading";

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
            name: { name: "نام", value: (node) => node.name, filter: "Text" },
            publishedAt: {
              name: "تاریخ انتشار",
              value: (node) =>
                node.publishedAt ? new Date(node.publishedAt) : undefined,
              filter: "Date",
            },
            _id: { name: "شناسه", value: (node) => node._id, filter: "Text" },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageOldBlogsPage;
