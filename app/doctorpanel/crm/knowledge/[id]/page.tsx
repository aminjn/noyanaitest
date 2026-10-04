import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmArticlePage = ({ params }: { params: { id: string } }) => <CrmSection node="doctor" panel="/doctorpanel" page="article" id={params.id} />;

export default CrmArticlePage;
