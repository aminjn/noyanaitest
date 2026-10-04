import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmSequencePage = ({ params }: { params: { id: string } }) => <CrmSection node="paraClinic" panel="/paraClinicPanel" page="sequence" id={params.id} />;

export default CrmSequencePage;
