import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmCampaign = ({ params }: { params: { id: string } }) => (
  <CrmSection node="clinic" panel="/clinicpanel" page="campaign" id={params.id} />
);

export default CrmCampaign;
