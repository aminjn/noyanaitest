import classes from "./UserIdentity.module.css";
import useSWR from "swr";
import useUser from "../Hooks/useUser";
import { IUserIdentity } from "./DashboardPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import IconButton from "../Admin/UI/IconButton";
import Icon from "react-multi-date-picker/components/icon";
import EditIcon from "../Icons/EditIcon";
import HostedImage from "../UI/HostedImage";
import usePopup from "../Hooks/usePopup";
import EditUserDetailsPopup from "./EditUserDetailsPopup";
import DataPair from "../Admin/UI/DataPair";
import FormatDate from "../UI/FormatDate";

const NS: ContentNamespace[] = ["common", "dashboardUserIdentity"];

const UserIdentity = ({
  identity,
  avatar,
  self,
  username,
}: {
  identity?: IUserIdentity | null;
  avatar?: string;
  username?: string;
  self?: boolean;
}) => {
  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <div className={classes.main}>
      <div className={classes.user}>
        <div className={classes.avatar}>
          <HostedImage
            alt={username || getContent("user")}
            src={avatar}
            sizes="10rem"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={classes.usernameBox}>
          {self && (
            <IconButton
              onClick={() =>
                setPopup("EditUserDetails", <EditUserDetailsPopup />)
              }
            >
              <EditIcon />
            </IconButton>
          )}
          <span className={classes.username}>
            {username || getContent("user")}
          </span>
        </div>
      </div>
      <div className={classes.details}>
        <DataPair
          title={`${getContent("name")} :`}
          value={
            `${identity?.givenName || ""} ${identity?.lastName || ""}`.trim() ||
            getContent("notAssigned")
          }
        />
        <DataPair
          title={`${getContent("nationalId")} :`}
          value={identity?.nationalId || getContent("notAssigned")}
        />
        <DataPair
          title={`${getContent("gender")} :`}
          value={getContent(identity?.gender || "notAssigned")}
        />
        <DataPair
          title={`${getContent("dateOfBirth")} :`}
          value={
            identity?.dateOfbirth ? (
              <FormatDate value={identity?.dateOfbirth} time={false} />
            ) : (
              getContent("notAssigned")
            )
          }
        />
      </div>
    </div>
  );
};

export default UserIdentity;
