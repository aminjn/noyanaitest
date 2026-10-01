"use client";
import Button from "@/Components/UI/Button";
import classes from "./DoctorManagePrescriptionsPage.module.css";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import DoctorTaminTokenManager from "./DoctorTaminTokenManager";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useProgress from "@/Components/Hooks/useProgress";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/Components/helpers/fetcher";
import { IPrescription } from "./Create/PrescriptionItemsOverview";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import FileIcon from "@/Components/Icons/FileIcon";
import IconLink from "@/Components/Admin/UI/IconLink";
import LoadPrescriptionsFromTamin from "./LoadPrescriptionsFromTamin";
import usePopup from "@/Components/Hooks/usePopup";
import {
  IPrescription2,
  ITaminPrescription2,
} from "../Prescription2/Store/DoctorPrescriptionContext";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import PopupCard from "@/Components/UI/PopupCard";
import TabSystem from "@/Components/Admin/UI/TabSystem";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";
import { IDoctorProfile } from "../DoctorPanelPage";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import { ITaminSpec } from "@/Components/Admin/Tamin/Spec/AdminManageTaminSpecsPage";
import { ITaminComplaint } from "@/Components/Admin/Tamin/TaminComplaint/AdminManageTaminComplaintPage";
import { ITaminIcid } from "@/Components/Admin/Tamin/Icid/AdminManageTaminIcidsPage";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionList"];

const TaminPrescriptionsDetailsPopup = ({
  nodes,
}: {
  nodes: ITaminPrescription2<{ PrescType: Record<never, never> }>[];
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  return (
    <PopupCard className={classes.taminPopup}>
      <WithTitle title={getContent("committedTaminPrescriptions")}>
        <Table
          data={nodes}
          name="DoctorManageCommitedTaminPrescriptions"
          renderer={{
            prescType: {
              name: getContent("prescriptionType"),
              value: (node) => node.prescType.prescTypeDesc,
              filter: "Multi",
            },
            taminId: {
              name: getContent("taminPrescriptionId"),
              value: (node) => node.taminId,
              filter: "Text",
            },
            tracking: {
              name: getContent("taminPrescriptionTracking"),
              value: (node) => node.tracking,
              filter: "Text",
            },
          }}
        />
      </WithTitle>
    </PopupCard>
  );
};

const NormalPrescriptions = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  // const { data, error } = useSWR<
  //   IPrescription<{
  //     Patient: Record<never, never>;
  //     TaminStatus: Record<never, never>;
  //   }>[]
  // >(`${API}/doctor/presc`, (url: string) =>
  //   fetcher({ url }).then((res) => res.data),
  // );

  const { data, error } = useSWR<
    IPrescription2<{
      Patient: Record<never, never>;
      TaminPrescription: { PrescType: Record<never, never> };
    }>[]
  >(`${API}/doctor/presc2`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );


  const push = useProgress();

  const { setPopup } = usePopup();

  return (
    <div>
      <DoctorTaminTokenManager />
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <WithTitle
            title={getContent("prescriptionsList")}
            collapsed={
              <Fragment>
                <Button onClick={() => push("/doctorpanel/prescription")}>
                  {getContent("newPrescription")}
                </Button>
                <Button
                  onClick={() =>
                    setPopup(
                      "loadPrescriptionsFromTamin",
                      <LoadPrescriptionsFromTamin />,
                    )
                  }
                >
                  {getContent("loadPrescriptionsFromTamin")}
                </Button>
              </Fragment>
            }
          >
            <Table
              data={data}
              name="DoctorManagePrescriptions"
              renderer={{
                createdAt: {
                  name: getContent("createdAt"),
                  value: (node) => new Date(node.createdAt),
                  component: (node) => <FormatDate value={node.createdAt} />,
                  filter: "Date",
                },
                patient: {
                  name: getContent("patientName"),
                  value: (node) =>
                    `${node.patient.givenName} ${node.patient.lastName}`,
                  filter: "Text",
                },
                patientNationalCode: {
                  name: getContent("patientNationalCode"),
                  value: (node) => node.patient.nationalId,
                  filter: "Text",
                },
                taminPrescriptionsCount: {
                  name: getContent("taminPrescriptionsCount"),
                  value: (node) => node.taminPrescriptions.length,
                  filter: "Number",
                },
                actions: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconLink
                        href={`/doctorpanel/prescription/${node._id}`}
                        title={getContent("prescriptionDetails")}
                      >
                        <FileIcon />
                      </IconLink>
                      {!!node.taminPrescriptions.length && (
                        <IconButton
                          onClick={() =>
                            setPopup(
                              "TaminPrescriptionDetails",
                              <TaminPrescriptionsDetailsPopup
                                nodes={node.taminPrescriptions}
                              />,
                            )
                          }
                        >
                          <EyeIcon />
                        </IconButton>
                      )}
                    </TableActions>
                  ),
                },
              }}
            />
          </WithTitle>
        )}
      </HandleLoading>
    </div>
  );
};

