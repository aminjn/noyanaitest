"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { MongoDoc } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateShortLinkPopup from "./MutateShortLinkPopup";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeletShortLinkPopup from "./DeleteShortLinkPopup";

export interface IShortLink extends MongoDoc {
  token: string;
  target: string;
}

const AdminManageShortLinksPage = () => {
  const { data, error, mutate } = useSWR<IShortLink[]>(
    `${API}/auto/shortlink`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="لینک های کوتاه"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateShortLink",
                  <MutateShortLinkPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="AdminManageShortLinks"
            data={data}
            renderer={{
              target: {
                name: "مقصد",
                filter: "Text",
                value: (node) => node.target,
              },
              token: {
                name: "توکن",
                value: (node) => node.token,
                filter: "Text",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateShortLink",
                          <MutateShortLinkPopup mutate={mutate} node={node} />
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteShortLink",
                          <DeletShortLinkPopup mutate={mutate} node={node} />
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

export default AdminManageShortLinksPage;
