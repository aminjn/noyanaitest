import { RenderElementProps } from "slate-react";
import classes from "./RenderElement.module.css";
import { CSSProperties, forwardRef, ReactNode, useMemo } from "react";
import { HeadingLevel } from "./RTFConfigs";
import Image from "next/image";
import { FILE_PATH } from "@/Components/config";
import AdvertisementItem from "./AdvertisementItem";
import HostedImage from "../HostedImage";

const Heading = forwardRef<
  HTMLElement,
  {
    children: ReactNode;
    level: HeadingLevel;
    style: CSSProperties;
  }
>(({ children, level, style }, _) => {
  const Tag = useMemo<`h${HeadingLevel}`>(() => `h${level}`, [level]);

  return <Tag style={{ ...style, lineHeight: "100%" }}>{children}</Tag>;
});

Heading.displayName = "Heading";

const RenderElement = (props: RenderElementProps) => {
  const style = {
    textAlign: props.element.align,
  };
  const { attributes } = props;
  switch (props.element.type) {
    case "vid":
      return (
        <div className={classes.video} {...attributes} contentEditable={false}>
          <video
            src={`${FILE_PATH}/${props.element.src}`}
            controls
            autoPlay
            muted
          />
        </div>
      );
    case "img":
      return (
        <div className={classes.image} contentEditable={false} {...attributes}>
          <HostedImage
            src={props.element.src}
            alt={props.element.alt}
            style={{ objectFit: "cover" }}
            fill
            sizes="100dvw"
          />
          {props.children}
        </div>
      );
    case "h":
      return (
        <Heading style={style} level={props.element.level} {...attributes}>
          {props.children}
        </Heading>
      );
    case "ol":
      return (
        <ol style={style} {...attributes} className={classes.ol}>
          {props.children}
        </ol>
      );
    case "ul":
      return (
        <ul style={style} {...attributes} className={classes.ul}>
          {props.children}
        </ul>
      );
    case "li":
      return (
        <li style={style} {...attributes}>
          {props.children}
        </li>
      );
    case "p":
      return (
        <p style={style} {...attributes}>
          {props.children}
        </p>
      );
    case "ads":
      return (
        <AdvertisementItem id={props.element.id}>
          {props.children}
        </AdvertisementItem>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {props.children}
        </p>
      );
  }
};
export default RenderElement;
