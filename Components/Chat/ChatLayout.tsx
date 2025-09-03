import useUser from "../Hooks/useUser";
import LoginRequired from "../UI/LoginRequired";
import classes from "./ChatLayout.module.css";
import ChatSidebar from "./ChatSidebar";
import CurrentChat from "./CurrentChat";

const ChatLayout = () => {
  const { user } = useUser();
  if (!user) return <LoginRequired />;
  return (
    <div className={classes.main}>
      <ChatSidebar />
      <CurrentChat />
    </div>
  );
};

export default ChatLayout;
