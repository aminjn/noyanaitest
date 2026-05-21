import useSWR from "swr";
import classes from "./ChatsSidebar.module.css";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { API } from "../config";
import useBotChats from "./useBotChats";
import Link from "next/link";

const ChatsSidebar = () => {
  const { data } = useBotChats();
  return (
    <div className={classes.main}>
      <div className={classes.list}>
        {data?.map((chat) => (
          <Link href={`/wizard/${chat._id}`} key={chat._id}>
            {chat.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatsSidebar;
