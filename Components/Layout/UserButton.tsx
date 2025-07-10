import usePopup from "../Hooks/usePopup";
import useUser from "../Hooks/useUser";
import ChevronIcon from "../Icons/ChevronIcon";
import UserSquareIcon from "../Icons/UserSquareIcon";
import AuthPopup from "../Popups/AuthPopup";
import Button from "../UI/Button";
import classes from "./UserButton.module.css";

const UserButton = () => {
  const { setPopup } = usePopup();
  const { user } = useUser(undefined);

  if (!!user)
    return (
      <Button
        className={classes.main}
        variant="PrimaryStroke"
        leadIcon={<UserSquareIcon />}
        tailIcon={<ChevronIcon />}
        iconWidth="1.25rem"
      >
        {user.phone}
      </Button>
    );
  return (
    <Button className={classes.main} onClick={() => setPopup(<AuthPopup />)}>
      ورود/ثبت نام
    </Button>
  );
};

export default UserButton;
