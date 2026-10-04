"use client";

import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { adminPath } from "@/Components/helpers/adminPath";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import { ta } from "@/Components/Admin/i18n/adminText";
import { removeReviewReply, useModeration } from "../Support/moderation";
import { VerificationCell, verificationLabel } from "../Support/reviewVerification";
import useNotification from "@/Components/Hooks/useNotification";
import supportClasses from "../Support/support.module.css";

type FeedbackStatus = "Pending" | "Approved" | "Rejected";

type AdminDoctorFeedback = {
  _id: string;
  overalScore: number;
  suggest?: boolean;
  publicMessage?: string;
  privateMessage?: string;
  status?: FeedbackStatus;
  rejectReason?: string;
  submittedAt: string;
  doctor?: { _id: string; firstName?: string; lastName?: string; slug?: string } | null;
  user?: { _id: string; phone?: string } | null;
  reservation?: { _id: string; date?: string } | string | null;
  reply?: { content?: string; at?: string } | null;
};

const statusDict: Record<FeedbackStatus, string> = {
  get Pending() {
    return ta("در انتظار تایید");
  },
  get Approved() {
    return ta("تایید شده");
  },
  get Rejected() {
    return ta("رد شده");
  },
};

const doctorName = (node: AdminDoctorFeedback) =>
  `${node.doctor?.firstName || ""} ${node.doctor?.lastName || ""}`.trim();

const reservationId = (node: AdminDoctorFeedback) =>
  typeof node.reservation === "string" ? node.reservation : node.reservation?._id;

// Verified visit reviews of doctors: nothing is public until an admin
// approves it here. One by one or in bulk; a rejection keeps its reason.
const AdminManageDoctorFeedbacksPage = () => {
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const hasAccess = useAccessLevel();
  const { data, error, mutate } = useSWR<AdminDoctorFeedback[]>(
    `${API}/auto/doctorFeedback`,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res?.data?.data) ? res.data.data : [])),
  );
  const canModerate = hasAccess("DoctorFeedback", "update");
  const { bar, checkboxColumn, tableRows, approve, reject } = useModeration({
    kind: "doctorfeedback",
    rows: data || [],
    mutate,
  });

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("نظرات بیماران درباره‌ی پزشکان")}>
          <div className={supportClasses.stack}>
            {canModerate && bar}
            <Table
              name="AdminManagedoctorFeedbacks"
              data={tableRows}
              renderer={{
                ...(canModerate ? { select: checkboxColumn } : {}),
                status: {
                  name: ta("وضعیت"),
                  value: (node) => statusDict[node.status || "Pending"],
                  component: (node) => (
                    <span title={node.rejectReason || undefined}>
                      {statusDict[node.status || "Pending"]}
                      {node.status === "Rejected" && node.rejectReason && (
                        <span className={supportClasses.reason}>{` (${node.rejectReason})`}</span>
                      )}
                    </span>
                  ),
                  filter: "Set",
                },
                doctor: {
                  name: ta("پزشک"),
                  value: (node) => doctorName(node) || "—",
                  component: (node) =>
                    node.doctor?._id ? (
                      <InlineLink href={adminPath(`/doctorprofile/${node.doctor._id}`)}>
                        {doctorName(node) || node.doctor._id}
                      </InlineLink>
                    ) : (
                      "—"
                    ),
                  filter: "Multi",
                },
                user: {
                  name: ta("بیمار"),
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
                reservation: {
                  name: ta("نوبت"),
                  value: (node) => (reservationId(node) ? ta("مشاهده‌ی نوبت") : "—"),
                  component: (node) => {
                    const id = reservationId(node);
                    return id ? (
                      <InlineLink href={adminPath(`/reservation/${id}`)}>
                        {ta("مشاهده‌ی نوبت")}
                      </InlineLink>
                    ) : (
                      "—"
                    );
                  },
                },
                // only reviews backed by a completed visit count toward the
                // doctor's public score (legacy ones stay here only)
                verification: {
                  name: ta("احراز ویزیت / خرید"),
                  value: (node) => verificationLabel(reservationId(node) ? "visit" : "unverified"),
                  component: (node) => (
                    <VerificationCell
                      state={reservationId(node) ? "visit" : "unverified"}
                      at={typeof node.reservation === "object" ? node.reservation?.date : undefined}
                    />
                  ),
                  filter: "Set",
                },
                overalScore: {
                  name: ta("امتیاز"),
                  value: (node) => node.overalScore,
                  filter: "Number",
                },
                suggest: {
                  name: ta("پیشنهاد می‌کند"),
                  value: (node) => (node.suggest ? ta("بله") : ta("خیر")),
                  filter: "Set",
                },
                publicMessage: {
                  name: ta("متن نظر (عمومی)"),
                  value: (node) => node.publicMessage || "—",
                  filter: "Text",
                },
                reply: {
                  name: ta("پاسخ ارائه‌دهنده"),
                  value: (node) => node.reply?.content || "—",
                  filter: "Text",
                },
                privateMessage: {
                  name: ta("پیام خصوصی به نویان"),
                  value: (node) => node.privateMessage || "—",
                  filter: "Text",
                },
                submittedAt: {
                  name: ta("تاریخ ثبت"),
                  value: (node) => new Date(node.submittedAt),
                  filter: "Date",
                },
                actions: {
                  name: ta("عملیات"),
                  width: 208,
                  component: (node) => (
                    <TableActions>
                      {canModerate && node.status !== "Approved" && (
                        <IconButton
                          variant="Success"
                          title={ta("تایید و انتشار")}
                          onClick={() => approve([node._id])}
                        >
                          <CheckIcon />
                        </IconButton>
                      )}
                      {canModerate && node.status !== "Rejected" && (
                        <IconButton
                          variant="Neutral"
                          title={ta("رد با ذکر دلیل")}
                          onClick={() => reject([node._id])}
                        >
                          <CloseIcon />
                        </IconButton>
                      )}
                      {canModerate && !!node.reply?.content && (
                        <IconButton
                          variant="Neutral"
                          title={ta("حذف پاسخ ارائه‌دهنده")}
                          onClick={async () => {
                            try {
                              await removeReviewReply("doctorfeedback", [node._id]);
                              pushNotification(ta("پاسخ حذف شد"), "Success");
                              await mutate();
                            } catch (err) {
                              pushNotification((err as Error).message, "Error");
                            }
                          }}
                        >
                          <GarbageIcon />
                        </IconButton>
                      )}
                      {hasAccess("DoctorFeedback", "delete") && (
                        <IconButton
                          variant="Danger"
                          title={ta("حذف")}
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
                      )}
                    </TableActions>
                  ),
                },
              }}
            />
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorFeedbacksPage;
