import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmBoardPage = ({ params }: { params: { id: string } }) => <CrmSection node="hospital" panel="/hospitalpanel" page="board" id={params.id} />;

export default CrmBoardPage;
