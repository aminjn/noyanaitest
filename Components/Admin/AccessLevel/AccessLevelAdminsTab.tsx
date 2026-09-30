import { adminPath } from "@/Components/helpers/adminPath";
import InlineLink from "../UI/InlineLink";
import List from "../UI/List";
import Table from "../UI/Table";
import classes from "./AccessLevelAdminsTab.module.css";
import { IAccessLevel } from "./AdminManageAccessLevelsPage";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import RemoveAccessLevelUserPopup from "./RemoveAccessLevelUserPopup";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import WithTitle from "../UI/WithTitle";
import ConnectAccessLevelToUserPopup from "./ConnectAccessLevelToUserPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

export type UserAccessLevelPopulation = {
  UserPopulated?: boolean;
  AccessLevelPopulated?: boolean;
};

export interface IUserAccessLevel<
  T extends UserAccessLevelPopulation = UserAccessLevelPopulation
> extends MongoDoc {
  user: T["UserPopulated"] extends true ? IUser : string;
  accessLevel?: T["AccessLevelPopulated"] extends true ? IAccessLevel : string;
}

const AccessLevelAdminsTab = ({
  node,
  mutate,
}: {
  node: IAccessLevel<{ AdminsPopulated: { UserPopulated: true } }>;
  mutate: () => unknown;
}) => {
  const { setPopup } = usePopup();

  return (
    <WithTitle
      title={ta("ادمین های دارای این دسترسی")}
      actions={[
        {
          title: ta("جدید"),
          action: () =>
            setPopup(
              "ConnectAccessLevelToUser",
              <ConnectAccessLevelToUserPopup
                mutate={mutate}
                accessLevel={node as unknown as IAccessLevel}
              />
            ),
        },
      ]}
    >
      <Table
        name="AdminManageAccessLevelAdmins"
        data={node.admins}
        renderer={{
          phone: {
            name: ta("موبایل"),
            value: (node) => node.user?.phone,
            component: (node) =>
              node.user ? (
                <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                  {node.user.phone || node.user._id}
                </InlineLink>
              ) : (
                "—"
              ),
            filter: "Text",
          },
          username: {
            name: ta("نام کاربری"),
            value: (node) => node.user?.username,
            filter: "Text",
          },
          actions: {
            name: ta("عملیات"),
            component: (node) => (
              <TableActions>
                <IconButton
                  variant="Danger"
                  title={ta("حذف دسترسی")}
                  onClick={() =>
                    setPopup(
                      "RemoveAccessLevelUser",
                      <RemoveAccessLevelUserPopup
                        mutate={mutate}
                        permission={node}
                      />
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
  );
};

export default AccessLevelAdminsTab;
