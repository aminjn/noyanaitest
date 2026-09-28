"use client";

import ComingSoon from "./ComingSoon";
import FolderIcon from "@/Components/Icons/FolderIcon";

const DoctorManagePatientDocuments = () => (
  <ComingSoon
    title="patientDocuments"
    target="/doctorpanel/document"
    text="csDocuments"
    icon={<FolderIcon />}
    cta={{ label: "csToPatients", href: "/doctorpanel/patient" }}
  />
);

export default DoctorManagePatientDocuments;
