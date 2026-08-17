import { IDoctor } from "@/Components/Admin/Doctor/AdminManageDoctorsPage";
import DoctorsListPage from "@/Components/Doctor/DoctorsListPage";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";

export type DoctorPageProps = {
  data: IDoctor<{ SpecialityPopulated: Record<never, never> }>[];
  profiles: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
  }>[];
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
  const [data, textContent] = await Promise.all([
    getPublicData<DoctorPageProps>(`doctor?page=${page}`),
    getScopedTextContent(["common", "doctorsList"]),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/doctors/[page]");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["common", "doctorsList"]}
        initialTextContent={textContent}
      >
        <DoctorsListPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default DoctorsList;
