import { permanentRedirect } from "next/navigation";

// see app/doctors/page.tsx
const DoctorsListPage = () => permanentRedirect("/book");

export default DoctorsListPage;
