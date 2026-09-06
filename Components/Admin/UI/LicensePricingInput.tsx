"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import ToggleInput from "@/Components/UI/ToggleInput";
import classes from "./LicensePricingInput.module.css";

// One LicenseDuration a Base<Org>License catalog entry can be priced at
// (2026-09) - replaces the old flat monthlyPrice/monthlyDiscount/
// annualPrice/annualDiscount fields on BaseDoctorLicense/
// BasePharmacyLicense/BaseClinicLicense/BaseParaClinicLicense. `duration`
// here is always the raw LicenseDuration id (not populated) - the admin
// form fetches the full duration catalog itself (below) to build one row
// per duration, keyed by id.
export interface ILicensePricingEntry {
  duration: string;
  isActive: boolean;
  price: number;
  discount: number;
}

interface ILicenseDurationOption {
  _id: string;
  duration: number;
  displayName?: string;
  order: number;
}

type Row = { isActive: boolean; price: number; discount: number };

const emptyRow: Row = { isActive: false, price: 0, discount: 0 };

const getDurationId = (
  duration: ILicensePricingEntry["duration"] | ILicenseDurationOption,
): string => (typeof duration === "string" ? duration : duration._id);

// Shared editor for the `pricing` field on every Base<Org>License model -
// fetches the admin-managed LicenseDuration catalog (Models/
// LicenseDuration.ts) and renders one row per duration so an admin can
// mark it active and set a price/discount for this specific plan. Wired
// into Components/Admin/UI/CreateForm.tsx as the "licensePricing" field
// type, alongside "multiselect"/"strings" as the other array-shaped field
// editors.
const LicensePricingInput = ({
  title,
  defaultValue,
  onChange,
  readOnly,
}: {
  title?: string;
  defaultValue?: ILicensePricingEntry[];
  onChange?: (value: ILicensePricingEntry[]) => unknown;
  readOnly?: boolean;
}) => {
  const { data: durations } = useSWR<ILicenseDurationOption[]>(
    `${API}/auto/licenseDuration`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const [rows, setRows] = useState<Record<string, Row>>(() => {
    const init: Record<string, Row> = {};
    for (const entry of defaultValue || []) {
      init[getDurationId(entry.duration)] = {
        isActive: entry.isActive,
        price: entry.price || 0,
        discount: entry.discount || 0,
      };
    }
    return init;
  });

  const emit = (next: Record<string, Row>, list: ILicenseDurationOption[]) => {
    onChange?.(
      list.map((d) => ({
        duration: d._id,
        isActive: next[d._id]?.isActive || false,
        price: next[d._id]?.price || 0,
        discount: next[d._id]?.discount || 0,
      })),
    );
  };

  if (!durations) return null;

  const sorted = [...durations].sort((a, b) => a.order - b.order);

  return (
    <div className={classes.main}>
      {!!title && <legend className={classes.title}>{title}</legend>}
      <div className={classes.rows}>
        <div className={`${classes.row} ${classes.header}`}>
          <span className={classes.name}>مدت زمان</span>
          <span className={classes.cell}>فعال</span>
          <span className={classes.cell}>قیمت</span>
          <span className={classes.cell}>تخفیف</span>
        </div>
        {sorted.map((d) => {
          const row = rows[d._id] || emptyRow;
          const update = (patch: Partial<Row>) => {
            const next = { ...rows, [d._id]: { ...row, ...patch } };
            setRows(next);
            emit(next, sorted);
          };
          return (
            <div className={classes.row} key={d._id}>
              <span className={classes.name}>
                {d.displayName || `${d.duration} روز`}
              </span>
              <span className={classes.cell}>
                <ToggleInput
                  readOnly={readOnly}
                  value={row.isActive}
                  onChange={() => update({ isActive: !row.isActive })}
                />
              </span>
              <span className={classes.cell}>
                <input
                  className={classes.input}
                  type="number"
                  inputMode="numeric"
                  disabled={readOnly || !row.isActive}
                  defaultValue={row.price}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) update({ price: val });
                  }}
                />
              </span>
              <span className={classes.cell}>
                <input
                  className={classes.input}
                  type="number"
                  inputMode="numeric"
                  disabled={readOnly || !row.isActive}
                  defaultValue={row.discount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) update({ discount: val });
                  }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LicensePricingInput;
