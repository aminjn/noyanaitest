import useSWR from "swr";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import Bell01Icon from "../Icons/Bell01Icon";
import Ixon from "../UI/Ixon";
import classes from "./NotificationButton.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import { t2xsRegular } from "../UI/Typography";
import IconWithCountButton from "../UI/IconWithCountButton";
const NotificationButton = () => {
  const { user } = useUser();

  const { data } = useSWR<number>(
    `${API}/user/notification/unread-count`,
    (url: string) => fetcher({ url }).then((res) => res.data.count),
  );

  const push = useProgress();

  if (!user) return null;
  return (
    <IconWithCountButton
      count={data}
      onClick={() => push("/dashboard/notification")}
    >
      <Bell01Icon />
    </IconWithCountButton>
  );
};

export default NotificationButton;
