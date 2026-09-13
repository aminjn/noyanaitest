// Mirrors \\wsl.localhost\ubuntu\root\business\noyanai-back\Models\Advertisement.ts
// Every slot in the front-end that is allowed to show an ad goes here. A page
// can have more than one slot (e.g. a top banner and a sidebar banner on the
// same list page), and a single Advertisement can target several positions
// at once. Keep this list in sync with the backend's advertisementPositions.
export const advertisementPositions = [
  "home1",
  "home2",
  "home3",
  "home4",
  "home5",
  "home6",
  "diseases1",
  "diseases2",
  "symptoms1",
  "symptoms2",
  "drugs1",
  "drugs2",
  "specialities1",
  "speciality1",
  "speciality2",
  "disease1",
  "disease2",
  "symptom1",
  "symptom2",
  "drug1",
  "drug2",
  "clinics1",
  "clinics2",
  "hospitals1",
  "hospitals2",
  "tests1",
  "tests2",
  "hospital1",
  "paraClinics1",
] as const;

export type AdvertisementPosition = (typeof advertisementPositions)[number];

export const advertisementPositionLabels: Record<
  AdvertisementPosition,
  string
> = {
  home1: "home1",
  home2: "home2",
  home3: "home3",
  home4: "home4",
  home5: "home5",
  home6: "home6",
  clinics1: "clinics1",
  clinics2: "clinics2",
  disease1: "disease1",
  disease2: "disease2",
  diseases1: "diseases1",
  diseases2: "diseases2",
  drug1: "drug1",
  drug2: "drug2",
  drugs1: "drugs1",
  drugs2: "drugs2",
  hospitals1: "hospitals1",
  hospitals2: "hospitals2",
  specialities1: "specialities1",
  speciality1: "speciality1",
  speciality2: "speciality2",
  symptom1: "symptom1",
  symptom2: "symptom2",
  symptoms1: "symptoms1",
  symptoms2: "symptoms2",
  tests1: "tests1",
  tests2: "tests2",
  hospital1: "hospital1",
  paraClinics1: "paraClinics1",
};

// Mongoose model names an Advertisement can target via `resource`, for
// single-node positions (e.g. "disease_top") where an ad should target one
// specific document instead of every document of that type. Keep this in
// sync with advertisementResourceModels in the backend's Models/Advertisement.ts.
export const advertisementResourceModels = [
  "Disease",
  "Doctor",
  "DoctorProfile",
  "Drug",
  "Speciality",
  "Clinic",
  "Hospital",
  "ParaClinic",
  "Product",
  "ProductPackage",
  "Symptom",
  "Service",
  "ServicePackage",
  "Insurance",
  "Blog",
] as const;

export type AdvertisementResourceModel =
  (typeof advertisementResourceModels)[number];

export const advertisementResourceModelLabels: Record<
  AdvertisementResourceModel,
  string
> = {
  Disease: "بیماری",
  Doctor: "پزشک",
  DoctorProfile: "پروفایل پزشک",
  Drug: "دارو",
  Speciality: "تخصص",
  Clinic: "کلینیک",
  Hospital: "بیمارستان",
  ParaClinic: "پاراکلینیک",
  Product: "محصول",
  ProductPackage: "بسته محصول",
  Symptom: "علامت",
  Service: "خدمت",
  ServicePackage: "بسته خدمت",
  Insurance: "بیمه",
  Blog: "مقاله",
};
