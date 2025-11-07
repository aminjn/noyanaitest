import DoctorsListPage from "@/Components/Doctor/DoctorsListPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { DoctorPageProps } from "./[page]/page";
import { notFound } from "next/navigation";

const DoctorsList = async () => {
  const data = await getPublicData<DoctorPageProps>(`doctor?page=1`);
  if (!data) return notFound();
  return <DoctorsListPage {...data} />;
};

export default DoctorsList;
