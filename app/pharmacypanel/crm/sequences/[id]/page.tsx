import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmSequencePage = ({ params }: { params: { id: string } }) => <CrmSection node="pharmacy" panel="/pharmacypanel" page="sequence" id={params.id} />;

export default CrmSequencePage;
