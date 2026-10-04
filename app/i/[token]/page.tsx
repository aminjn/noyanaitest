import { Metadata } from "next";
import PublicInvoicePage from "@/Components/Invoice/PublicInvoicePage";

// a patient's personal link: never indexed
export const metadata: Metadata = { robots: { index: false, follow: false } };

// The invoice a provider sent by SMS (2026-10, backend
// Lib/business/invoices.ts): no sign-in, print-friendly.
const PublicInvoice = ({ params }: { params: { token: string } }) => <PublicInvoicePage token={params.token} />;

export default PublicInvoice;
