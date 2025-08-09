"use client";

import useSWR from "swr";
import classes from "./DoctorManageSecretariesPage.module.css";

const DoctorManageSecretariesPage = () => {
  const { data } = useSWR(``);
  return <p>DoctorManageSecretariesPage</p>;
};

export default DoctorManageSecretariesPage;
