import useLocale from "../Hooks/useLocale";
import usePopup from "../Hooks/usePopup";
import useProgress from "../Hooks/useProgress";
import useUser from "../Hooks/useUser";
import ChevronIcon from "../Icons/ChevronIcon";
import UserCircleIcon from "../Icons/UserCircleIcon";
import UserSquareIcon from "../Icons/UserSquareIcon";
import AuthPopup from "../Popups/AuthPopup";
import Button from "../UI/Button";
import classes from "./UserButton.module.css";

const UserButton = () => {
  const { setPopup } = usePopup();
  const { user } = useUser(undefined);

  const push = useProgress();

  const getContent = useLocale();

  // if (!!user)
  //   return (
  //     <div>
  //       <Button
  //         className={classes.main}
  //         iconWidth="1.25rem"
  //         onClick={() => }
  //       >
  //         {user.phone}
  //       </Button>
  //     </div>
  //   );
  return (
    <Button
      leadIcon={!!user ? <UserCircleIcon /> : undefined}
      tailIcon={!!user ? <ChevronIcon /> : undefined}
      onClick={() =>
        !!user ? push("/dashboard") : setPopup("Auth", <AuthPopup />)
      }
      variant="Primary"
      mode={!!user ? "Black" : "Outline"}
      size="L"
      radius="Medium"
    >
      {!!user ? user.phone : getContent("loginOrSignup")}
    </Button>
  );
};

export default UserButton;
