"use client";

import { useState } from "react";
import classes from "./CartPrescriptionSection.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import useNotification from "../Hooks/useNotification";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import Input from "../UI/Input";
import SelectInput from "../UI/SelectInput";
import AreaInput from "../UI/AreaInput";
import Ixon from "../UI/Ixon";
import CheckIcon from "../Icons/CheckIcon";
import { t2xsRegular, tsmDemiBold, tsmRegular } from "../UI/Typography";

const NS: ContentNamespace[] = ["common", "cartCheckoutPopup"];

// Mirrors backend Lib/rxPrescription.ts checkoutPrescriptionSchema (2026-10)
export type RxInsurer = "tamin" | "salamat" | "other";
export type CheckoutPrescription =
  | {
      kind: "erx";
      insurer: RxInsurer;
      trackingCode: string;
      nationalCode: string;
      note?: string;
    }
  | { kind: "paper"; files: string[]; note?: string };

export type RxDraft = {
  kind: "erx" | "paper";
  insurer: RxInsurer;
  trackingCode: string;
  nationalCode: string;
  files: { _id: string; name: string }[];
  note: string;
};

export const emptyRxDraft: RxDraft = {
  kind: "erx",
  insurer: "tamin",
  trackingCode: "",
  nationalCode: "",
  files: [],
  note: "",
};

const RX_MAX_FILES = 3;

const toLatinDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\s-]/g, "");

// the payload for /cart/submit, or null while the draft is incomplete (the
// server checks the national code's checksum and the files' ownership)
export const rxDraftToPayload = (draft: RxDraft): CheckoutPrescription | null => {
  const note = draft.note.trim() || undefined;
  if (draft.kind === "paper")
    return draft.files.length
      ? { kind: "paper", files: draft.files.map((f) => f._id), note }
      : null;
  const trackingCode = toLatinDigits(draft.trackingCode);
  const nationalCode = toLatinDigits(draft.nationalCode);
  if (!/^[A-Za-z0-9]{4,40}$/.test(trackingCode) || !/^\d{10}$/.test(nationalCode))
    return null;
  return { kind: "erx", insurer: draft.insurer, trackingCode, nationalCode, note };
};

// Checkout step for a cart with prescription-only items (after Halodoc /
// Vezeeta / DrDr): the buyer gives an Iranian e-prescription (Tamin /
// Salamat tracking code + national code) or photos of the paper one. The
// photos upload privately (POST /cart/prescription) before the order exists.
const CartPrescriptionSection = ({
  value,
  onChange,
}: {
  value: RxDraft;
  onChange: (next: RxDraft) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const t = (key: string) => getContent(key as ContentKey);
  const pushNotification = useNotification();
  const [uploading, setUploading] = useState(false);

  const set = (patch: Partial<RxDraft>) => onChange({ ...value, ...patch });

  const upload = async (list: File[]) => {
    const room = RX_MAX_FILES - value.files.length;
    const picked = list.slice(0, Math.max(0, room));
    if (!picked.length) return;
    setUploading(true);
    const added: RxDraft["files"] = [];
    try {
      for (const file of picked) {
        const res = await fetcher<{ data?: { _id?: string } }>({
          url: `${API}/cart/prescription`,
          method: "POST",
          bodyParser: "FORM",
          payload: { file },
        });
        if (res?.data?._id) added.push({ _id: res.data._id, name: file.name });
      }
    } catch (err) {
      pushNotification((err as Error)?.message || "", "Error");
    } finally {
      setUploading(false);
      if (added.length) set({ files: [...value.files, ...added].slice(0, RX_MAX_FILES) });
    }
  };

  const kinds: RxDraft["kind"][] = ["erx", "paper"];

  return (
    <div className={classes.main}>
      <span className={`${classes.title} ${tsmDemiBold}`}>{t("rxSectionTitle")}</span>
      <span className={`${classes.hint} ${t2xsRegular}`}>{t("rxSectionHint")}</span>
      <div className={classes.kinds} role="radiogroup">
        {kinds.map((kind) => (
          <button
            type="button"
            role="radio"
            aria-checked={value.kind === kind}
            key={kind}
            className={`${classes.kind} ${value.kind === kind ? classes.activeKind : ""}`}
            onClick={() => set({ kind })}
          >
            <span className={classes.kindCheck}>
              <Ixon width=".75rem">
                <CheckIcon />
              </Ixon>
            </span>
            <span className={tsmRegular}>{t(kind === "erx" ? "rxKindErx" : "rxKindPaper")}</span>
          </button>
        ))}
      </div>
      {value.kind === "erx" ? (
        <div className={classes.fields}>
          <SelectInput
            title={t("rxInsurer")}
            defaultValue={value.insurer}
            options={{
              tamin: t("rxInsurerTamin"),
              salamat: t("rxInsurerSalamat"),
              other: t("rxInsurerOther"),
            }}
            onChange={(e) => set({ insurer: (e.target.value || "tamin") as RxInsurer })}
          />
          <Input
            title={t("rxTrackingCode")}
            defaultValue={value.trackingCode}
            inputMode="numeric"
            autoComplete="off"
            inputClass={classes.ltr}
            onChange={(e) => set({ trackingCode: e.target.value })}
          />
          <Input
            title={t("rxNationalCode")}
            defaultValue={value.nationalCode}
            inputMode="numeric"
            autoComplete="off"
            inputClass={classes.ltr}
            onChange={(e) => set({ nationalCode: e.target.value })}
          />
        </div>
      ) : (
        <div className={classes.fields}>
          <label className={classes.file}>
            <input
              className={classes.fileInput}
              type="file"
              multiple
              disabled={uploading || value.files.length >= RX_MAX_FILES}
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const list = Array.from(e.target.files || []);
                e.target.value = "";
                upload(list);
              }}
            />
            <span className={classes.fileButton}>
              {uploading ? t("rxUploading") : t("rxChooseFiles")}
            </span>
            <span className={`${classes.hint} ${t2xsRegular}`}>{t("rxFilesHint")}</span>
          </label>
          {!!value.files.length && (
            <ul className={classes.fileList}>
              {value.files.map((f) => (
                <li key={f._id} className={classes.fileRow}>
                  <span className={`${classes.fileName} ${t2xsRegular}`} dir="auto">
                    {f.name}
                  </span>
                  <button
                    type="button"
                    className={`${classes.remove} ${t2xsRegular}`}
                    onClick={() => set({ files: value.files.filter((el) => el._id !== f._id) })}
                  >
                    {t("rxRemoveFile")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <AreaInput
        title={t("rxNote")}
        defaultValue={value.note}
        onChange={(e) => set({ note: e.target.value.slice(0, 500) })}
      />
    </div>
  );
};

export default CartPrescriptionSection;
