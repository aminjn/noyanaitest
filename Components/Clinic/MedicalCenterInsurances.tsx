import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { ContentKey } from "../Enums/contentKeys";
import useLocale from "../Hooks/useLocale";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import classes from "./MedicalCenterInsurances.module.css";
const MedicalCenterInsurances = ({
  nodes,
  title,
}: {
  nodes: IInsurance[];
  title: ContentKey;
}) => {
  const getContent = useLocale();

  if (!nodes.length) return null;
  return (
    <div className={classes.main} id="insurances">
      <IconTitle>{getContent(title)}</IconTitle>
      <div className={classes.list}>
        {nodes.map((el) => (
          <Badge
            key={el._id}
            color="Disabled"
            mode="Fill"
            size="XXL"
            radius="High"
          >
            {el.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterInsurances;
