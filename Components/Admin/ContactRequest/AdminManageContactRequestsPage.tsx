"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import useLocale from "@/Components/Hooks/useLocale";
import FormatDate from "@/Components/UI/FormatDate";
import { ContentKey } from "@/Components/Enums/contentKeys";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { adminPath } from "@/Components/helpers/adminPath";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";

export const contactRequestSubjects = [
  "support",
  "profile",
  "users",
  "bug",
] as const;

export type ContactRequestSubject = (typeof contactRequestSubjects)[number];

export const contactRequestSubjectDict: Record<ContactRequestSubject, string> =
  {
    bug: "گزارش خطا",
    profile: "حساب کاربری",
    support: "پشتیبانی",
    users: "کاربران",
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
  done: "تمام شده",
  pending: "منتظر",
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
}

const AdminManageContactRequestsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IContactRequest>
      title="درخواست تماس ها"
      modelName="contactRequest"
      table={({ mutate }) => ({
        submittedAt: {
          name: "زمان ثبت",
          value: (node) => node.submittedAt,
          component: (node) => <FormatDate value={node.submittedAt} />,
          filter: "Date",
        },
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        phone: { name: "شماره", value: (node) => node.phone, filter: "Text" },
        email: { name: "ایمیل", value: (node) => node.email, filter: "Text" },
        subject: {
          name: "موضوع",
          value: (node) => contactRequestSubjectDict[node.subject],
          filter: "Set",
        },
        status: {
          name: "وضعیت",
          value: (node) => contactRequestStatusDict[node.status],
          filter: "Set",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/contactRequest/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
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
