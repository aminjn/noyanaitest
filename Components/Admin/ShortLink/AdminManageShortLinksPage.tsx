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
import { ta } from "@/Components/Admin/i18n/adminText";

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
          title={ta("لینک های کوتاه")}
          actions={[
            {
              title: ta("جدید"),
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
              token: {
                name: ta("توکن"),
                value: (node) => node.token,
                filter: "Text",
              },
              target: {
                name: ta("مقصد"),
                filter: "Text",
                value: (node) => node.target,
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
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
                      title={ta("حذف")}
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
