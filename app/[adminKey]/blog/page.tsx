import CheckAdminKey from "@/Components/Admin/UI/CheckAdminKey";
import { AdminProps } from "../page";
import AdminManageBlogsPage from "@/Components/Admin/Blog/AdminManageBlogsPage";

const AdminManageBlogs = ({ params: { adminKey } }: AdminProps) => {
  return (
    <CheckAdminKey providedAdminKey={adminKey}>
      <AdminManageBlogsPage />
    </CheckAdminKey>
  );
};

export default AdminManageBlogs;
