"use client";

import { useEffect, useMemo, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import Button from "@/Components/UI/Button";
import {
  AccessLevelModel,
  AccessOperation,
  IAccessLevel,
  accessLevelModelDict,
  accessLevelModels,
  accessOperations,
} from "./AdminManageAccessLevelsPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AccessLevelMatrix.module.css";

type Grants = Partial<Record<AccessLevelModel, Partial<Record<AccessOperation, boolean>>>>;

// Sections of the panel, the way the admin menu groups them. A model that
// isn't listed here still shows, under "other", so a new one is never
// hidden from the matrix.
const groups: { title: () => string; models: AccessLevelModel[] }[] = [
  {
    title: () => ta("ارائه‌دهندگان"),
    models: [
      "DoctorProfile", "Doctor", "Clinic", "ClinicDepartment", "ClinicDoctor",
      "Hospital", "HospitalDepartment", "HospitalDoctor", "ParaClinic", "Pharmacy",
      "Insurance", "DoctorFaq", "GalleryItem",
    ],
  },
  {
    title: () => ta("درخواست‌ها"),
    models: [
      "BecomeDoctorRequest", "BecomeClinicRequest", "BecomeHospitalRequest",
      "BecomePharmacyRequest", "BecomeParaClinicRequest", "BecomeInsuranceRequest",
      "ClinicAdditionRequest", "HospitalAdditionRequest", "PharmacyAdditionRequest",
      "InsuranceAdditionRequest", "DoctorJoinClinic", "DoctorJoinHospital",
    ],
  },
  {
    title: () => ta("کاربران و پشتیبانی"),
    models: ["User", "Comment", "CallRoom"],
  },
  {
    title: () => ta("کاتالوگ و دانشنامه"),
    models: ["Sepciality", "Disease", "Drug", "Symptom", "Part"],
  },
  {
    title: () => ta("محتوا و سایت"),
    models: [
      "Blog", "BlogCategory", "BlogMedia", "Faq", "InlineAdvertisement",
      "TextContent", "Redirection", "ShortLink",
    ],
  },
];

// Short column titles; the long ones are the operation names on hover.
const opTitle: Record<AccessOperation, () => string> = {
  readAll: () => ta("دیدن فهرست"),
  readOne: () => ta("دیدن جزئیات"),
  write: () => ta("ساختن"),
  update: () => ta("ویرایش"),
  delete: () => ta("حذف"),
};

// One matrix for a role (2026-09 audit, after Doctolib Pro / Practo Ray
// roles): every section a row, every operation a column, instead of one tab
// per section with five switches each. Saved in one request.
const AccessLevelMatrix = ({
  node,
  mutate,
}: {
  node: IAccessLevel;
  mutate: () => unknown;
}) => {
  const pushNotification = useNotification();
  const initial = useMemo<Grants>(() => {
    const out: Grants = {};
    for (const model of accessLevelModels) {
      const value = (node as unknown as Grants)[model] || {};
      out[model] = Object.fromEntries(
        accessOperations.map((op) => [op, !!value[op]]),
      );
    }
    return out;
  }, [node]);
  const [grants, setGrants] = useState<Grants>(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setGrants(initial), [initial]);

  const listed = new Set(groups.flatMap((g) => g.models));
  const other = accessLevelModels.filter((m) => !listed.has(m));
  const allGroups = [
    ...groups,
    ...(other.length ? [{ title: () => ta("سایر"), models: other }] : []),
  ];

  const has = (m: AccessLevelModel, op: AccessOperation) => !!grants[m]?.[op];
  const set = (m: AccessLevelModel, op: AccessOperation, v: boolean) =>
    setGrants((prev) => {
      const row = { ...(prev[m] || {}), [op]: v };
      // seeing a record's page needs its list, and changing it needs seeing it
      if (v && op !== "readAll") row.readAll = true;
      if (v && (op === "update" || op === "delete")) row.readOne = true;
      if (!v && op === "readAll")
        for (const other of accessOperations) row[other] = false;
      return { ...prev, [m]: row };
    });
  const setRow = (m: AccessLevelModel, v: boolean) =>
    setGrants((prev) => ({
      ...prev,
      [m]: Object.fromEntries(accessOperations.map((op) => [op, v])),
    }));
  const setGroup = (models: AccessLevelModel[], v: boolean) =>
    setGrants((prev) => {
      const next = { ...prev };
      for (const m of models)
        next[m] = Object.fromEntries(accessOperations.map((op) => [op, v]));
      return next;
    });

  const dirty = JSON.stringify(grants) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    try {
      const $set: Record<string, boolean> = {};
      for (const m of accessLevelModels)
        for (const op of accessOperations) $set[`${m}.${op}`] = has(m, op);
      await fetcher({
        url: `${API}/auto/accesslevel/${node._id}`,
        method: "POST",
        payload: { $set },
        bodyParser: "JSON",
      });
      pushNotification(ta("دسترسی‌ها ذخیره شد"), "Success");
      await mutate();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={classes.main}>
      <p className={classes.hint}>
        {ta("هر ردیف یک بخش پنل است. «ساختن»، «ویرایش» و «حذف» خودبه‌خود «دیدن» را هم روشن می‌کنند.")}
      </p>
      <div className={classes.scroll}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th className={classes.sectionCol}>{ta("بخش")}</th>
              {accessOperations.map((op) => (
                <th key={op}>{opTitle[op]()}</th>
              ))}
              <th>{ta("همه")}</th>
            </tr>
          </thead>
          {allGroups.map((group) => {
            const all = group.models.every((m) =>
              accessOperations.every((op) => has(m, op)),
            );
            return (
              <tbody key={group.title()}>
                <tr className={classes.groupRow}>
                  <th colSpan={accessOperations.length + 1}>{group.title()}</th>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={ta("همه‌ی ${1}", [group.title()])}
                      checked={all}
                      onChange={(e) => setGroup(group.models, e.target.checked)}
                    />
                  </td>
                </tr>
                {group.models.map((m) => {
                  const rowAll = accessOperations.every((op) => has(m, op));
                  return (
                    <tr key={m}>
                      <th className={classes.sectionCol}>{accessLevelModelDict[m]}</th>
                      {accessOperations.map((op) => (
                        <td key={op}>
                          <input
                            type="checkbox"
                            aria-label={`${accessLevelModelDict[m]} - ${opTitle[op]()}`}
                            checked={has(m, op)}
                            onChange={(e) => set(m, op, e.target.checked)}
                          />
                        </td>
                      ))}
                      <td>
                        <input
                          type="checkbox"
                          aria-label={ta("همه‌ی ${1}", [accessLevelModelDict[m]])}
                          checked={rowAll}
                          onChange={(e) => setRow(m, e.target.checked)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
      </div>
      <div className={classes.actions}>
        <Button onClick={() => dirty && save()} isLoading={saving} variant={dirty ? "Primary" : "Neutral"}>
          {ta("ثبت")}
        </Button>
        {dirty && (
          <Button variant="Neutral" onClick={() => setGrants(initial)}>
            {ta("بازگرداندن تغییرات")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AccessLevelMatrix;
