"use client";

import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import classes from "./SecretaryManageDoctorsPage.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import SecretaryDoctorsTab from "./SecretaryDoctorsTab";
import SecretaryDoctorRequestsTab from "./SecretaryDoctorRequestsTab";

const SecretaryManageDoctorsPage = () => {
  const getContent = useLocale();
  return (
    <ClientTabSystem
      items={[
        {
          title: getContent("doctors"),
          content: <SecretaryDoctorsTab />,
          id: "Doctors",
        },
        {
          title: getContent("requests"),
          content: <SecretaryDoctorRequestsTab />,
          id: "Requests",
        },
      ]}
    />
  );
};

export default SecretaryManageDoctorsPage;
