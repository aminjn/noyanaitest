import { MouseEventHandler } from "react";
import classes from "./FavoriteButton.module.css";
import Ixon from "@/Components/UI/Ixon";
import StarIcon from "@/Components/Icons/StarIcon";
const FavoriteButton = ({
  onClick,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button className={classes.fav} onClick={onClick}>
      <Ixon width="1.5rem">
        <StarIcon />
      </Ixon>
    </button>
  );
};

export default FavoriteButton;
