"use client";
import { MongoDoc } from "@/Components/Hooks/useUser";
import classes from "./AdminManageTextContentPage.module.css";
import { ContentKey } from "@/Components/Enums/contentKeys";
import {
  contentNamespaces,
  ContentNamespace,
} from "@/Components/Enums/contentNamespaces";
import { namespaceRoutes } from "@/Components/Enums/namespaceRoutes";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import { useMemo } from "react";
import Table from "../UI/Table";
import EditTextContentAgent from "./EditTextContentAgent";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import InlineLink from "../UI/InlineLink";

export type ITextContent = MongoDoc & { [key in ContentKey]: string };

// Reverse index of contentNamespaces: which namespace(s) a given key is
// scoped to. Built once at module load since contentNamespaces is static.
const keyNamespaces: Partial<Record<string, ContentNamespace[]>> = {};
(Object.keys(contentNamespaces) as ContentNamespace[]).forEach((ns) => {
  contentNamespaces[ns].forEach((key) => {
    (keyNamespaces[key] ??= []).push(ns);
  });
});

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

  const ready = useMemo<
    { key: string; val: string; scopes: ContentNamespace[] }[] | null
  >(() => {
    if (!data) return null;
    return Object.entries(data)
      .map(([key, val]) => ({
        key,
        val,
        scopes: keyNamespaces[key] || [],
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
            scopes: {
              name: "دامنه‌های استفاده",
              value: (node) =>
                node.scopes
                  .map((ns) => (ns === "common" ? "عمومی" : ns))
                  .join("، "),
              filter: "Text",
              component: (node) =>
                node.scopes.length ? (
                  <div className={classes.scopes}>
                    {node.scopes.flatMap((ns) => {
                      if (ns === "common") {
                        return (
                          <span key="common" className={classes.scopeTag}>
                            عمومی
                          </span>
                        );
                      }
                      const routes = namespaceRoutes[ns];
                      if (!routes?.length) {
                        return (
                          <span key={ns} className={classes.scopeTag}>
                            {ns}
                          </span>
                        );
                      }
                      return routes.map((route) => (
                        <InlineLink
                          key={`${ns}-${route}`}
                          href={route}
                          target="_blank"
                          className={classes.scopeTag}
                        >
                          {route}
                        </InlineLink>
                      ));
                    })}
                  </div>
                ) : (
                  <span className={classes.noScope}>—</span>
                ),
            },
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
              suppressKeyboardEvents: true,
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default AdminManageTextContentPage;
