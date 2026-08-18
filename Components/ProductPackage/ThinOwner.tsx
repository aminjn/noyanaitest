import Image from "next/image";
import classes from "./ThinOwner.module.css";
import { FilePath } from "../config";
import { tbaseRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import VerifyIcon from "../Icons/VerifyIcon";
import HostedImage from "../UI/HostedImage";
const ThinOwner = ({ name, src }: { name?: string; src?: string }) => {
  return (
    <div className={classes.owner}>
      <div className={classes.image}>
        <HostedImage
          alt={name || ""}
          src={src}
          sizes="2rem"
          style={{ objectFit: "cover" }}
          fill
        />
      </div>
      <div className={`${classes.nameBox} ${tbaseRegular}`}>
        <span>{name}</span>
        <Ixon className={classes.ownerIcon} width="1.5rem">
          <VerifyIcon />
        </Ixon>
      </div>
    </div>
  );
};

export default ThinOwner;
