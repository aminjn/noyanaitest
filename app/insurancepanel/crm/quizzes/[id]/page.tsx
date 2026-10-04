import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmQuizPage = ({ params }: { params: { id: string } }) => <CrmSection node="insurance" panel="/insurancepanel" page="quiz" id={params.id} />;

export default CrmQuizPage;
