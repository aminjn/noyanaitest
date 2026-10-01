"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import { ContentKey } from "@/Components/Enums/contentKeys";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { ta } from "@/Components/Admin/i18n/adminText";
import InlineLink from "../UI/InlineLink";

export const contactRequestSubjects = [
  "support",
  "profile",
  "users",
  "bug",
] as const;

export type ContactRequestSubject = (typeof contactRequestSubjects)[number];

export const contactRequestSubjectDict: Record<ContactRequestSubject, string> =
  {
    get bug() {
  return ta("گزارش خطا");
},
    get profile() {
  return ta("حساب کاربری");
},
    get support() {
  return ta("پشتیبانی");
},
    get users() {
  return ta("کاربران");
},
  };

export const contactRequestSubjectContentKeys: Record<
  ContactRequestSubject,
  ContentKey
> = {
  bug: "reportProblem",
  profile: "profile",
  support: "support",
  users: "users",
};

export const contactRequestStatuses = ["pending", "done"] as const;

export type ContactRequestStatus = (typeof contactRequestStatuses)[number];

export const contactRequestStatusDict: Record<ContactRequestStatus, string> = {
  get done() {
  return ta("تمام شده");
},
  get pending() {
  return ta("منتظر");
},
};

export type ContatcRequestPopulation = Population<Record<never, never>>;

export interface IContactRequest<
  T extends ContatcRequestPopulation = ContatcRequestPopulation,
> extends MongoDoc {
  submittedAt: Date;
  name: string;
  phone: string;
  email?: string;
  subject: ContactRequestSubject;
  content: string;
  status: ContactRequestStatus;
  // support desk (2026-10): staff note, who handled it, the ticket it became
  internalNote?: string;
  handledBy?: { _id: string; phone?: string; username?: string } | null;
  handledAt?: string;
  ticket?: { _id: string; title?: string; status?: string } | string | null;
}

const AdminManageContactRequestsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IContactRequest>
      title={ta("درخواست تماس ها")}
      modelName="contactRequest"
      table={({ mutate }) => ({
        name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
        phone: { name: ta("شماره"), value: (node) => node.phone, filter: "Text" },
        subject: {
          name: ta("موضوع"),
          value: (node) => contactRequestSubjectDict[node.subject],
          filter: "Set",
        },
        status: {
          name: ta("وضعیت"),
          value: (node) => contactRequestStatusDict[node.status],
          filter: "Set",
        },
        handledBy: {
          name: ta("رسیدگی‌کننده"),
          value: (node) =>
            node.handledBy && typeof node.handledBy === "object"
              ? node.handledBy.username || node.handledBy.phone || "—"
              : "—",
          filter: "Set",
        },
        ticket: {
          name: ta("تیکت"),
          value: (node) => (node.ticket ? ta("تیکت شده") : "—"),
          component: (node) => {
            const id = typeof node.ticket === "string" ? node.ticket : node.ticket?._id;
            return id ? (
              <InlineLink href={adminPath(`/ticket/${id}`)}>{ta("مشاهده‌ی تیکت")}</InlineLink>
            ) : (
              "—"
            );
          },
        },
        email: { name: ta("ایمیل"), value: (node) => node.email, filter: "Text" },
        submittedAt: {
          name: ta("زمان ثبت"),
          value: (node) => new Date(node.submittedAt),
          filter: "Date",
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/contactRequest/${node._id}`)}
                title={ta("مشاهده")}
              >
                <EyeIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title={ta("حذف")}
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      nodeId={node._id}
                      mutate={mutate}
                      modelName="contactRequest"
                    />,
                  )
                }
              >
                <GarbageIcon />
              </IconButton>
            </TableActions>
          ),
        },
      })}
    />
  );
};

export default AdminManageContactRequestsPage;
