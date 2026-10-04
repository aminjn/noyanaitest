import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmArticlePage = ({ params }: { params: { id: string } }) => <CrmSection node="hospital" panel="/hospitalpanel" page="article" id={params.id} />;

export default CrmArticlePage;
