import { useState } from "react";
import classes from "./FilesInput.module.css";
import IconButton from "./IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import useLocale from "@/Components/Hooks/useLocale";

const FilesInput = ({
  title,
  onChange,
  readOnly,
  defaultValue,
}: {
  title?: string;
  onChange?: (e: File[]) => void;
  readOnly?: boolean;
  defaultValue?: string[];
}) => {
  const [selected, setSelected] = useState<File[]>([]);

  const getContent = useLocale();

  return (
    <div className={classes.main}>
      {title && <legend className={classes.title}>{title}</legend>}
      <div className={classes.inputBox}>
        <span className={classes.hint}>{getContent("dragFilesHere")}</span>
        <input
          className={classes.input}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setSelected(files);
            onChange?.(files);
          }}
          type="file"
          multiple
          readOnly={readOnly}
        />
      </div>
      {!!selected.length && (
        <div className={classes.selected}>
          {selected.map((file, i) => (
            <div className={classes.file} key={`${file.name}${i}`}>
              <span>{file.name}</span>
              <IconButton
                onClick={() => {
                  const clone = [...selected];
                  clone.splice(clone.indexOf(file), 1);
                  setSelected(clone);
                  onChange?.(clone);
                }}
                variant="Danger"
              >
                <GarbageIcon />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesInput;
