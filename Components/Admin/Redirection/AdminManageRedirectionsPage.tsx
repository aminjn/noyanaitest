"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateRedirectionPopup from "./MutateRedirectionPopup";
import Table from "../UI/Table";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteRedirectionPopup from "./DeleteRedirectionPopup";

export const redirectionStatusCodes = [301, 307, 308] as const;

export type RedirectionStatusCode = (typeof redirectionStatusCodes)[number];

export interface IRedirection extends MongoDoc {
  old: string;
  current: string;
  statusCode: RedirectionStatusCode;
}

const AdminManageRedirectionsPage = () => {
  const { data, error, mutate } = useSWR<IRedirection[]>(
    `${API}/auto/redirection`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="انتقالات"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateRedirection",
                  <MutateRedirectionPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageRedirections"
            renderer={{
              old: { name: "قدیم", value: (node) => node.old, filter: "Text" },
              current: {
                name: "جدید",
                value: (node) => node.current,
                filter: "Text",
              },
              statusCode: {
                name: "کد",
                value: (node) => node.statusCode,
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateRedirection",
                          <MutateRedirectionPopup node={node} mutate={mutate} />
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleetRedirection",
                          <DeleteRedirectionPopup node={node} mutate={mutate} />
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageRedirectionsPage;
