"use client";
import useSWR from "swr";
import classes from "./AdminManageDoctorProfilesPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { cities } from "@/Components/Enums/Cities";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { currencize } from "@/Components/helpers/currencize";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import IconLink from "../UI/IconLink";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDoctorProfilePopup from "./DeleteDoctorProfilePopup";
import WithTitle from "../UI/WithTitle";
import CreateDoctorProfilePopup from "./CreateDoctorProfilePopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

const AdminManageDoctorProfilesPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorProfile<{
      UserPopulated: Record<never, never>;
      MainSpecialityPopulated: Record<never, never>;
      PhoneConsultSettingsPopulated: Record<never, never>;
    }>[]
  >(`${API}/auto/doctorprofile`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="پروفایل پزشکان"
          actions={
            hasAccess("DoctorProfile", "write")
              ? [
                  {
                    title: "جدید",
                    action: () =>
                      setPopup(
                        "CreateDoctorProfile",
                        <CreateDoctorProfilePopup mutate={mutate} />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <Table
            data={data}
            name="AdminManageDoctorProfiles"
            renderer={{
              fullName: {
                name: "نام پزشک",
                value: (node) =>
                  [node.firstName, node.lastName].filter(Boolean).join(" "),
                filter: "Text",
              },
              mainSpeciality: {
                name: "تخصص",
                value: (node) =>
                  node.mainSpeciality?.name || node.mainSpeciality?._id || "",
                component: (node) =>
                  node.mainSpeciality ? (
                    <InlineLink
                      href={adminPath(`/speciality/${node.mainSpeciality._id}`)}
                    >
                      {node.mainSpeciality.name || node.mainSpeciality._id}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
                filter: "Multi",
              },
              medicalSystemCode: {
                name: "کد نظام پزشکی",
                value: (node) => node.medicalSystemCode,
                filter: "Text",
              },
              city: {
                name: "شهر",
                value: (node) => cities.find((c) => c.slug === node.city)?.name,
                filter: "Multi",
              },
              user: {
                name: "مالک",
                value: (node) => node.user?.phone,
                filter: "Text",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone || node.user._id}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              phoneConsult: {
                name: "مشاوره تلفنی",
                value: (node) =>
                  booleanToValue[`${!!node.phoneConsultSettings?.active}`],
                component: (node) => (
                  <BooleanToIcon value={!!node.phoneConsultSettings?.active} />
                ),
                filter: "Set",
              },
              phoneConsultPrice: {
                name: "قیمت مشاوره (ریال)",
                value: (node) => node.phoneConsultSettings?.price,
                component: (node) =>
                  node.phoneConsultSettings?.price !== undefined
                    ? currencize(node.phoneConsultSettings.price)
                    : "—",
                filter: "Number",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    {hasAccess("DoctorProfile", "readOne") && (
                      <IconLink
                        href={adminPath(`/doctorprofile/${node._id}`)}
                        title="ویرایش"
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("DoctorProfile", "delete") && (
                      <IconButton
                        variant="Danger"
                        title="حذف"
                        onClick={() =>
                          setPopup(
                            "DeleetDoctorProfile",
                            <DeleteDoctorProfilePopup
                              mutate={mutate}
                              node={node}
                            />,
                          )
                        }
                      >
                        <GarbageIcon />
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
  );
};

export default AdminManageDoctorProfilesPage;
