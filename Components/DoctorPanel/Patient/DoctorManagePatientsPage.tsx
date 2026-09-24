"use client";

import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { API } from "@/Components/config";
import { IUser, MongoDoc, UserPopulation } from "@/Components/Hooks/useUser";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import Table from "@/Components/Admin/UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { fetcher } from "@/Components/helpers/fetcher";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPatient"];

export type DoctorPatientPopulation = Population<{
  User: UserPopulation;
  Doctor: DoctorProfilePopulation;
}>;
export interface IDoctorPatient<
  T extends DoctorPatientPopulation = DoctorPatientPopulation
> extends MongoDoc {
  createdAt: Date;
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
}

const DoctorManagePatientsPage = () => {
  const { data, error } = useSWR<
    IDoctorPatient<{ User: { Identity: Record<never, never> } }>[]
  >(`${API}/doctor/patient`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(LOCALE_NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("patients"), target: "/doctorpanel/patient" },
  ]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={getContent("patients")}>
          <Table
            data={data}
            name="DoctorManagePatients"
            renderer={{
              createdAt: {
                name: getContent("patientAdditionDate"),
                value: (node) => new Date(node.createdAt),
                component: (node) => <FormatDate value={node.createdAt} />,
                filter: "Date",
              },
              username: {
                name: getContent("username"),
                value: (node) => node.user.username,
                filter: "Text",
              },
              fullName: {
                name: getContent("fullName"),
                value: (node) =>
                  node.user.identity
                    ? `${node.user.identity.givenName || ""} ${
                        node.user.identity.lastName || ""
                      }`
                    : getContent("notAssigned"),
                filter: "Text",
              },
              phone: {
                name: getContent("phoneNumber"),
                value: (node) => node.user.phone,
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconLink href={`/doctorpanel/patient/${node._id}`}>
                      <EyeIcon />
                    </IconLink>
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

export default DoctorManagePatientsPage;
