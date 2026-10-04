import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmFlowPage = ({ params }: { params: { id: string } }) => <CrmSection node="insurance" panel="/insurancepanel" page="flow" id={params.id} />;

export default CrmFlowPage;
