import useLocale from "../Hooks/useLocale";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import classes from "./MedicalCenterTagList.module.css";
const MedicalCenterTagList = ({
  tags,
}: {
  tags: { _id: string; name?: string }[];
}) => {
  const getContent = useLocale();
  if (!tags.length) return null;
  return (
    <div className={classes.main} id="features">
      <IconTitle icon={<CheckCircleIcon />}>{getContent("features")}</IconTitle>
      <div className={classes.list}>
        {tags.map((tag) => (
          <Badge
            key={tag._id}
            radius="High"
            size="L"
            mode="Fill"
            color="Primarylight"
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterTagList;
