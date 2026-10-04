import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmTicketPage = ({ params }: { params: { id: string } }) => <CrmSection node="pharmacy" panel="/pharmacypanel" page="ticket" id={params.id} />;

export default CrmTicketPage;
