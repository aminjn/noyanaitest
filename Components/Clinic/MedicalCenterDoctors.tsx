import { useMemo, useState } from "react";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./MedicalCenterDoctors.module.css";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import IconTitle from "../UI/IconTitle";
import PeopleIcon from "../Icons/PeopleIcon";
import FilterCsr from "./FilterCsr";
import Image from "next/image";
import { FilePath } from "../config";
import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import { tsmDemiBold, tsmRegular, txsRegular } from "../UI/Typography";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import HostedImage from "../UI/HostedImage";

const NS: ContentNamespace[] = ["common", "medicalCenter"];

const Item = ({
  node,
}: {
  node: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>;
}) => {
  return (
    <div className={classes.item}>
      <div className={classes.image}>
        <HostedImage
          src={node.avatar}
          alt={getDoctorProfileLabel(node)}
          fill
          sizes="3.5rem"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={classes.itemContent}>
        <span className={`${classes.itemName} ${tsmDemiBold}`}>
          {getDoctorProfileLabel(node)}
        </span>
        {!!node.mainSpeciality && (
          <span className={`${classes.itemSpeciality} ${txsRegular}`}>
            {node.mainSpeciality.name}
          </span>
        )}
        <div className={`${classes.score} ${tsmRegular}`}>
          <Ixon width=".75rem">
            <StarIcon />
          </Ixon>
          <span>4.9</span>
        </div>
      </div>
    </div>
  );
};

const MedicalCenterDoctors = ({
  nodes,
}: {
  nodes: IDoctorProfile<{ MainSpecialityPopulated: Record<never, never> }>[];
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

  if (!nodes.length) return null;
  return (
    <div className={classes.main} id="doctors">
      <IconTitle icon={<PeopleIcon />}>{getContent("clinicDoctors")}</IconTitle>
      <FilterCsr
        options={specialities.map((el) => ({
          title: el.name || "",
          value: el._id,
        }))}
        filter={filter}
        setFilter={setFilter}
      />
      <div className={classes.list}>
        {filtered.map((doctor) => (
          <Item key={doctor._id} node={doctor} />
        ))}
      </div>
    </div>
  );
};

export default MedicalCenterDoctors;
