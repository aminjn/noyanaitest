import { ReactNode } from "react";
import VerifyIcon from "../Icons/VerifyIcon";
import HostedImage from "./HostedImage";
import Ixon from "./Ixon";
import classes from "./VerifiedImage.module.css";
import { WithStyleProps } from "../Layout/Layout";
import VerifySolidIcon from "../Icons/VerfySolidIcon";
const VerifiedImage = ({
  src,
  alt,
  children,
  className,
  style,
}: WithStyleProps<{
  src?: string;
  alt?: string;
  children?: ReactNode;
}>) => {
  return (
    <div className={`${classes.image} ${className}`} style={style}>
      <HostedImage
        className={classes.theImage}
        src={src}
        alt={alt}
        fill
        style={{ objectFit: "cover" }}
        sizes="3.5rem"
      />
      <Ixon className={classes.verifiedBadge} width="1rem">
        <VerifySolidIcon />
      </Ixon>
      {children}
    </div>
  );
};

export default VerifiedImage;
