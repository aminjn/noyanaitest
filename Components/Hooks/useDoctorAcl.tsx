import useAcl from "./useAcl";

// Thin backward-compatible wrapper around the generic useAcl hook — kept so
// any existing import of useDoctorAcl keeps working unchanged.
const useDoctorAcl = () => useAcl("doctor");

export default useDoctorAcl;
