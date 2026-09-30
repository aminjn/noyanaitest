import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import Link from "@/Components/i18n/Link";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import classes from "./MedicalCenterTagList.module.css";

const NS: ContentNamespace[] = ["common", "medicalCenter"];
const MedicalCenterTagList = ({
  tags,
  basePath,
}: {
  tags: { _id: string; name?: string }[];
  // the list the tag filters ("/clinic", "/hospital")
  basePath: string;
}) => {
  const getContent = useScopedLocale(NS);
  if (!tags.length) return null;
  return (
    <div className={classes.main} id="features">
      <IconTitle icon={<CheckCircleIcon />}>{getContent("features")}</IconTitle>
      <div className={classes.list}>
        {tags.map((tag) => (
          // a tag is a filter: it opens the list narrowed to it
          <Link key={tag._id} href={`${basePath}?tag=${tag._id}`}>
            <Badge radius="High" size="L" mode="Fill" color="Primarylight">
              {tag.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterTagList;
