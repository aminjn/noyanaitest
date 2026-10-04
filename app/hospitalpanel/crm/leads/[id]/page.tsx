import SalesSection from "@/Components/_Common/Business/CrmSales/SalesSection";

const CrmLead = ({ params }: { params: { id: string } }) => <SalesSection node="hospital" panel="/hospitalpanel" page="lead" id={params.id} />;

export default CrmLead;
