import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import Badge from "../UI/Badge";
import Link from "@/Components/i18n/Link";
import IconTitle from "../UI/IconTitle";
import classes from "./MedicalCenterSpecialities.module.css";

const NS: ContentNamespace[] = ["common", "medicalCenter"];
const MedicalCenterSpecialities = ({ nodes }: { nodes: ISpeciality[] }) => {
  const getContent = useScopedLocale(NS);
  if (!Array.isArray(nodes) || !nodes.length) return null;
  return (
    <div className={classes.main} id="specialities">
      <IconTitle icon={<StetoscopeIcon />}>
        {getContent("specialities")}
      </IconTitle>
      <div className={classes.list}>
        {nodes.map((el) => (
          // a speciality chip leads to its doctors
          <Link key={el._id} href={`/speciality/${el.slug || el._id}`}>
            <Badge color="Primarylight" size="XXL" radius="High" mode="Fill">
              {el.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterSpecialities;
