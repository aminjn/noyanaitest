import { FilePath } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";
import FileIcon from "@/Components/Icons/FileIcon";
import classes from "./RequestDocument.module.css";

const imageExt = /\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i;

// One uploaded document of a request: an image shows as a thumbnail, any
// other file (PDF...) as a file chip; both open the original in a new tab.
const RequestDocument = ({
  file,
  label,
}: {
  // the stored filename under Public/ (may be missing)
  file?: string | null;
  label: string;
}) => {
  if (!file || typeof file !== "string") return <span>{ta("ثبت نشده")}</span>;
  const href = /^https?:\/\//.test(file) ? file : `${FilePath}/${file}`;
  return (
    <a
      className={classes.main}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={ta("مشاهده فایل")}
    >
      {imageExt.test(file) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={classes.thumb} src={href} alt={label} loading="lazy" />
      ) : (
        <span className={classes.icon}>
          <FileIcon />
        </span>
      )}
      <span className={classes.text}>{ta("مشاهده فایل")}</span>
    </a>
  );
};

export default RequestDocument;
