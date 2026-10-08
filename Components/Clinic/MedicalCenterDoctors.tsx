import { useMemo, useState } from "react";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./MedicalCenterDoctors.module.css";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import IconTitle from "../UI/IconTitle";
import PeopleIcon from "../Icons/PeopleIcon";
import FilterCsr from "./FilterCsr";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import { ContentKey } from "../Enums/contentKeys";

const NS: ContentNamespace[] = ["common", "medicalCenter"];

const MedicalCenterDoctors = ({
  nodes,
  title = "clinicDoctors",
}: {
  nodes: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
  // a hospital's page says "doctors", not "the clinic's doctors"
  title?: ContentKey;
}) => {
  const getContent = useScopedLocale(NS);

  const specialities = useMemo<ISpeciality[]>(() => {
    const result = (
      nodes.map((el) => el.mainSpeciality).filter(Boolean) as ISpeciality[]
    ).filter((el, i, arr) => i === arr.findIndex((e) => e._id == el._id));
    return result;
  }, [nodes]);

  const [filter, setFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      nodes
        .filter((el) => !filter || filter === el.mainSpeciality?._id)
        .filter(Boolean) as IDoctorProfile<{
        MainSpecialityPopulated: Record<never, never>;
      }>[],
    [filter, nodes],
  );

  if (!Array.isArray(nodes) || !nodes.length) return null;
  return (
    <div className={classes.main} id="doctors">
      <IconTitle icon={<PeopleIcon />}>{getContent(title)}</IconTitle>
      <FilterCsr
        options={specialities.map((el) => ({
          title: el.name || "",
          value: el._id,
        }))}
        filter={filter}
        setFilter={setFilter}
      />
      <div className={classes.list}>
        {/* the one shared doctor card, same as the homepage */}
        {filtered.map((doctor) => (
          <DoctorCardAlt key={doctor._id} node={doctor as Parameters<typeof DoctorCardAlt>[0]["node"]} />
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterDoctors;
