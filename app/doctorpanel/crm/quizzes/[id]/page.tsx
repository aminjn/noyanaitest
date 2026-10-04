import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmQuizPage = ({ params }: { params: { id: string } }) => <CrmSection node="doctor" panel="/doctorpanel" page="quiz" id={params.id} />;

export default CrmQuizPage;
