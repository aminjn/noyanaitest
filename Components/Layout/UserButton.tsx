import usePopup from "../Hooks/usePopup";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import ChevronIcon from "../Icons/ChevronIcon";
import UserSquareIcon from "../Icons/UserSquareIcon";
import AuthPopup from "../Popups/AuthPopup";
import Button from "../UI/Button";
import classes from "./UserButton.module.css";

const UserButton = () => {
  const { setPopup } = usePopup();
  const { user } = useUser(undefined);

  const push = useProgress();

  if (!!user)
    return (
      <Button
        className={classes.main}
        variant="PrimaryStroke"
        leadIcon={<UserSquareIcon />}
        tailIcon={<ChevronIcon />}
        iconWidth="1.25rem"
        onClick={() => push("/dashboard")}
      >
        {user.phone}
      </Button>
    );
  return (
    <Button
      className={classes.main}
      onClick={() => setPopup("Auth", <AuthPopup />)}
    >
      ورود/ثبت نام
    </Button>
  );
};

export default UserButton;
