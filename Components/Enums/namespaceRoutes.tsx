import { ContentNamespace } from "./contentNamespaces";

// Maps each ContentNamespace to the public route(s) that actually render it.
// Derived by grepping every getScopedTextContent(...) / LocaleScopeProvider
// namespaces={...} call site (see contentNamespaces.tsx for the keys each
// namespace groups). Used only by the admin text-content table to link a key
// to the page(s) it's scoped to — no page imports this itself.
//
// "common" is intentionally left out: it's shared sitewide chrome (header/
// footer/shared UI), not tied to one route, so it's rendered without a link
// wherever this map is consumed instead of pointing at an arbitrary page.
//
// Dynamic segments ([nodeId], [page], [stamp]) are stripped down to their
// nearest static parent route, since there's no real id to link to from an
// admin content-key list.
export const namespaceRoutes: Partial<Record<ContentNamespace, string[]>> = {
  home: ["/"],
  doctorsList: ["/doctors"],
  diseasesList: ["/disease"],
  drugsList: ["/drug"],
  symptomsList: ["/symptom"],

  dashboardHome: ["/dashboard"],
  dashboardInvoice: ["/dashboard/invoice"],
  dashboardTransaction: ["/dashboard/transaction"],
  dashboardOrder: ["/dashboard/order"],
  dashboardAddress: ["/dashboard/address"],
  dashboardBooking: ["/dashboard/booking"],
  dashboardVital: ["/dashboard/vital"],
  dashboardNotification: ["/dashboard/notification"],
  dashboardSupport: ["/dashboard/support"],
  dashboardChat: ["/dashboard/chat"],

  booking: ["/book"],
  bookingFinalize: ["/book/finalize"],
  bookingLegacyList: ["/book/page"],

  becomeSomething: ["/become"],

  secretaryManager: [
    "/clinicpanel/secretary",
    "/insurancepanel/secretary",
    "/pharmacypanel/secretary",
    "/doctorpanel/secretary",
  ],
  secretaryPanelHome: [
    "/secretarypanel",
    "/secretarypanel/pharmacy",
    "/secretarypanel/paraClinic",
    "/secretarypanel/insurance",
    "/secretarypanel/doctor",
    "/secretarypanel/clinic",
  ],

  insurancePanelHome: ["/insurancepanel"],

  clinicPanelHome: ["/clinicpanel"],
  clinicPanelProfile: ["/clinicpanel/profile"],
  clinicPanelPrescription: ["/clinicpanel/prescription"],
  clinicPanelTamin: ["/clinicpanel/tamin"],

  doctorPanelHome: ["/doctorpanel"],
  doctorPanelClinic: ["/doctorpanel/clinic"],
  doctorPanelCalendar: ["/doctorpanel/calendar"],
  doctorPanelSettings: ["/doctorpanel/settings"],
  doctorPanelInsurance: ["/doctorpanel/insurance"],
  doctorPanelPharmacy: ["/doctorpanel/pharmacy"],
  doctorPanelProfile: ["/doctorpanel/profile"],
  doctorPanelPatient: ["/doctorpanel/patient"],
  doctorPanelOffice: ["/doctorpanel/office"],
  doctorPanelTamin: ["/doctorpanel/tamin"],
  doctorPanelPrescriptionList: ["/doctorpanel/drug"],
  doctorPanelPrescriptionEdit: ["/doctorpanel/prescription"],
  doctorPanelPrescriptionPrint: ["/doctorpanel/prescription"],
  doctorPanelPrescriptionCreate: ["/doctorpanel/prescription"],
  doctorPanelShift: ["/doctorpanel/shift"],
  doctorPanelStub: [
    "/doctorpanel/article",
    "/doctorpanel/chat",
    "/doctorpanel/discount",
    "/doctorpanel/document",
    "/doctorpanel/license",
    "/doctorpanel/offer",
    "/doctorpanel/finance",
  ],
  doctorPanelSchedule: ["/doctorpanel/schedule"],
  doctorPanelService: ["/doctorpanel/service"],
  doctorPanelServicePackage: ["/doctorpanel/servicepackage"],
  doctorPanelOrder: ["/doctorpanel/order"],

  pharmacyPanelHome: ["/pharmacypanel"],
  pharmacyPanelProfile: ["/pharmacypanel/profile"],
  pharmacyPanelPrescription: ["/pharmacypanel/prescription"],
  pharmacyPanelFilledPrescription: ["/pharmacypanel/filledPrescription"],
  pharmacyPanelTamin: ["/pharmacypanel/tamin"],
  pharmacyPanelProduct: ["/pharmacypanel/product"],
  pharmacyPanelProductPackage: ["/pharmacypanel/productPackage"],
  pharmacyPanelOrder: ["/pharmacypanel/order"],
};
