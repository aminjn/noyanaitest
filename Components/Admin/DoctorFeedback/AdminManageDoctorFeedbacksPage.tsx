"use client";

import { useState } from "react";
import NodesManager from "../UI/NodesManager";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { adminPath } from "@/Components/helpers/adminPath";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";

type FeedbackStatus = "Pending" | "Approved" | "Rejected";

type AdminDoctorFeedback = {
  _id: string;
  overalScore: number;
  suggest?: boolean;
  publicMessage?: string;
  privateMessage?: string;
  status?: FeedbackStatus;
  submittedAt: string;
  doctor?: { _id: string; firstName?: string; lastName?: string; slug?: string } | null;
  user?: { _id: string; phone?: string } | null;
};

const statusDict: Record<FeedbackStatus, string> = {
  Pending: "در انتظار تایید",
  Approved: "تایید شده",
  Rejected: "رد شده",
};

// Verified visit reviews of doctors (2026-09): nothing is public until an
// admin approves it here. Only the status is editable (API editSchema).
const AdminManageDoctorFeedbacksPage = () => {
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const [busyId, setBusyId] = useState<string | null>(null);

  const setStatus = async (
    id: string,
    status: FeedbackStatus,
    mutate: () => unknown,
  ) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await fetcher({
        url: `${API}/auto/doctorFeedback/${id}`,
        method: "POST",
        payload: { status },
      });
      pushNotification(
        status === "Approved" ? "نظر تایید و منتشر شد." : "نظر رد شد.",
        "Success",
      );
      await mutate();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : String(e), "Error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <NodesManager<AdminDoctorFeedback>
      modelName="doctorFeedback"
      title="نظرات بیماران درباره‌ی پزشکان"
      table={({ mutate }) => ({
        status: {
          name: "وضعیت",
          value: (node) => statusDict[node.status || "Pending"],
          filter: "Set",
        },
        doctor: {
          name: "پزشک",
          value: (node) =>
            `${node.doctor?.firstName || ""} ${node.doctor?.lastName || ""}`.trim() || "—",
          component: (node) =>
            node.doctor ? (
              <InlineLink href={`/dr/${node.doctor.slug || node.doctor._id}`}>
                {`${node.doctor.firstName || ""} ${node.doctor.lastName || ""}`.trim() ||
                  node.doctor._id}
              </InlineLink>
            ) : (
              "—"
            ),
          filter: "Multi",
        },
        user: {
          name: "بیمار",
          value: (node) => node.user?.phone || "—",
          component: (node) =>
            node.user ? (
              <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                {node.user.phone || node.user._id}
              </InlineLink>
            ) : (
              "—"
            ),
          filter: "Multi",
        },
        overalScore: {
          name: "امتیاز",
          value: (node) => node.overalScore,
          filter: "Number",
        },
        suggest: {
          name: "پیشنهاد می‌کند",
          value: (node) => (node.suggest ? "بله" : "خیر"),
          filter: "Set",
        },
        publicMessage: {
          name: "متن نظر (عمومی)",
          value: (node) => node.publicMessage || "—",
          filter: "Text",
        },
        privateMessage: {
          name: "پیام خصوصی به نویان",
          value: (node) => node.privateMessage || "—",
          filter: "Text",
        },
        submittedAt: {
          name: "تاریخ ثبت",
          value: (node) => new Date(node.submittedAt),
          filter: "Date",
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              {node.status !== "Approved" && (
                <IconButton
                  variant="Success"
                  title="تایید و انتشار"
                  onClick={() => setStatus(node._id, "Approved", mutate)}
                >
                  <CheckIcon />
                </IconButton>
              )}
              {node.status !== "Rejected" && (
                <IconButton
                  variant="Neutral"
                  title="رد"
                  onClick={() => setStatus(node._id, "Rejected", mutate)}
                >
                  <CloseIcon />
                </IconButton>
              )}
              <IconButton
                variant="Danger"
                title="حذف"
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      modelName="doctorFeedback"
                      nodeId={node._id}
                      mutate={mutate}
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

export default AdminManageDoctorFeedbacksPage;
