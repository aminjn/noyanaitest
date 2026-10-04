import SalesSection from "@/Components/_Common/Business/CrmSales/SalesSection";

const CrmPlan = ({ params }: { params: { id: string } }) => <SalesSection node="insurance" panel="/insurancepanel" page="plan" id={params.id} />;

export default CrmPlan;
