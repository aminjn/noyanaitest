import SalesSection from "@/Components/_Common/Business/CrmSales/SalesSection";

const CrmContract = ({ params }: { params: { id: string } }) => <SalesSection node="insurance" panel="/insurancepanel" page="contract" id={params.id} />;

export default CrmContract;
