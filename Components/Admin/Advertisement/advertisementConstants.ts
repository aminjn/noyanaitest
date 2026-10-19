import { ta } from "@/Components/Admin/i18n/adminText";
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

// Where each slot shows, in words the admin can act on (2026-10, the
// owner could not tell what "home3" or "drugs2" meant): the page, the place
// on it and the picture size that fits. Listed page by page, so the picker
// groups them.
const slot = (page: string, place: string, size: string) =>
  `${ta(page)} — ${ta(place)} (${size})`;

export const advertisementPositionLabels: Record<
  AdvertisementPosition,
  string
> = {
  get home1() {
    return slot("صفحه‌ی اصلی", "بنر عریض بالای پزشکان برتر", "1400×150");
  },
  get home2() {
    return slot("صفحه‌ی اصلی", "کارت بزرگ زیر پزشکان برتر (خالی = کارت مشاوره‌ی آنلاین)", "800×400");
  },
  get home3() {
    return slot("صفحه‌ی اصلی", "بنر اول کنار کارت بزرگ", "1200×300");
  },
  get home4() {
    return slot("صفحه‌ی اصلی", "بنر دوم کنار کارت بزرگ", "1200×300");
  },
  get home5() {
    return slot("صفحه‌ی اصلی", "نوار باریک اول، بالای مقالات", "1200×128");
  },
  get home6() {
    return slot("صفحه‌ی اصلی", "نوار باریک دوم، بالای مقالات", "1200×128");
  },
  get specialities1() {
    return slot("فهرست تخصص‌ها", "نوار باریک پایین صفحه", "1200×64");
  },
  get speciality1() {
    return slot("صفحه‌ی هر تخصص", "بنر عریض بالای صفحه", "1400×150");
  },
  get speciality2() {
    return slot("صفحه‌ی هر تخصص", "نوار باریک پایین صفحه", "1200×64");
  },
  get diseases1() {
    return slot("فهرست بیماری‌ها", "بنر عریض بالای صفحه", "1400×150");
  },
  get diseases2() {
    return slot("فهرست بیماری‌ها", "نوار باریک پایین صفحه", "1200×64");
  },
  get disease1() {
    return slot("صفحه‌ی هر بیماری", "بنر عریض بالای صفحه", "1400×150");
  },
  get disease2() {
    return slot("صفحه‌ی هر بیماری", "نوار باریک پایین صفحه", "1200×64");
  },
  get symptoms1() {
    return slot("فهرست علائم", "بنر عریض بالای صفحه", "1400×150");
  },
  get symptoms2() {
    return slot("فهرست علائم", "نوار باریک پایین صفحه", "1200×64");
  },
  get symptom1() {
    return slot("صفحه‌ی هر علامت", "بنر عریض بالای صفحه", "1400×150");
  },
  get symptom2() {
    return slot("صفحه‌ی هر علامت", "نوار باریک پایین صفحه", "1200×64");
  },
  get drugs1() {
    return slot("فهرست داروها", "بنر عریض بالای صفحه", "1400×150");
  },
  get drugs2() {
    return slot("فهرست داروها", "نوار باریک پایین صفحه", "1200×64");
  },
  get drug1() {
    return slot("صفحه‌ی هر دارو", "بنر عریض بالای صفحه", "1400×150");
  },
  get drug2() {
    return slot("صفحه‌ی هر دارو", "نوار باریک پایین صفحه", "1200×64");
  },
  get clinics1() {
    return slot("فهرست کلینیک‌ها", "بنر عریض بالای فهرست", "1400×150");
  },
  get clinics2() {
    return slot("فهرست کلینیک‌ها", "نوار باریک پایین صفحه", "1200×64");
  },
  get hospitals1() {
    return slot("فهرست بیمارستان‌ها", "بنر عریض بالای فهرست", "1400×150");
  },
  get hospitals2() {
    return slot("فهرست بیمارستان‌ها", "نوار باریک پایین صفحه", "1200×64");
  },
  get hospital1() {
    return slot("صفحه‌ی هر بیمارستان", "نوار باریک پایین صفحه", "1200×64");
  },
  get tests1() {
    return slot("فهرست آزمایش‌ها", "بنر عریض بالای فهرست", "1400×150");
  },
  get tests2() {
    return slot("فهرست آزمایش‌ها", "نوار باریک پایین صفحه", "1200×64");
  },
  get paraClinics1() {
    return slot("فهرست آزمایشگاه‌ها و تصویربرداری", "نوار باریک بالای فهرست", "1200×64");
  },
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
  get Disease() {
  return ta("بیماری");
},
  get Doctor() {
  return ta("پزشک");
},
  get DoctorProfile() {
  return ta("پروفایل پزشک");
},
  get Drug() {
  return ta("دارو");
},
  get Speciality() {
  return ta("تخصص");
},
  get Clinic() {
  return ta("کلینیک");
},
  get Hospital() {
  return ta("بیمارستان");
},
  get ParaClinic() {
  return ta("پاراکلینیک");
},
  get Product() {
  return ta("محصول");
},
  get ProductPackage() {
  return ta("بسته محصول");
},
  get Symptom() {
  return ta("علامت");
},
  get Service() {
  return ta("خدمت");
},
  get ServicePackage() {
  return ta("بسته خدمت");
},
  get Insurance() {
  return ta("بیمه");
},
  get Blog() {
  return ta("مقاله");
},
};
