import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelOffice"];

type Membership = {
  clinic?: { _id?: string; name?: string };
  hospital?: { _id?: string; name?: string };
};

const load = (url: string) => fetcher({ url }).then((res) => res.data);

// Options for "which clinic / hospital is this office in" - only centres the
// doctor is a member of (the backend checks the same). Visits at an office
// linked to a centre show up on that centre's dashboard. A field is left out
// when the doctor has no membership of that kind.
const useOfficeCenterFields = () => {
  const getContent = useScopedLocale(NS);
  const hasAccess = useDoctorAcl();
  const clinics = useSWR<Membership[]>(
    hasAccess("readClinics") ? `${API}/doctor/clinic` : null,
    load,
  );
  const hospitals = useSWR<Membership[]>(
    hasAccess("readHospitals") ? `${API}/doctor/hospital` : null,
    load,
  );

  const options = (list: unknown, key: "clinic" | "hospital") => {
    const entries = (Array.isArray(list) ? (list as Membership[]) : [])
      .map((m) => m?.[key])
      .filter((c): c is { _id: string; name?: string } => !!c?._id)
      .map((c) => [c._id, c.name || "—"] as const);
    return entries.length
      ? { "": getContent("officeNoCenter"), ...Object.fromEntries(entries) }
      : null;
  };

  const clinicOptions = options(clinics.data, "clinic");
  const hospitalOptions = options(hospitals.data, "hospital");
  return {
    ...(clinicOptions && {
      clinic: {
        title: getContent("officeClinic"),
        type: "select" as const,
        options: clinicOptions,
      },
    }),
    ...(hospitalOptions && {
      hospital: {
        title: getContent("officeHospital"),
        type: "select" as const,
        options: hospitalOptions,
      },
    }),
  };
};

export default useOfficeCenterFields;
