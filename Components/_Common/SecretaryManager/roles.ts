import { ContentKey } from "@/Components/Enums/contentKeys";
import { doctorRolePresets } from "@/Components/Enums/actions/doctorActions";
import { NodeWithAcl } from "./Request/CreateSecretaryRequestPopup";
import { categorizedAclMap } from "./AccessLevel/MutateSecretaryAccessLevelPopup";

export type RolePreset = { id: string; title: ContentKey; hint: ContentKey; actions: readonly string[] };

// every action the panel knows about = "full assistant"
const allActions = (name: NodeWithAcl) =>
  Array.from(new Set(Object.values(categorizedAclMap[name]).flat())) as string[];

// Ready-made roles shown in the invite popup. Doctors get the common desk
// roles; the other panels start with full access (plus their own custom
// roles under "Access levels").
export const rolePresets = (name: NodeWithAcl): RolePreset[] => [
  ...(name === "doctor"
    ? [
        { id: "appointments", title: "roleAppointments", hint: "roleAppointmentsHint", actions: doctorRolePresets.appointments },
        { id: "reception", title: "roleReception", hint: "roleReceptionHint", actions: doctorRolePresets.reception },
        { id: "finance", title: "roleFinance", hint: "roleFinanceHint", actions: doctorRolePresets.finance },
      ]
    : []),
  { id: "full", title: "roleFull", hint: "roleFullHint", actions: allActions(name) },
] as RolePreset[];
