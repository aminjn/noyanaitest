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
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteInlineAdPopup from "./DeleteInlineAdPopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

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

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("تبلیغات خطی")}
          actions={
            hasAccess("InlineAdvertisement", "write")
              ? [
                  {
                    title: ta("جدید"),
                    action: () =>
                      setPopup(
                        "CreateInlineAd",
                        <CreateInlineAdPopup mutate={mutate} />
                      ),
                  },
                ]
              : undefined
          }
        >
          <Table
            name="AdminManageInlineAds"
            data={data}
            renderer={{
              name: {
                name: ta("نام"),
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/inlinead/${node._id}`)}>
                    {node.name}
                  </InlineLink>
                ),
                value: (node) => node.name,
              },
              title: {
                name: ta("عنوان"),
                filter: "Text",
                value: (node) => node.title,
              },
              target: {
                name: ta("مقصد"),
                value: (node) => node.target,
                filter: "Text",
              },
              active: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
                filter: "Set",
              },
              expiration: {
                name: ta("تاریخ انقضا"),
                value: (node) =>
                  node.expiration ? new Date(node.expiration) : undefined,
                filter: "Date",
              },
              createdAt: {
                name: ta("تاریخ ایجاد"),
                value: (node) =>
                  node.createdAt ? new Date(node.createdAt) : undefined,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {hasAccess("InlineAdvertisement", "readOne") && (
                      <IconLink
                        title={ta("ویرایش")}
                        variant="Info"
                        href={adminPath(`/inlinead/${node._id}`)}
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("InlineAdvertisement", "delete") && (
                      <IconButton
                        title={ta("حذف")}
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleteInlineAd",
                            <DeleteInlineAdPopup node={node} mutate={mutate} />
                          )
                        }
                      >
                        <GarbageIcon />
                      </IconButton>
                    )}
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
