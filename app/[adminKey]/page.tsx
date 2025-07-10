import AdminPage from "@/Components/Admin/AdminPage";
import CheckAdminKey from "@/Components/Admin/UI/CheckAdminKey";
import { adminKey } from "@/Components/config";
import { notFound } from "next/navigation";

export type AdminProps<T = Record<string, never>> = {
  params: { adminKey: string } & T;
};

const Admin = ({ params: { adminKey } }: AdminProps) => {
  return (
    <CheckAdminKey providedAdminKey={adminKey}>
      <AdminPage />
    </CheckAdminKey>
  );
};

export default Admin;
