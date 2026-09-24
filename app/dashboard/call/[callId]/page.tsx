import NewCallScreenPage from "@/Components/Dashboard/NewCall/NewCallScreenPage";

// NewCallScreenPage renders no localized text of its own beyond the shared
// "common" namespace, which the root layout already provides. (The old
// UserManageCallPage call screen is no longer rendered here; it declares its
// own dashboardUserManageCall namespace.)
const UserManageCall = () => <NewCallScreenPage />;

export default UserManageCall;
