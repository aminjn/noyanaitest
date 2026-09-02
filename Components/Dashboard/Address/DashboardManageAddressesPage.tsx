"use client";

import useSWR from "swr";
import classes from "./DashboardManageAddressesPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { MongoDoc } from "@/Components/Hooks/useUser";
import DashboardMutateAddressPopup from "./DashboardMutateAddressPopup";

// Mirrors Models/UserAddress.ts on noyanai-back.
export interface IUserAddress extends MongoDoc {
  user: string;
  displayName: string;
  address: string;
  location?: { type: "Point"; coordinates?: [number, number] };
}

const DashboardManageAddressesPage = () => {
  const { data, error, mutate } = useSWR<IUserAddress[]>(
    `${API}/user/address`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <div className={classes.main}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <WithTitle
            title={getContent("addresses")}
            actions={[
              {
                title: getContent("newItem"),
                action: () =>
                  setPopup(
                    "DashboardMutateAddress",
                    <DashboardMutateAddressPopup mutate={mutate} />,
                  ),
              },
            ]}
          >
            <Table
              name="DashboardManageAddresses"
              data={data}
              renderer={{
                displayName: {
                  name: getContent("displayName"),
                  value: (node) => node.displayName,
                  filter: "Text",
                },
                address: {
                  name: getContent("address"),
                  value: (node) => node.address,
                  filter: "Text",
                },
                actions: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconLink href={`/dashboard/address/${node._id}`}>
                        <EyeIcon />
                      </IconLink>
                    </TableActions>
                  ),
                },
              }}
            />
          </WithTitle>
        )}
      </HandleLoading>
    </div>
  );
};

export default DashboardManageAddressesPage;
