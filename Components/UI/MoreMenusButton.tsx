import { ReactNode, useState } from "react";
import classes from "./MoreMenusButton.module.css";
import Ixon from "./Ixon";
import MenuIcon from "../Icons/MenuIcon";
import Button from "./Button";
const MoreMenusButton = ({
  options,
}: {
  options: { title: string; icon: ReactNode; onClick: () => unknown }[];
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className={classes.main}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={classes.button}
      >
        <Ixon width="1rem">
          <MenuIcon />
        </Ixon>
      </button>
      {isOpen && (
        <div className={classes.options}>
          {options.map((option) => (
            <Button
              radius="Normal"
              size="S"
              mode="Outline"
              variant="Primary"
              leadIcon={option.icon}
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
            >
              {option.title}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoreMenusButton;