export interface IVisitPrescription extends MongoDoc {
  patient: IUserIdentity;
  author: IDoctorProfile;
  createdAt: Date;
  taminId: string;
  tracking: string;
}

const DeleteVisitPrescriptionPopup = ({
  mutate,
  node,
}: {
  node: IVisitPrescription;
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteVisitPrescription")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/doctor/presc2/visit/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

const VisitPrescriptions = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { data, error, mutate } = useSWR<IVisitPrescription[]>(
    `${API}/doctor/presc2/visit`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("visitPrescriptions")}>
          <Table
            data={data}
            name="DoctorManageVisitPrescription"
            renderer={{
              createdAt: {
                name: getContent("createdAt"),
                value: (node) => new Date(node.createdAt),
                component: (node) => (
                  <FormatDate value={new Date(node.createdAt)} />
                ),
                filter: "Date",
              },
              patient: {
                name: getContent("patientName"),
                value: (node) =>
                  `${node.patient.givenName} ${node.patient.lastName}`,
                filter: "Text",
              },
              taminId: {
                name: getContent("taminId"),
                value: (node) => node.taminId,
                filter: "Text",
              },
              tracking: {
                name: getContent("trackingCode"),
                value: (node) => node.tracking,
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "deleteVisitPrescriptionPopup",
                          <DeleteVisitPrescriptionPopup
                            mutate={mutate}
                            node={node}
                          />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export interface IReferralPrescription extends MongoDoc {
  author: IDoctorProfile;
  patient: IUserIdentity;
  spec: ITaminSpec;
  complaints: ITaminComplaint[];
  icds: ITaminIcid[];
  createdAt: Date;
  taminId: string;
  tracking: string;
  quantity: number;
  message: string;
  referralDate: Date;
}

const ReferralPrescriptions = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { data, error } = useSWR<IReferralPrescription[]>(
    `${API}/doctor/referral`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("referralPrescriptions")}>
          <Table
            data={data}
            name="DoctorManageReferralPrescriptions"
            renderer={{
              patient: {
                name: getContent("patientName"),
                value: (node) =>
                  `${node.patient.givenName} ${node.patient.lastName}`,
                filter: "Text",
              },
              createdAt: {
                name: getContent("createdAt"),
                value: (node) => new Date(node.createdAt),
                component: (node) => <FormatDate value={node.createdAt} />,
                filter: "Date",
              },
              taminId: {
                name: getContent("taminId"),
                value: (node) => node.taminId,
                filter: "Text",
              },
              tracking: {
                name: getContent("trackingCode"),
                value: (node) => node.tracking,
                filter: "Text",
              },
              message: {
                name: getContent("message"),
                value: (node) => node.message,
                filter: "Text",
              },
              quantity: {
                name: getContent("quantity"),
                value: (node) => node.quantity,
                filter: "Number",
              },
              spec: {
                name: getContent("referralSpeciality"),
                value: (node) => node.spec.specDesc,
                filter: "Text",
              },
              referralDate: {
                name: getContent("referralDate"),
                value: (node) => new Date(node.referralDate),
                component: (node) => (
                  <FormatDate
                    time={false}
                    value={new Date(node.referralDate)}
                  />
                ),
                filter: "Date",
              },
              complaints: {
                name: getContent("referralPrescriptionComplaints"),
                value: (node) =>
                  node.complaints.map((el) => el.displayName).join(" | "),
                filter: "Text",
              },
              icds: {
                name: getContent("referralPrescriptionIcds"),
                value: (node) => node.icds.map((el) => el.icdName).join(" | "),
                filter: "Text",
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

const DoctorManagePrescriptionsPage = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("drugsAndPrescriptions"), target: "/doctorpanel/drug" },
  ]);

  return (
    <ClientTabSystem
      items={[
        {
          title: getContent("prescriptions"),
          id: "NormalPrescriptions",
          content: <NormalPrescriptions />,
        },
        {
          title: getContent("visitPrescriptions"),
          id: "VisitPrescriptions",
          content: <VisitPrescriptions />,
        },
        {
          title: getContent("referralPrescriptions"),
          id: "ReferralPrescriptions",
          content: <ReferralPrescriptions />,
        },
      ]}
    />
  );
};

export default DoctorManagePrescriptionsPage;
