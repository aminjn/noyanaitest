"use client";

import { useEffect, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import pay from "./Payroll.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import { PayContext, PayEmployee, toNum, usePay, usePayAccounts, usePayEmployees, usePayText } from "./payShared";

const POPUP = "PayEmployeeForm";

const latin = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");

// An advance (مساعده) paid now and taken back from a later payslip as a
// deduction.
const AdvanceForm = ({ employee }: { employee: PayEmployee }) => {
  const t = usePayText();
  const f = useBizFormat();
  const [balance, setBalance] = useState(employee.advanceBalance || 0);
  const { api } = usePay();
  const pushNotification = useNotification();
  const { data: accounts } = usePayAccounts();
  const [amount, setAmount] = useState("");
  const [via, setVia] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy || !via || !(toNum(amount) > 0)) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/employees/${employee._id}/advance`,
        method: "POST",
        payload: { amount: toNum(amount), via, date: isoDay(date) },
      });
      pushNotification(t("payAdvancePaid"), "Success");
      setBalance((b) => b + toNum(amount));
      setAmount("");
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={pay.subCard}>
      <span className={classes.cardTitle}>{t("payAdvance")}</span>
      <p className={classes.muted}>{t("payAdvanceHint")}</p>
      <p className={classes.muted}>
        {t("payAdvanceBalance")}: <strong>{f.money(balance)}</strong>
      </p>
      <div className={classes.form}>
        <label className={classes.field}>
          {t("bizAmount")}
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
        </label>
        <label className={classes.field}>
          {t("payPayFrom")}
          <select value={via} onChange={(e) => setVia(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {asArray<{ _id: string; name: string }>(accounts).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={busy || !via || !(toNum(amount) > 0)} onClick={save}>
            {t("payAdvancePay")}
          </button>
        </div>
      </div>
    </section>
  );
};

const EmployeeForm = ({ employee, onDone }: { employee?: PayEmployee; onDone: () => unknown }) => {
  const t = usePayText();
  const { api } = usePay();
  const popup = usePopup();
  const close = () => popup.closePopup(POPUP);
  const pushNotification = useNotification();
  const [name, setName] = useState(employee?.name || "");
  const [nationalId, setNationalId] = useState(employee?.nationalId || "");
  const [mobile, setMobile] = useState(employee?.mobile || "");
  const [position, setPosition] = useState(employee?.position || "");
  const [hireDate, setHireDate] = useState<Date | null>(employee?.hireDate ? new Date(employee.hireDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(employee?.endDate ? new Date(employee.endDate) : null);
  const [baseSalary, setBaseSalary] = useState(employee ? String(employee.baseSalary) : "");
  const [children, setChildren] = useState(employee ? String(employee.children) : "0");
  const [housing, setHousing] = useState(employee?.housing ?? true);
  const [food, setFood] = useState(employee?.food ?? true);
  const [insured, setInsured] = useState(employee?.insured ?? true);
  const [insuranceNo, setInsuranceNo] = useState(employee?.insuranceNo || "");
  const [taxable, setTaxable] = useState(employee?.taxable ?? true);
  const [iban, setIban] = useState(employee?.iban || "");
  const [isActive, setIsActive] = useState(employee?.isActive ?? true);
  const [firstName, setFirstName] = useState(employee?.firstName || "");
  const [lastName, setLastName] = useState(employee?.lastName || "");
  const [fatherName, setFatherName] = useState(employee?.fatherName || "");
  const [idNumber, setIdNumber] = useState(employee?.idNumber || "");
  const [idPlace, setIdPlace] = useState(employee?.idPlace || "");
  const [birthDate, setBirthDate] = useState<Date | null>(employee?.birthDate ? new Date(employee.birthDate) : null);
  const [gender, setGender] = useState<string>(employee?.gender || "");
  const [nationality, setNationality] = useState(employee?.nationality || "");
  const [jobCode, setJobCode] = useState(employee?.jobCode || "");
  const [education, setEducation] = useState<string>(employee?.education || "");
  const [postalCode, setPostalCode] = useState(employee?.postalCode || "");
  const [contractType, setContractType] = useState<string>(employee?.contractType || "");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: employee ? `${API}${api}/employees/${employee._id}` : `${API}${api}/employees`,
        method: employee ? "PATCH" : "POST",
        payload: {
          name: name.trim(),
          nationalId: nationalId.trim(),
          mobile: mobile.trim() || undefined,
          position: position.trim() || undefined,
          hireDate: hireDate ? isoDay(hireDate) : null,
          endDate: endDate ? isoDay(endDate) : null,
          baseSalary: toNum(baseSalary),
          children: Math.round(toNum(children)),
          housing,
          food,
          insured,
          insuranceNo: insuranceNo.trim() || undefined,
          taxable,
          iban: iban.replace(/\s/g, ""),
          ...(employee ? { isActive } : {}),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          fatherName: fatherName.trim(),
          idNumber: idNumber.trim(),
          idPlace: idPlace.trim(),
          birthDate: birthDate ? isoDay(birthDate) : null,
          gender: gender || null,
          nationality: nationality.trim(),
          jobCode: latin(jobCode),
          education: education || null,
          postalCode: latin(postalCode),
          contractType: contractType || null,
        },
      });
      pushNotification(t("bizSaved"), "Success");
      close();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  const check = (label: string, value: boolean, set: (v: boolean) => void) => (
    <label className={pay.check}>
      <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <PopupCard title={employee ? employee.name : t("payAddEmployee")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <label className={classes.field}>
            {t("payName")}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
          </label>
          <label className={classes.field}>
            {t("payPosition")}
            <input value={position} onChange={(e) => setPosition(e.target.value)} maxLength={100} placeholder={t("payPositionHint")} />
          </label>
          <label className={classes.field}>
            {t("payNationalId")}
            <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} maxLength={10} dir="ltr" inputMode="numeric" />
          </label>
          <label className={classes.field}>
            {t("payMobile")}
            <input value={mobile} onChange={(e) => setMobile(e.target.value)} maxLength={20} dir="ltr" inputMode="tel" />
          </label>
          <div className={classes.field}>
            <DateInput title={t("payHireDate")} defaultValue={hireDate || undefined} onChange={(d) => setHireDate(d)} />
          </div>
          <div className={classes.field}>
            <DateInput title={t("payEndDate")} defaultValue={endDate || undefined} onChange={(d) => setEndDate(d)} />
          </div>
          <label className={classes.field}>
            {t("payBaseSalary")}
            <input value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} inputMode="numeric" />
          </label>
          <label className={classes.field}>
            {t("payChildren")}
            <input value={children} onChange={(e) => setChildren(e.target.value)} inputMode="numeric" />
          </label>
          <label className={classes.field}>
            {t("payInsuranceNo")}
            <input value={insuranceNo} onChange={(e) => setInsuranceNo(e.target.value)} maxLength={20} dir="ltr" inputMode="numeric" />
          </label>
          <label className={classes.field}>
            {t("payIban")}
            <input value={iban} onChange={(e) => setIban(e.target.value)} maxLength={34} dir="ltr" placeholder="IR…" />
          </label>
          <div className={`${pay.checks} ${classes.wide}`}>
            {check(t("payHousing"), housing, setHousing)}
            {check(t("payFood"), food, setFood)}
            {check(t("payInsured"), insured, setInsured)}
            {check(t("payTaxable"), taxable, setTaxable)}
            {!!employee && check(t("payActive"), isActive, setIsActive)}
          </div>
          <p className={`${classes.muted} ${classes.wide}`}>{t("payEmployeeHint")}</p>
        </div>
        <details className={pay.tamin} open={!!employee && insured && !employee.jobCode}>
          <summary>{t("payTaminDetails")}</summary>
          <p className={classes.muted}>{t("payTaminDetailsHint")}</p>
          <div className={classes.form}>
            <label className={classes.field}>
              {t("payFirstName")}
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} />
            </label>
            <label className={classes.field}>
              {t("payLastName")}
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} />
            </label>
            <label className={classes.field}>
              {t("payFatherName")}
              <input value={fatherName} onChange={(e) => setFatherName(e.target.value)} maxLength={100} />
            </label>
            <label className={classes.field}>
              {t("payIdNumber")}
              <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} maxLength={15} dir="ltr" inputMode="numeric" />
            </label>
            <label className={classes.field}>
              {t("payIdPlace")}
              <input value={idPlace} onChange={(e) => setIdPlace(e.target.value)} maxLength={100} />
            </label>
            <div className={classes.field}>
              <DateInput title={t("payBirthDate")} defaultValue={birthDate || undefined} onChange={(d) => setBirthDate(d)} />
            </div>
            <label className={classes.field}>
              {t("payGender")}
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">—</option>
                <option value="female">{t("payFemale")}</option>
                <option value="male">{t("payMale")}</option>
              </select>
            </label>
            <label className={classes.field}>
              {t("payNationality")}
              <input value={nationality} onChange={(e) => setNationality(e.target.value)} maxLength={20} placeholder={t("payNationalityHint")} />
            </label>
            <label className={classes.field}>
              {t("payJobCode")}
              <input value={jobCode} onChange={(e) => setJobCode(e.target.value)} maxLength={6} dir="ltr" inputMode="numeric" />
            </label>
          </div>
        </details>
        <details className={pay.tamin} open={!!employee && !employee.education}>
          <summary>{t("payTaxDetails")}</summary>
          <p className={classes.muted}>{t("payTaxDetailsHint")}</p>
          <div className={classes.form}>
            <label className={classes.field}>
              {t("payEducation")}
              <select value={education} onChange={(e) => setEducation(e.target.value)}>
                <option value="">—</option>
                <option value="belowDiploma">{t("payEduBelowDiploma")}</option>
                <option value="diploma">{t("payEduDiploma")}</option>
                <option value="associate">{t("payEduAssociate")}</option>
                <option value="bachelor">{t("payEduBachelor")}</option>
                <option value="master">{t("payEduMaster")}</option>
                <option value="doctorate">{t("payEduDoctorate")}</option>
              </select>
            </label>
            <label className={classes.field}>
              {t("payContractType")}
              <select value={contractType} onChange={(e) => setContractType(e.target.value)}>
                <option value="">—</option>
                <option value="permanent">{t("payContractPermanent")}</option>
                <option value="temporary">{t("payContractTemporary")}</option>
                <option value="partTime">{t("payContractPartTime")}</option>
              </select>
            </label>
            <label className={classes.field}>
              {t("payPostalCode")}
              <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} maxLength={10} dir="ltr" inputMode="numeric" />
            </label>
          </div>
        </details>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={close}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2 || baseSalary === ""} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
        {!!employee && <AdvanceForm employee={employee} />}
      </div>
    </PopupCard>
  );
};

const PayrollEmployees = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = usePayText();
  const f = useBizFormat();
  const ctx = usePay();
  const { setPopup } = usePopup();
  const { data, error, mutate } = usePayEmployees();
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const open = (e?: PayEmployee) =>
    ctx.canWrite &&
    setPopup(
      POPUP,
      <PayContext.Provider value={ctx}>
        <EmployeeForm employee={e} onDone={changed} />
      </PayContext.Provider>,
    );
  const rows = asArray<PayEmployee>(data);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("payTabEmployees")}</span>
        {ctx.canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("payAddEmployee")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("payNoEmployees")}</p>
          ) : (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("payName")}</th>
                    <th>{t("payPosition")}</th>
                    <th className={classes.num}>{t("payBaseSalary")}</th>
                    <th className={classes.num}>{t("payChildren")}</th>
                    <th className={classes.num}>{t("payAdvanceBalance")}</th>
                    <th>{t("payInsured")}</th>
                    <th>{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr
                      key={e._id}
                      className={`${ctx.canWrite ? classes.rowLink : ""} ${e.isActive ? "" : pay.inactive}`}
                      tabIndex={ctx.canWrite ? 0 : undefined}
                      onClick={() => open(e)}
                      onKeyDown={(ev) => ev.key === "Enter" && open(e)}
                    >
                      <td className={classes.wrap}>{e.name}</td>
                      <td>{e.position || "—"}</td>
                      <td className={classes.num}>{f.money(e.baseSalary)}</td>
                      <td className={classes.num}>{f.money(e.children)}</td>
                      <td className={classes.num}>{f.money(e.advanceBalance || 0)}</td>
                      <td>{e.insured ? t("payYes") : t("payNo")}</td>
                      <td>
                        <span className={`${classes.badge} ${e.isActive ? pay.badgeOk : ""}`}>
                          {t(e.isActive ? "payActive" : "payInactive")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </HandleLoading>
    </section>
  );
};

export default PayrollEmployees;
