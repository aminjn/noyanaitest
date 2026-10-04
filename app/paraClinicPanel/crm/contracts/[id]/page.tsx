import SalesSection from "@/Components/_Common/Business/CrmSales/SalesSection";

const CrmContract = ({ params }: { params: { id: string } }) => <SalesSection node="paraClinic" panel="/paraClinicPanel" page="contract" id={params.id} />;

export default CrmContract;
