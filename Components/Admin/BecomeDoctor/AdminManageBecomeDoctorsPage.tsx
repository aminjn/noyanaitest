"use client";
import useSWR from "swr";
import classes from "./AdminManageBecomeDoctorsPage.module.css";
import {
  becomeDoctorStatusesDict,
  genderDict,
  IBecomeDoctorRequest,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import FormatDate from "@/Components/UI/FormatDate";
import { provinces } from "@/Components/Enums/Provinces";
import { cities } from "@/Components/Enums/Cities";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteBecomeDoctorPopup from "./DeleteBecomeDoctorPopup";

const AdminManageBecomeDoctorsPage = () => {
  const { data, error, mutate } = useSWR<
    IBecomeDoctorRequest<{ UserPopulated: true }>[]
  >(`${API}/auto/becomedoctor`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های پزشک شدن">
          <Table
            data={data}
            name="AdminManageBecomeDoctors"
            renderer={{
              firstName: {
                name: "نام",
                value: (node) => node.firstName,
                filter: "Text",
              },
              lastName: {
                name: "نام خانوادگی",
                value: (node) => node.lastName,
                filter: "Text",
              },
              ssid: { name: "کد ملی", value: (node) => node.ssid },
              user: {
                name: "یوزر",
                value: (node) => node.user.phone,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                    {node.user.phone}
                  </InlineLink>
                ),
              },
              createdAt: {
                name: "زمان درخواست",
                value: (node) => new Date(node.createdAt),
                component: (node) => <FormatDate value={node.createdAt} />,
                filter: "Date",
              },
              province: {
                name: "استان",
                value: (node) =>
                  provinces.find((p) => p.slug === node.province)?.name,
                filter: "Multi",
              },
              city: {
                name: "شهر",
                value: (node) => cities.find((c) => c.slug === node.city)?.name,
                filter: "Multi",
              },
              gender: {
                name: "جنسیت",
                filter: "Set",
                value: (node) => genderDict[node.gender],
              },
              medicalSystemTitle: {
                name: "عنوان نظام پزشکی",
                value: (node) => node.medicalSystemTitle,
                filter: "Set",
              },
              medicalSystemCode: {
                name: "کد نظام پزشکی",
                value: (node) => node.medicalSystemCode,
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => becomeDoctorStatusesDict[node.status],
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/becomedoctor/${node._id}`)}
                      variant="Info"
                    >
                      <EditIcon />
                    </IconLink>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteBecomeDoctor",
                          <DeleteBecomeDoctorPopup
                            node={node}
                            mutate={mutate}
                          />
                        )
                      }
                    >
                      <Garbageicon />
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

export default AdminManageBecomeDoctorsPage;
