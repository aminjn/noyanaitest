import { IDoctor } from "../Admin/Doctor/AdminManageDoctorsPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import DoctorCardAlt from "../UI/DoctorCardAlt";
import { provinces } from "../Enums/Provinces";
import { WithStyleProps } from "../Layout/Layout";

type CardNode = Parameters<typeof DoctorCardAlt>[0]["node"];

// A doctor from the legacy directory (the `Doctor` model: no account, no
// online booking) shown with the one shared doctor card, in its
// "no online booking" state - never a design of its own.
export const legacyDoctorToCard = (
  node: IDoctor<{ SpecialityPopulated: Record<never, never> }>,
): CardNode =>
  ({
    _id: node._id,
    firstName: node.name || "",
    lastName: "",
    avatar: node.image,
    slug: node.slug,
    mainSpeciality: node.speciality,
    // legacy geo is a province slug, not a Province document
    province: node.province
      ? { name: provinces.find((p) => p.slug === node.province)?.name || "" }
      : undefined,
    averageScore: 0,
    feedbackCount: 0,
  }) as unknown as IDoctorProfile as CardNode;

const DoctorCard = ({
  node,
  variant,
  className,
  style,
}: WithStyleProps<{
  node: IDoctor<{ SpecialityPopulated: Record<never, never> }>;
  variant?: "grid" | "row";
}>) => (
  <DoctorCardAlt
    node={legacyDoctorToCard(node)}
    href={`/doctor/${node.slug || node._id}`}
    bookable={false}
    variant={variant}
    className={className}
    style={style}
  />
);

export default DoctorCard;
