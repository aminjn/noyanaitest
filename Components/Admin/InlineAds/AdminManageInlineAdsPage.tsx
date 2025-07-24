"use client";

import useSWR from "swr";
import classes from "./AdminManageInlineAdsPage.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import CreateInlineAdPopup from "./CreateInlineAdPopup";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import DeleteInlineAdPopup from "./DeleteInlineAdPopup";

export interface IInlineAdvertisement extends MongoDoc {
  name?: string;
  expiration?: Date;
  target?: string;
  image?: string;
  title?: string;
  subTitle?: string;
  active: boolean;
  createdAt: Date;
}

const AdminManageInlineAdsPage = () => {
  const { data, error, mutate } = useSWR<IInlineAdvertisement[]>(
    `${API}/auto/inlinead`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="تبلیغات خطی"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "CreateInlineAd",
                  <CreateInlineAdPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="AdminManageInlineAds"
            data={data}
            renderer={{
              name: {
                name: "نام",
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/inlinead/${node._id}`)}>
                    {node.name}
                  </InlineLink>
                ),
                value: (node) => node.name,
              },
              title: {
                name: "عنوان",
                filter: "Text",
                value: (node) => node.title,
              },
              subTitle: {
                name: "توضیحات",
                filter: "Text",
                value: (node) => node.subTitle,
              },
              target: {
                name: "مقصد",
                value: (node) => node.target,
                filter: "Text",
              },
              active: {
                name: "فعال است؟",
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
                filter: "Set",
              },
              expiration: {
                name: "تاریخ انقضا",
                value: (node) =>
                  node.expiration ? new Date(node.expiration) : "",
                component: (node) =>
                  node.expiration ? <FormatDate value={node.expiration} /> : "",
                filter: "Date",
              },
              createdAt: {
                name: "تاریخ ایجاد",
                component: (node) => <FormatDate value={node.createdAt} />,
                value: (node) => new Date(node.createdAt),
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      variant="Info"
                      href={adminPath(`/inlinead/${node._id}`)}
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteInlineAd",
                          <DeleteInlineAdPopup node={node} mutate={mutate} />
                        )
                      }
                    >
                      <Garbageicon />
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

export default AdminManageInlineAdsPage;
