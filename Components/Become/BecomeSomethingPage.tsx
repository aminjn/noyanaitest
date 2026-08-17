"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useLocale from "../Hooks/useLocale";
import useProgress from "../Hooks/useProgress";
import useDoctor from "../Hooks/useDoctor";
import Loading from "../Admin/UI/Loading";
import ListPageLayout from "../UI/ListPage/ListPageLayout";
import ListPageHeader from "../UI/ListPage/ListPageHeader";
import ClientTabSystem from "../UI/ClientTabSystem";
import BecomeADoctorPage from "../DoctorPanel/BecomeADoctorPage";
import BecomeParaClinicPage from "../Layout/BecomeParaClinicPage";
import BecomeClinicPage from "../ClinicPanel/BecomeClinicPage";
import BecomeInsurancePage from "../InsurancePanel/BecomeInsurancePage";
import BecomePharmacyPage from "../PharmacyPanel/BecomePharmacyPage";
import { IParaClinic } from "../Layout/ParaClinicPanelLayout";
import { IInsurance } from "../DoctorPanel/Insurance/DoctorInsurancesTab";
import { IPharmacy } from "../DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import classes from "./BecomeSomethingPage.module.css";

// The single public place a visitor picks which node they want to become
// (doctor, para clinic, clinic, insurance, pharmacy) and fills out that
// node's own become-request form. Mirrors, for every node kind, the exact
// "does this user already have this node?" check each panel layout
// (DoctorPanelLayout/ClinicPanelLayout/InsurancePanelLayout/
// PharmacyPanelLayout/ParaClinicPanelLayout) already performs, so someone
// who already is one of these identities is bounced straight to their
// panel instead of seeing the become forms again.
const BecomeSomethingPage = () => {
  const getContent = useLocale();
  const push = useProgress();

  const { doctor, isLoading: isDoctorLoading } = useDoctor();

  const { data: clinic, isLoading: isClinicLoading } = useSWR(
    `${API}/clinic`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { data: insurance, isLoading: isInsuranceLoading } =
    useSWR<IInsurance | null>(`${API}/insurance`, (url: string) =>
      fetcher({ url }).then((res) => res.data),
    );

  const { data: pharmacy, isLoading: isPharmacyLoading } =
    useSWR<IPharmacy | null>(`${API}/pharmacy`, (url: string) =>
      fetcher({ url }).then((res) => res.data),
    );

  const { data: paraClinic, isLoading: isParaClinicLoading } =
    useSWR<IParaClinic | null>(`${API}/paraClinic`, (url: string) =>
      fetcher({ url }).then((res) => res.data),
    );

  const isLoading =
    isDoctorLoading ||
    isClinicLoading ||
    isInsuranceLoading ||
    isPharmacyLoading ||
    isParaClinicLoading;

  const redirectTarget = doctor
    ? "/doctorpanel"
    : paraClinic
      ? "/paraClinicPanel"
      : clinic
        ? "/clinicpanel"
        : insurance
          ? "/insurancepanel"
          : pharmacy
            ? "/pharmacypanel"
            : null;

  useEffect(() => {
    if (!isLoading && redirectTarget) push(redirectTarget);
  }, [isLoading, redirectTarget, push]);

  if (isLoading || redirectTarget) return <Loading />;

  return (
    <ListPageLayout
      trail={[
        { title: getContent("home"), target: "/" },
        { title: getContent("becomeSomethingPageTitle"), target: "/become" },
      ]}
    >
      <ListPageHeader
        title={getContent("becomeSomethingPageTitle")}
        legend={getContent("becomeSomethingPageLegend")}
      />
      <div className={classes.tabs}>
        <ClientTabSystem
          items={[
            {
              id: "Doctor",
              title: getContent("doctor"),
              content: <BecomeADoctorPage />,
            },
            {
              id: "ParaClinic",
              title: getContent("paraClinic"),
              content: <BecomeParaClinicPage />,
            },
            {
              id: "Clinic",
              title: getContent("clinic"),
              content: <BecomeClinicPage />,
            },
            {
              id: "Insurance",
              title: getContent("insurance"),
              content: <BecomeInsurancePage />,
            },
            {
              id: "Pharmacy",
              title: getContent("pharmacy"),
              content: <BecomePharmacyPage />,
            },
          ]}
        />
      </div>
    </ListPageLayout>
  );
};

export default BecomeSomethingPage;
