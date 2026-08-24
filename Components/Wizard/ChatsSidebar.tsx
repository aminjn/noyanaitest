import classes from "./ChatsSidebar.module.css";
import useBotChats from "./useBotChats";
import useLocale from "../Hooks/useLocale";
import Ixon from "../UI/Ixon";
import Link from "next/link";
import PlusIcon from "../Icons/PlusIcon";
import XMarkIcon from "../Icons/XMarkIcon";
import Loading from "../Admin/UI/Loading";
import WizardSidebarItem from "./WizardSidebarItem";
import { Fragment } from "react";

const ChatsSidebar = ({
  activeChatId,
  onClose,
}: {
  activeChatId?: string;
  onClose?: () => void;
}) => {
  const { data, mutate } = useBotChats();
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <button
        type="button"
        className={classes.close}
        aria-label={getContent("close")}
        onClick={onClose}
      >
        <Ixon width="1.125rem">
          <XMarkIcon />
        </Ixon>
      </button>
      <Link href="/wizard" className={classes.newChat} onClick={onClose}>
        <Ixon width="1.125rem" className={classes.newChatIcon}>
          <PlusIcon />
        </Ixon>
        <span>{getContent("newChat")}</span>
      </Link>
      {data ? (
        <Fragment>
          {!!data.length ? (
            <div className={classes.list}>
              {data.map((chat) => (
                <WizardSidebarItem
                  key={chat._id}
                  chat={chat}
                  isActive={chat._id === activeChatId}
                  mutate={mutate}
                  onNavigate={onClose}
                />
              ))}
            </div>
          ) : (
            <p className={classes.empty}>{getContent("noChatYetMessage")}</p>
          )}
        </Fragment>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ChatsSidebar;
