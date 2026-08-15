import { IDoctor } from "@/Components/Admin/Doctor/AdminManageDoctorsPage";
import DoctorsListPage from "@/Components/Doctor/DoctorsListPage";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export type DoctorPageProps = {
  data: IDoctor<{ SpecialityPopulated: Record<never, never> }>[];
  profiles: IDoctorProfile<{ MainSpecialityPopulated: true }>[];
  pagesCount: number;
};

export const generateMetadata = () => getListPageMetadata("/doctors/[page]");

const DoctorsList = async ({
  params: { page: _page },
}: {
  params: { page: string };
}) => {
  const page = Number(_page);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const data = await getPublicData<DoctorPageProps>(`doctor?page=${page}`);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/doctors/[page]");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <DoctorsListPage {...data} />
    </>
  );
};

export default DoctorsList;
