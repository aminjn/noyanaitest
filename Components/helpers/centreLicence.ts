// Mirrors backend Models/CentreLicence.ts / Lib/centreVerified.ts (2026-10):
// a centre's operating licence as the staff checked it. The public site only
// gets `verified` (the tick); the admin centre page gets the record itself.
export type CentreLicenceKind = "clinic" | "hospital" | "pharmacy" | "paraClinic" | "insurance";

export interface ICentreLicence {
  verifiedAt?: string;
  // populated with the admin's name on the admin page
  verifiedBy?: string | { _id: string; username?: string; phone?: string };
  issuedAt?: string;
  expiresAt?: string;
}

export interface CentreLicenceFields {
  licence?: ICentreLicence;
  // the tick, computed by the backend (never inferred on the client)
  verified?: boolean;
  // the pharmacy's / lab's / insurer's licence number (clinic: clinicCode,
  // hospital: code)
  licenseNumber?: string;
}

// where each kind keeps its licence number (backend centreLicenceNumberField)
export const centreLicenceNumberField: Record<CentreLicenceKind, "clinicCode" | "code" | "licenseNumber"> = {
  clinic: "clinicCode",
  hospital: "code",
  pharmacy: "licenseNumber",
  paraClinic: "licenseNumber",
  insurance: "licenseNumber",
};
