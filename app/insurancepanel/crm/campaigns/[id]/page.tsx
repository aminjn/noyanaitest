import CrmSection from "@/Components/_Common/Business/Crm/CrmSection";

const CrmCampaign = ({ params }: { params: { id: string } }) => (
  <CrmSection node="insurance" panel="/insurancepanel" page="campaign" id={params.id} />
);

export default CrmCampaign;
