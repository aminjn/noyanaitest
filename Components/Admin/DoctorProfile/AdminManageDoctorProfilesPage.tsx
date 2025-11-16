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
import { provinces } from "@/Components/Enums/Provinces";
import { cities } from "@/Components/Enums/Cities";
import { booleanToValue } from "@/Components/UI/BooleanToIcon";
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
    fetcher({ url }).then((res) => res.data.data)
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
                        <CreateDoctorProfilePopup mutate={mutate} />
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
              mainSpeciality: {
                name: "تخصص",
                value: (node) =>
                  node.mainSpeciality?.name || node.mainSpeciality?._id || "",
                component: (node) =>
                  node.mainSpeciality ? (
                    <InlineLink href={adminPath(`/speciality/${node._id}`)}>
                      {node.mainSpeciality.name || node.mainSpeciality._id}
                    </InlineLink>
                  ) : (
                    ""
                  ),
                filter: "Multi",
              },
              medicalSystemCode: {
                name: "کد نظام پزشکی",
                value: (node) => node.medicalSystemCode,
                filter: "Text",
              },
              website: {
                name: "سایت",
                value: (node) => node.website,
                filter: "Text",
              },
              landLine: {
                name: "تلفن",
                value: (node) => node.landLine,
                filter: "Text",
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
              user: {
                name: "صاحب",
                value: (node) => node.user?.phone,
                filter: "Text",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node._id}`)}>
                      {node.user.phone}
                    </InlineLink>
                  ) : (
                    ""
                  ),
              },
              phoneConsult: {
                name: "مشاوره تلفنی",
                value: (node) =>
                  booleanToValue[`${!!node.phoneConsultSettings?.active}`],
                filter: "Set",
              },
              phoneConsultDuration: {
                name: "مدت زمان مشاوره تلفنی(دقیقه)",
                value: (node) => node.phoneConsultSettings?.duration,
                filter: "Number",
              },
              phoneConsultPrice: {
                name: "قیمت مشاوره تلفنی(ریال)",
                value: (node) => node.phoneConsultSettings?.price,
                component: (node) =>
                  node.phoneConsultSettings
                    ? currencize(node.phoneConsultSettings.price)
                    : "",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    {hasAccess("DoctorProfile", "readOne") && (
                      <IconLink href={adminPath(`/doctorprofile/${node._id}`)}>
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("DoctorProfile", "delete") && (
                      <IconButton
                        variant="Danger"
                        onClick={() =>
                          setPopup(
                            "DeleetDoctorProfile",
                            <DeleteDoctorProfilePopup
                              mutate={mutate}
                              node={node}
                            />
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
