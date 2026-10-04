import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmContact = ({ params }: { params: { id: string } }) => (
  <CrmSection node="paraClinic" panel="/paraClinicPanel" page="contact" id={params.id} />
);

export default CrmContact;
