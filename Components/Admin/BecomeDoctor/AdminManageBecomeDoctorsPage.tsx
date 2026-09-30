"use client";
import useSWR from "swr";
import classes from "./AdminManageBecomeDoctorsPage.module.css";
import {
  becomeNodeStatusesDict,
  IBecomeDoctorRequest,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { cities } from "@/Components/Enums/Cities";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteBecomeDoctorPopup from "./DeleteBecomeDoctorPopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeDoctorsPage = () => {
  const { data, error, mutate } = useSWR<
    IBecomeDoctorRequest<{ UserPopulated: true }>[]
  >(`${API}/auto/becomedoctor`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های پزشک شدن")}>
          <Table
            data={data}
            name="AdminManageBecomeDoctors"
            renderer={{
              fullName: {
                name: ta("نام و نام خانوادگی"),
                value: (node) =>
                  [node.firstName, node.lastName].filter(Boolean).join(" "),
                filter: "Text",
              },
              user: {
                name: ta("کاربر"),
                value: (node) => node.user?.phone,
                filter: "Text",
                component: (node) =>
                  node.user?._id ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone || "—"}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              medicalSystemTitle: {
                name: ta("عنوان نظام پزشکی"),
                value: (node) =>
                  node.medicalSystemTitle ? ta(node.medicalSystemTitle) : "—",
                filter: "Set",
              },
              city: {
                name: ta("شهر"),
                value: (node) => cities.find((c) => c.slug === node.city)?.name,
                filter: "Multi",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              createdAt: {
                name: ta("زمان درخواست"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {hasAccess("BecomeDoctorRequest", "readOne") && (
                      <IconLink
                        href={adminPath(`/becomedoctor/${node._id}`)}
                        variant="Info"
                        title={ta("ویرایش")}
                      >
                        <EditIcon />
                      </IconLink>
                    )}
                    {hasAccess("BecomeDoctorRequest", "delete") && (
                      <IconButton
                        variant="Danger"
                        title={ta("حذف")}
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

export default AdminManageBecomeDoctorsPage;
