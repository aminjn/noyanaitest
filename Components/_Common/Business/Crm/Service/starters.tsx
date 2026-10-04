"use client";

import classes from "../../Accounting.module.css";
import s from "./Service.module.css";
import { CrmProfile, isProfile } from "./profiles";
import { useCall, useCrm, useCrmText, useMine } from "./svc";

// The starter set of each profile (2026-10): sequences and workflows
// (switched off; an SMS step waits for an approved template) and checklist
// templates, in the reader's language, made once by POST /service/seed.
//   doctor     - after the first visit; pre-/post-visit checklists
//   clinic,
//   hospital   - pre-operation instructions; the WHO surgical safety
//                checklist; complaints to the manager
//   pharmacy   - refill reminders; the dispensing checklist; returns to
//                the manager
//   paraClinic - pre-test preparation (fasting); the sampling checklist
//   insurance  - welcome for a new member; member requests to the manager

type Step = Record<string, unknown>;
type Seed = { sequences: { name: string; steps: Step[] }[]; checklists: { name: string; items: string[] }[]; flows: { name: string; trigger: string; filters: Step[]; steps: Step[] }[] };

export const useStarters = (profile: CrmProfile): Seed => {
  const t = useCrmText();
  const items = (key: string, n: number) => Array.from({ length: n }, (_, i) => t(`${key}${i + 1}`));
  const postVisitSeq = { name: t("crmeStSeqPostVisit"), steps: [{ channel: "sms", waitDays: 1 }, { channel: "task", waitDays: 6, text: t("crmeStSeqPostVisitTask") }] };
  const postVisitFlow = { name: t("crmeRcpPostVisit"), trigger: "visit.completed", filters: [], steps: [{ kind: "delay", days: 3 }, { kind: "action", action: "followUp", text: t("crmeRcpPostVisitCall"), dueDays: 0 }] };
  const noShowFlow = {
    name: t("crmeRcpNoShow"),
    trigger: "visit.noShow",
    filters: [],
    steps: [{ kind: "action", action: "addTag", tag: t("crmeRcpTagNoShow") }, { kind: "action", action: "followUp", text: t("crmeRcpNoShowCall"), dueDays: 0 }],
  };
  const complaintFlow = { name: t("crmeRcpComplaint"), trigger: "ticket.created", filters: [], steps: [{ kind: "action", action: "notify", text: t("crmeRcpComplaintNotice") }] };
  const welcomeFlow = {
    name: t("crmeRcpWelcome"),
    trigger: "contact.created",
    filters: [],
    steps: [{ kind: "action", action: "addTag", tag: t("crmeRcpTagNew") }, { kind: "action", action: "followUp", text: t("crmeRcpWelcomeCall"), dueDays: 1 }],
  };
  switch (profile) {
    case "doctor":
      return {
        sequences: [postVisitSeq],
        checklists: [
          { name: t("crmeStClPreVisit"), items: items("crmeStClPreVisit", 4) },
          { name: t("crmeStClPostVisit"), items: items("crmeStClPostVisit", 3) },
        ],
        flows: [postVisitFlow, noShowFlow],
      };
    case "clinic":
    case "hospital":
      return {
        sequences: [{ name: t("crmeStSeqPreOp"), steps: [{ channel: "sms", waitDays: 0 }, { channel: "task", waitDays: 1, text: t("crmeStSeqPreOpTask") }] }, postVisitSeq],
        checklists: [
          { name: t("crmeStClSurgery"), items: items("crmeStClSurgery", 8) },
          { name: t("crmeStClPreVisit"), items: items("crmeStClPreVisit", 4) },
        ],
        flows: [complaintFlow, postVisitFlow, noShowFlow],
      };
    case "pharmacy":
      return {
        sequences: [{ name: t("crmeStSeqRefill"), steps: [{ channel: "sms", waitDays: 25 }, { channel: "task", waitDays: 3, text: t("crmeStSeqRefillTask") }] }],
        checklists: [{ name: t("crmeStClDispense"), items: items("crmeStClDispense", 5) }],
        flows: [welcomeFlow, { name: t("crmeStFlReturn"), trigger: "return.created", filters: [], steps: [{ kind: "action", action: "notify", text: t("crmeStFlReturnNotice") }] }],
      };
    case "paraClinic":
      return {
        sequences: [{ name: t("crmeStSeqPrep"), steps: [{ channel: "sms", waitDays: 0 }, { channel: "task", waitDays: 0, text: t("crmeStSeqPrepTask") }] }],
        checklists: [{ name: t("crmeStClSample"), items: items("crmeStClSample", 5) }],
        flows: [welcomeFlow, complaintFlow],
      };
    case "insurance":
    default:
      return {
        sequences: [{ name: t("crmeStSeqMember"), steps: [{ channel: "sms", waitDays: 0 }, { channel: "task", waitDays: 7, text: t("crmeStSeqMemberTask") }] }],
        checklists: [],
        flows: [{ ...complaintFlow, name: t("crmeStFlMember") }, welcomeFlow],
      };
  }
};

// "Start with the ready-made set" - shown until the panel has any
// sequence, workflow or checklist
export const StarterBanner = ({ onSeeded }: { onSeeded?: () => unknown }) => {
  const t = useCrmText();
  const call = useCall();
  const { node, canWrite } = useCrm();
  const mine = useMine();
  const profile: CrmProfile = isProfile(node) ? node : "clinic";
  const seed = useStarters(profile);
  if (!canWrite || !mine.data || mine.data.seeded) return null;
  return (
    <section className={classes.card}>
      <div className={s.between}>
        <div className={s.stack}>
          <span className={s.strong}>{t("crmeStarterTitle")}</span>
          <span className={s.hint}>{t(`crmeStarterHint_${profile}`)}</span>
        </div>
        <button type="button" className={classes.primary} onClick={async () => { if (await call("POST", "/service/seed", seed as unknown as Record<string, unknown>)) { mine.mutate(); onSeeded?.(); } }}>
          {t("crmeStarterButton")}
        </button>
      </div>
    </section>
  );
};
