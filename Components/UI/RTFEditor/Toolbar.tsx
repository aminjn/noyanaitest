import AdsButton from "./AdsButton";
import AlignmentButton from "./AlignmentButton";
import BackgroundColorIcon from "./BackgroundColorIcon";
import BoldIcon from "./BoldIcon";
import FontColorIcon from "./FontColorIcon";
import FontSizeIcon from "./FontSizeIcon";
import HeadingButton from "./HeadingButton";
import ImageButton from "./ImageButton";
import ItalicIcon from "./ItalicIcon";
import LineHeightIcon from "./LineHeightIcon";
import LinkButton from "./LinkButton";
import ListButton from "./ListButton";
import SelectionButton from "./SelectionButton";
import StrikeIcon from "./StrikeIcon";
import ToggleButton from "./ToggleButton";
import classes from "./Toolbar.module.css";
import UnderlineIcon from "./UnderlineIcon";
// hideMediaLibrary hides the image-picker and ad-inserter buttons, which
// browse/upload against the admin-only BlogMedia/InlineAdvertisement asset
// libraries. Org panels (doctor/clinic/pharmacy/insurance/paraClinic) don't
// have access to those admin routes, so they get a restricted toolbar
// (still full text formatting) instead of a broken button. Defaults to
// false so the admin panel's toolbar is unchanged.
const Toolbar = ({
  hideMediaLibrary = false,
}: {
  hideMediaLibrary?: boolean;
}) => {
  return (
    <div className={classes.main}>
      <SelectionButton
        thisKey="lineHeight"
        defaultValue="100%"
        icon={<LineHeightIcon />}
      />
      <SelectionButton
        thisKey="size"
        defaultValue={16}
        icon={<FontSizeIcon />}
      />
      <SelectionButton
        thisKey="color"
        defaultValue="var(--black)"
        icon={<FontColorIcon />}
        renderer={(val) => (
          <span style={{ backgroundColor: val }} className={classes.stamp} />
        )}
        menuClass={classes.menu}
      />
      <SelectionButton
        thisKey="bg"
        defaultValue="var(--white)"
        icon={<BackgroundColorIcon />}
        renderer={(val) => (
          <span style={{ backgroundColor: val }} className={classes.stamp} />
        )}
        menuClass={classes.menu}
      />
      <ToggleButton thisKey="underline" icon={<UnderlineIcon />} />
      <ToggleButton icon={<BoldIcon />} thisKey="strong" />
      <ToggleButton icon={<StrikeIcon />} thisKey="strike" />
      <ToggleButton icon={<ItalicIcon />} thisKey="italic" />
      <LinkButton />
      {!hideMediaLibrary && <ImageButton />}
      <AlignmentButton />
      <HeadingButton />
      <ListButton type="ol" />
      <ListButton type="ul" />
      {!hideMediaLibrary && <AdsButton />}
    </div>
  );
};
export default Toolbar;
