"use client";

import useSWR from "swr";
import classes from "./DoctorManageClinicsPage.module.css";
import { IClinic } from "@/Components/Admin/Clinic/AdminManageClinicsPage";

const DoctorManageClinicsPage = () => {
  const { data } = useSWR<IClinic[]>(``);
  return <p>DoctorManageClinicsPage</p>;
};

export default DoctorManageClinicsPage;
