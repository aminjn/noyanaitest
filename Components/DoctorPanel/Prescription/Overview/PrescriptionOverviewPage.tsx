"use client";

import classes from "./PrescriptionOverviewPage.module.css";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useLocale from "@/Components/Hooks/useLocale";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { IPrescription } from "../Create/PrescriptionItemsOverview";
import { calculateAge } from "@/Components/helpers/lib";
import { t2xsMedium, tsmRegular } from "@/Components/UI/Typography";
import PrescriptionItemsList from "../Create/PrescriptionItemsList";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import usePopup from "@/Components/Hooks/usePopup";
import ReloadPrescriptionFromTaminPopup from "./ReloadPrescriptionFromTaminPopup";
import DeletePrescriptionFromTaminPopup from "./DeletePrescriptionFromTaminPopup";
import { DefaultPrescription } from "../PrescriptionContext";
import useProgress from "@/Components/Hooks/useProgress";
import Button from "@/Components/UI/Button";

const Section = ({
  data,
  title,
}: {
  title: string;
  data: { title: string; value: string }[];
}) => {
  return (
    <div className={classes.section}>
      <legend className={`${classes.legend} ${t2xsMedium}`}>{title}</legend>
      <div className={classes.data}>
        {data.map((pair) => (
          <div className={classes.pair} key={pair.title}>
            <span className={`${classes.pairTitle} ${t2xsMedium}`}>
              {pair.title}
            </span>
            <span className={`${classes.pairValue} ${tsmRegular}`}>
              {pair.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const PrescriptionOverviewPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<DefaultPrescription>(
    `${API}/doctor/presc/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const getContent = useLocale();
  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={getContent("prescriptionOverview")}
          collapsed={
            <Fragment>
              <Button
                onClick={() => () =>
                  push(`/doctorpanel/prescription/${data._id}/print`)
                }
              >
                {getContent("printPrescrtiption")}
              </Button>
            </Fragment>
          }
          actions={[
            {
              title: getContent("commitPrescription"),
              action: () => setIsCommitting(true),
            },
            {
              title: getContent("reloadPrescriptionFromTamin"),
              action: () =>
                setPopup(
                  "ReloadPrescriptionFromTamin",
                  <ReloadPrescriptionFromTaminPopup node={data} />,
                ),
            },
            {
              title: getContent("deletePrescriptionFromTamin"),
              action: () =>
                setPopup(
                  "DeletePrescriptionFromTamin",
                  <DeletePrescriptionFromTaminPopup node={data} />,
                ),
            },
            {
              title: getContent("mutatePrescriptionFromTamin"),
              action: () => push(`/doctorpanel/prescription/${data._id}/edit`),
            },
          ]}
        >
          <div className={classes.main}>
            <Section
              title={getContent("prescriptionDetails")}
              data={[
                { title: getContent("prescriptionRepeatCount"), value: "0" },
                { title: getContent("prescriptionEffectiveDate"), value: "-" },
                { title: getContent("prescriptionExpiryDate"), value: "-" },
              ]}
            />
            <Section
              title={getContent("patientDetails")}
              data={[
                {
                  title: getContent("patientName"),
                  value: `${data.patient.givenName} ${data.patient.lastName}`,
                },
                {
                  title: getContent("nationalCode"),
                  value: data.patient.nationalId,
                },
                {
                  title: getContent("age"),
                  value: calculateAge(data.patient.dateOfbirth).toString(),
                },
              ]}
            />
            <PrescriptionItemsList items={data.items} readOnly />
          </div>
          <Act
            path={isCommitting ? `${API}/doctor/presc/${data._id}` : null}
            method="PATCH"
            onDone={(status, result) => {
              setIsCommitting(false);
              if (!status) return;
              console.log(result);
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default PrescriptionOverviewPage;
