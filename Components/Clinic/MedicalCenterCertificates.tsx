import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import CheckIcon from "../Icons/CheckIcon";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import classes from "./MedicalCenterCertificates.module.css";

const NS: ContentNamespace[] = ["common", "medicalCenter"];
const MedicalCenterCertificates = ({ nodes }: { nodes: string[] }) => {
  const getContent = useScopedLocale(NS);
  if (!nodes.length) return null;
  return (
    <div className={classes.main}>
      <IconTitle icon={<CheckIcon />}>{getContent("certificates")}</IconTitle>
      <div className={classes.list}>
        {nodes.map((el, i) => (
          <Badge
            key={`Certificate${i}`}
            color="Success"
            mode="Fill"
            size="XXL"
            radius="High"
          >
            {el}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterCertificates;
