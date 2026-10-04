"use client";

import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import CrmSection from "./CrmSection";

// /<panel>/crm: the «ارتباط با بیماران» section's dashboard (2026-10). The
// section's other pages are /<panel>/crm/<part> (CrmSection.tsx).
const CrmPage = ({ node, panel }: { node: NodeWithAcl; panel: string }) => <CrmSection node={node} panel={panel} page="dashboard" />;

export default CrmPage;
