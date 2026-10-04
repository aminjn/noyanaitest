import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmFlowPage = ({ params }: { params: { id: string } }) => <CrmSection node="pharmacy" panel="/pharmacypanel" page="flow" id={params.id} />;

export default CrmFlowPage;
