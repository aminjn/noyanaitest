"use client";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
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
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorProfilesPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorProfile<{
      UserPopulated: Record<never, never>;
      MainSpecialityPopulated: Record<never, never>;
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
          title={ta("پروفایل پزشکان")}
          actions={
            hasAccess("DoctorProfile", "write")
              ? [
                  {
                    title: ta("جدید"),
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
                name: ta("نام پزشک"),
                value: (node) =>
                  [node.firstName, node.lastName].filter(Boolean).join(" "),
                filter: "Text",
              },
              mainSpeciality: {
                name: ta("تخصص"),
                value: (node) =>
                  node.mainSpeciality?.name || "",
                component: (node) =>
                  node.mainSpeciality ? (
                    <InlineLink
                      href={adminPath(`/speciality/${node.mainSpeciality._id}`)}
                    >
                      {node.mainSpeciality.name || ta("بدون نام")}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
                filter: "Multi",
              },
              claimed: {
                name: ta("حساب پزشک"),
                value: (node) =>
                  (node as { claimed?: boolean }).claimed === false
                    ? ta("بدون حساب (از فهرست قدیم)")
                    : ta("دارد"),
                filter: "Set",
              },
              medicalSystemCode: {
                name: ta("کد نظام پزشکی"),
                value: (node) => node.medicalSystemCode,
                filter: "Text",
              },
              city: {
                name: ta("شهر"),
                // the profile references a Geo City document (populated)
                value: (node) =>
                  (node.city as unknown as { name?: string } | undefined)
                    ?.name,
                filter: "Multi",
              },
              user: {
                name: ta("مالک"),
                value: (node) => node.user?.phone,
                filter: "Text",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone || ta("بدون نام")}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              // replaces the «مشاوره تلفنی» / price columns: nothing can
              // set PhoneConsultSettings (no admin endpoint, the doctor panel
              // does not offer the "phone" kind), so they were always empty
              active: {
                name: ta("فعال"),
                value: (node) => booleanToValue[`${!!node.active}`],
                component: (node) => <BooleanToIcon value={!!node.active} />,
                filter: "Set",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {hasAccess("DoctorProfile", "readOne") && (
                      <IconLink
                        href={adminPath(`/doctorprofile/${node._id}`)}
                        title={ta("ویرایش")}
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("DoctorProfile", "delete") && (
                      <IconButton
                        variant="Danger"
                        title={ta("حذف")}
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
