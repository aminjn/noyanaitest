import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmArticlePage = ({ params }: { params: { id: string } }) => <CrmSection node="paraClinic" panel="/paraClinicPanel" page="article" id={params.id} />;

export default CrmArticlePage;
