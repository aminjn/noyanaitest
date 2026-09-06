import AdminPage from "@/Components/Admin/AdminPage";

export type AdminProps<T = Record<string, never>> = {
  params: { adminKey: string } & T;
};

// adminKey enforcement now lives in app/[adminKey]/layout.tsx, applied to
// every admin page uniformly — see F-05 in AUDIT/FIXES_TODO.md.
const Admin = () => {
  return <AdminPage />;
};

export default Admin;
