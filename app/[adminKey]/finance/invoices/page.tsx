import { redirect } from "next/navigation";

// the legacy invoices are an archive tab of the transactions page (2026-10)
const AdminFinanceInvoices = ({ params }: { params: { adminKey: string } }) =>
  redirect(`/${params.adminKey}/finance/transactions?tab=archive`);

export default AdminFinanceInvoices;
