import DoctorsListPage from "@/Components/Doctor/DoctorsListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { DoctorPageProps } from "./[page]/page";
import { notFound } from "next/navigation";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";

const DoctorsList = async () => {
  const [data, textContent] = await Promise.all([
    getPublicData<DoctorPageProps>(`doctor?page=1`),
    getScopedTextContent(["common", "doctorsList"]),
  ]);
  if (!data) return notFound();
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorsList"]}
      initialTextContent={textContent}
    >
      <DoctorsListPage {...data} />
    </LocaleScopeProvider>
  );
};

export default DoctorsList;
