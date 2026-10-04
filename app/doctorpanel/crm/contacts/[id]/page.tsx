import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmContact = ({ params }: { params: { id: string } }) => (
  <CrmSection node="doctor" panel="/doctorpanel" page="contact" id={params.id} />
);

export default CrmContact;
