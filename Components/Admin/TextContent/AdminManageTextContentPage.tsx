"use client";
import { MongoDoc } from "@/Components/Hooks/useUser";
import classes from "./AdminManageTextContentPage.module.css";
import { ContentKey } from "@/Components/Enums/contentKeys";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import { useMemo } from "react";
import Table from "../UI/Table";
import EditTextContentAgent from "./EditTextContentAgent";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

export type ITextContent = MongoDoc & { [key in ContentKey]: string };

// const LocationDict: Record<Location, string> = {
//   header: "هدر",
//   general: "عمومی",
//   doctorPanel: "داشبور پزشک",
// };

const readOnlyKeys = ["singleton", "_id", "__v"];

const AdminManageTextContentPage = () => {
  const { data, error, mutate } = useSWR<ITextContent>(
    `${API}/auto/textcontent`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const ready = useMemo<{ key: string; val: string }[] | null>(() => {
    if (!data) return null;
    return Object.entries(data)
      .map(([key, val]) => ({
        key,
        val,
        // location: locationMap[key as ContentKey],
      }))
      .filter(({ key }) => !readOnlyKeys.includes(key));
  }, [data]);

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!ready} error={error}>
      {!!ready && (
        <Table
          data={ready}
          renderer={{
            key: {
              name: "کلید",
              value: (node) => node.key,
              filter: "Text",
            },
            // location: {
            //   name: "مکان",
            //   value: (node) => LocationDict[node.location],
            //   filter: "Multi",
            // },
            val: {
              name: "مقدار",
              value: (node) => node.val,
              filter: "Text",
              component: (node) => (
                <EditTextContentAgent
                  readOnly={!hasAccess("TextContent", "update")}
                  mutate={mutate}
                  kay={node.key}
                  value={node.val}
                />
              ),
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageTextContentPage;
