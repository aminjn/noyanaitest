import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmQuizPage = ({ params }: { params: { id: string } }) => <CrmSection node="pharmacy" panel="/pharmacypanel" page="quiz" id={params.id} />;

export default CrmQuizPage;
