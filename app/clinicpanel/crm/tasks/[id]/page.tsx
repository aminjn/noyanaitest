import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmBoardPage = ({ params }: { params: { id: string } }) => <CrmSection node="clinic" panel="/clinicpanel" page="board" id={params.id} />;

export default CrmBoardPage;
