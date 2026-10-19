import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { useState } from "react";
import useSWR from "swr";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import Button from "@/Components/UI/Button";
import Loading from "../UI/Loading";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./DeleteDoctorProfilePopup.module.css";

// The doctor's full delete (2026-10, the owner's rule: everything that hangs
// on the profile goes with it, nothing left half-broken). The backend scans
// every table for records pointing at the profile (Lib/cascadeDelete.ts):
// first it shows, table by table, what will be deleted and where only the
// link to the doctor is removed; the delete runs on confirmation.
type Row = { model: string; path: string; action: "delete" | "unset" | "pull"; count: number };

const modelLabels: Record<string, () => string> = {
  Reservation: () => ta("نوبت‌ها"),
  Booking: () => ta("رزروها"),
  Transaction: () => ta("تراکنش‌ها"),
  Service: () => ta("خدمات"),
  ServicePackage: () => ta("بسته‌های خدمت"),
  ClinicDoctor: () => ta("عضویت در کلینیک‌ها"),
  HospitalDoctor: () => ta("عضویت در بیمارستان‌ها"),
  DoctorJoinClinicRequest: () => ta("درخواست‌های عضویت در کلینیک"),
  DoctorJoinHospitalRequest: () => ta("درخواست‌های عضویت در بیمارستان"),
  Prescription: () => ta("نسخه‌ها"),
  Prescription2: () => ta("نسخه‌ها"),
  VisitPrescription: () => ta("نسخه‌ها"),
  VisitNote: () => ta("یادداشت‌های ویزیت"),
  DoctorFeedback: () => ta("نظرات بیماران"),
  DoctorShift: () => ta("شیفت‌ها"),
  DoctorSession: () => ta("نوبت‌های کاری"),
  Office: () => ta("مطب‌ها"),
  DoctorFaq: () => ta("سؤالات متداول پزشک"),
  DoctorPatient: () => ta("بیماران پزشک"),
  InsuranceContract: () => ta("قراردادهای بیمه"),
  Hospital: () => ta("بیمارستان‌ها"),
  User: () => ta("کاربران"),
  Speciality: () => ta("تخصص‌ها"),
};
const numbers = adminNumberFormat();

const DeleteDoctorProfilePopup = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const { data: rows, error } = useSWR<Row[]>(
    `${API}/admin/cascade/doctorprofile/${node._id}`,
    (url: string) => fetcher({ url }).then((res) => (Array.isArray(res?.data?.rows) ? res.data.rows : [])),
  );
  const name = [node.firstName, node.lastName].filter(Boolean).join(" ") || ta("بدون نام");
  const deletes = (rows || []).filter((r) => r.action === "delete");
  const links = (rows || []).filter((r) => r.action !== "delete");
  const label = (r: Row) => (modelLabels[r.model] ? modelLabels[r.model]() : r.model);

  const onConfirm = async () => {
    setBusy(true);
    try {
      await fetcher({ url: `${API}/admin/cascade/doctorprofile/${node._id}`, method: "DELETE" });
      pushNotification(ta("پروفایل پزشک و همه‌ی اطلاعات وابسته حذف شد"), "Success");
      mutate();
      closePopup();
    } catch (e) {
      pushNotification(e instanceof Error ? e.message : ta("حذف انجام نشد"), "Error");
      setBusy(false);
    }
  };

  return (
    <div className={classes.main}>
      <p className={classes.title}>{ta("حذف کامل پروفایل پزشک «${1}»", [name])}</p>
      {!rows && !error ? (
        <Loading />
      ) : error ? (
        <p className={classes.error}>{error instanceof Error ? error.message : ta("حذف انجام نشد")}</p>
      ) : (
        <>
          {!rows!.length && <p className={classes.note}>{ta("این پزشک هیچ اطلاعات وابسته‌ای ندارد؛ فقط خود پروفایل حذف می‌شود.")}</p>}
          {!!deletes.length && (
            <div className={classes.group}>
              <p className={classes.groupTitle}>{ta("این‌ها هم حذف می‌شوند")}</p>
              <ul className={classes.list}>
                {deletes.map((r) => (
                  <li key={`${r.model}.${r.path}`}>
                    <span>{label(r)}</span>
                    <b>{numbers.format(r.count)}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!links.length && (
            <div className={classes.group}>
              <p className={classes.groupTitle}>{ta("فقط نام این پزشک از این‌ها برداشته می‌شود")}</p>
              <ul className={classes.list}>
                {links.map((r) => (
                  <li key={`${r.model}.${r.path}`}>
                    <span>{label(r)}</span>
                    <b>{numbers.format(r.count)}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!deletes.length && (
            <p className={classes.warn}>{ta("این کار برگشت‌پذیر نیست. اگر فقط می‌خواهید پزشک در سایت دیده نشود، به‌جای حذف غیرفعالش کنید.")}</p>
          )}
        </>
      )}
      <div className={classes.actions}>
        <Button variant="Error" isLoading={busy} onClick={busy || !rows ? undefined : onConfirm}>
          {ta("حذف کامل")}
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          {ta("انصراف")}
        </Button>
      </div>
    </div>
  );
};

export default DeleteDoctorProfilePopup;
