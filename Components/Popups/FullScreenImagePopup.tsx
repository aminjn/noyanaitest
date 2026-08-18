import classes from "./FullScreenImagePopup.module.css";
import HostedImage from "../UI/HostedImage";
import IconButton from "../Admin/UI/IconButton";
import CloseIcon from "../Icons/CloseIcon";
import usePopup from "../Hooks/usePopup";

const FullScreenImagePopup = ({ src }: { src?: string }) => {
  const { closePopup } = usePopup();
  return (
    <div className={classes.main}>
      <HostedImage
        src={src}
        alt=""
        fill
        style={{ objectFit: "contain" }}
        sizes="100dvw"
      />
      <IconButton
        variant="Danger"
        onClick={() => closePopup("FullscreenImagePreview")}
        className={classes.action}
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
};

export default FullScreenImagePopup;
