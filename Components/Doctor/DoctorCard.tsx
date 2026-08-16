import classes from "./DoctorCard.module.css";
import { IDoctor } from "../Admin/Doctor/AdminManageDoctorsPage";
import Image from "next/image";
import { imagePath } from "../helpers/imagepath";
import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import CardWithSession from "../Booking/CardWithSession";

const DoctorCard = ({
  node,
}: {
  node: IDoctor<{ SpecialityPopulated: Record<never, never> }>;
}) => {
  const getContent = useLocale();

  return (
    <CardWithSession
      name={node.name || getContent("noName")}
      target={`/doctor/${node.slug || node.name}`}
      address={node.address}
      image={node.image}
      speciality={node.speciality}
      description={node.description}
    />
  );
};

export default DoctorCard;
