import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmBoardPage = ({ params }: { params: { id: string } }) => <CrmSection node="insurance" panel="/insurancepanel" page="board" id={params.id} />;

export default CrmBoardPage;
