import { ChangeEventHandler, useRef, useState } from "react";
import { WithStyleProps } from "../Layout/Layout";
import classes from "./ImageInput.module.css";
import ImageIcon from "./RTFEditor/ImageIcon";
import Image from "next/image";
import { FilePath } from "../config";
import Ixon from "./Ixon";
import HostedImage from "./HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";

const ImageInput = ({
  className = "",
  defaultValue,
  onChange,
  style,
  title,
  readOnly,
  required,
}: WithStyleProps<{
  title?: string;
  // shows the same red "*" as Input for a mandatory file
  required?: boolean;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
}>) => {
  const [value, setValue] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const getContent = useScopedLocale();

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <div className={classes.inputContainer}>
        {!!title && (
          <span className={classes.title}>
            {!!required && <span className={classes.required}>* </span>}
            {title}
          </span>
        )}
        {!!value ? (
          <span>{value.name}</span>
        ) : (
          <span>{getContent("clickOrDropFileHere")}</span>
        )}
        <input
          className={classes.input}
          ref={inputRef}
          onChange={(e) => {
            setValue(e.target.files?.[0] || null);
            onChange?.(e);
          }}
          type="file"
          disabled={readOnly}
        />
      </div>
      <div className={classes.defaultValue}>
        {defaultValue ? (
          <HostedImage
            src={defaultValue}
            alt=""
            fill
            style={{ objectFit: "contain" }}
          />
        ) : (
          <Ixon>
            <ImageIcon />
          </Ixon>
        )}
      </div>
    </div>
  );
};

export default ImageInput;
