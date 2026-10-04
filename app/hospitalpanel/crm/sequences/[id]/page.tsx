import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmSequencePage = ({ params }: { params: { id: string } }) => <CrmSection node="hospital" panel="/hospitalpanel" page="sequence" id={params.id} />;

export default CrmSequencePage;
