import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { ContentKey } from "../Enums/contentKeys";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import Badge from "../UI/Badge";
import Link from "@/Components/i18n/Link";
import IconTitle from "../UI/IconTitle";
import classes from "./MedicalCenterInsurances.module.css";

const NS: ContentNamespace[] = ["common", "medicalCenter"];
const MedicalCenterInsurances = ({
  nodes,
  title,
}: {
  nodes: IInsurance[];
  title: ContentKey;
}) => {
  const getContent = useScopedLocale(NS);

  if (!Array.isArray(nodes) || !nodes.length) return null;
  return (
    <div className={classes.main} id="insurances">
      <IconTitle>{getContent(title)}</IconTitle>
      <div className={classes.list}>
        {nodes.map((el) => (
          // each insurer opens its own page
          <Link key={el._id} href={`/insurance/${el.slug || el._id}`}>
            <Badge color="Disabled" mode="Fill" size="XXL" radius="High">
              {el.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterInsurances;
