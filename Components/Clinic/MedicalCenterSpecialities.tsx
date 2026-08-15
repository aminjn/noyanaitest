import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import useLocale from "../Hooks/useLocale";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import classes from "./MedicalCenterSpecialities.module.css";
const MedicalCenterSpecialities = ({ nodes }: { nodes: ISpeciality[] }) => {
  const getContent = useLocale();
  if (!nodes.length) return null;
  return (
    <div className={classes.main} id="specialities">
      <IconTitle icon={<StetoscopeIcon />}>
        {getContent("specialities")}
      </IconTitle>
      <div className={classes.list}>
        {nodes.map((el) => (
          <Badge
            color="Primarylight"
            size="XXL"
            radius="High"
            mode="Fill"
            key={el._id}
          >
            {el.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterSpecialities;
