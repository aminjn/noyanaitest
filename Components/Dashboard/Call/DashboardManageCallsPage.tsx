"use client";

import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import IconButton from "@/Components/Admin/UI/IconButton";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import EditIcon from "@/Components/Icons/EditIcon";
import FormatDate from "@/Components/UI/FormatDate";
import useSWR from "swr";
import JoinCallPopup from "./JoinCallPopup";

export const callTypes = ["voice", "video"] as const;

export type CallType = (typeof callTypes)[number];

export const callTypeDict: Record<CallType, string> = {
  voice: "صوتی",
  video: "تصویری",
};

export type CallRoomPopulation = Population<{
  participants: true;
  joined: true;
}>;

export interface ICallRoom<T extends CallRoomPopulation = CallRoomPopulation>
  extends MongoDoc {
  startedAt: Date;
  endedAt: Date;
  participants: T["participants"] extends true ? IUser[] : string[];
  joined: T["joined"] extends true ? IUser[] : string[];
  callType: CallType;
}

const DashboardManageCallsPage = () => {
  const { data, error } = useSWR<ICallRoom[]>(`${API}/call`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          renderer={{
            startedAt: {
              name: getContent("createdAt"),
              filter: "Date",
              value: (node) => new Date(node.startedAt),
              component: (node) => <FormatDate value={node.startedAt} />,
            },
            actions: {
              name: getContent("actions"),
              component: (node) => (
                <TableActions>
                  <IconButton
                    onClick={() =>
                      setPopup("JoinCall", <JoinCallPopup room={node} />)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </TableActions>
              ),
            },
          }}
          name="UserManageCalls"
        />
      )}
    </HandleLoading>
  );
};

export default DashboardManageCallsPage;
