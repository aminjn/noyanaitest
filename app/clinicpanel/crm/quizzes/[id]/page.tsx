import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmQuizPage = ({ params }: { params: { id: string } }) => <CrmSection node="clinic" panel="/clinicpanel" page="quiz" id={params.id} />;

export default CrmQuizPage;
