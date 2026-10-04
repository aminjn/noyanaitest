import SalesSection from "@/Components/_Common/Business/CrmSales/SalesSection";

const CrmPlan = ({ params }: { params: { id: string } }) => <SalesSection node="paraClinic" panel="/paraClinicPanel" page="plan" id={params.id} />;

export default CrmPlan;
