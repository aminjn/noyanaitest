"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import FormatDate from "@/Components/UI/FormatDate";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { getUserLabel } from "../Lib/LabelGetters";
import DeletePushSubscriptionPopup from "./DeletePushSubscriptionPopup";
import useLocale from "@/Components/Hooks/useLocale";

export type PushSubscriptionPopulation = Population<{ User: UserPopulation }>;

export interface IPushSubscription<
  T extends PushSubscriptionPopulation = PushSubscriptionPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
  createdAt: Date;
}

export type FullPushSubscription = IPushSubscription<{
  User: Record<never, never>;
}>;

// Just the fields the "send test push" form below needs - not a real
// domain model, so it lives here rather than in a shared types file.
type TestPushInput = {
  user?: string[];
  title?: string;
  message?: string;
  link?: string;
};

// Sends through the exact same pipeline as any other notification (POST
// /admin/notification/bulk -> Notification.insertMany -> the post-insertMany
// hook in Models/Notification.ts on noyanai-back -> sendPushToUser) - this
// isn't a mocked/separate test path, so a successful send here is a real
// end-to-end proof that push delivery works. The subscriptions table below
// shows which users actually have something to receive it.
const AdminTestPushPage = () => {
  const {
    data: subscriptions,
    error,
    mutate,
  } = useSWR<FullPushSubscription[]>(
    `${API}/auto/pushsubscription`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const getContent = useLocale();

  return (
    <HandleLoading data={!!subscriptions} error={error}>
      {!!subscriptions && (
        <WithTitle title={getContent("testPushNotifications")}>
          <Box style={{ marginBottom: "1rem" }}>
            <p style={{ marginBottom: "1rem" }}>
              {getContent("testPushNotificationDescription")}
            </p>
            <CreateForm<TestPushInput>
              style={{ maxWidth: "40rem" }}
              defaultValue={{
                title: getContent("testPushDefaultTitle"),
                message: getContent("testPushDefaultMessage"),
              }}
              renderer={{
                user: {
                  type: "nodes",
                  title: getContent("users"),
                  path: `${API}/auto/user`,
                  getOptionLabel: (n) => getUserLabel(n as IUser),
                  getOptionValue: (n) => (n as IUser)._id,
                  multi: true,
                },
                title: { title: getContent("title"), type: "text" },
                message: { title: getContent("message"), type: "area" },
                link: { title: getContent("link"), type: "text" },
              }}
              hookProps={{
                path: `${API}/admin/notification/bulk`,
                method: "POST",
                hasProblem: (inp) => {
                  if (!inp.user?.length)
                    return getContent("selectAtLeastOneUserErrorMessage");
                  if (!inp.title) return getContent("missingTitleErrorMessage");
                  if (!inp.message)
                    return getContent("missingMessageErrorMessage");
                },
                mutator: (inp) => ({
                  users: inp.user,
                  title: inp.title,
                  message: inp.message,
                  link: inp.link,
                  source: "Admin",
                }),
              }}
            />
          </Box>

          <Table
            name="AdminTestPushSubscriptions"
            data={subscriptions}
            renderer={{
              user: {
                name: getContent("user"),
                value: (node) => getUserLabel(node.user),
                filter: "Text",
              },
              userAgent: {
                name: getContent("device"),
                value: (node) => node.userAgent || "-",
                filter: "Text",
              },
              createdAt: {
                name: getContent("createdAt"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
                component: (node) => <FormatDate value={node.createdAt} />,
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeletePushSubscription",
                          <DeletePushSubscriptionPopup
                            mutate={mutate}
                            node={node}
                          />,
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

export default AdminTestPushPage;
