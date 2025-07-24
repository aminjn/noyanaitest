const contentKeys = [
  "homePage",
  "officeBook",
  "medicalConsult",
  "phoneConsult",
  "textConsult",
  "aiDetection",
  "blog",
  "forDoctors",
  "login",
  "male",
  "female",
  "medicalSystemTitle",
  "medicalSystemCode",
  "specialities",
  "province",
  "city",
  "address",
  "description",
] as const;

export type ContentKey = (typeof contentKeys)[number];

// const locations = ["header", "general", "doctorPanel"] as const;

// export type Location = (typeof locations)[number];

// export const locationMap: Record<ContentKey, Location> = {
//   aiDetection: "header",
//   blog: "header",
//   forDoctors: "header",
//   homePage: "header",
//   login: "header",
//   medicalConsult: "header",
//   officeBook: "header",
//   phoneConsult: "header",
//   textConsult: "header",
//   female: "general",
//   male: "general",
//   medicalSystemTitle: "doctorPanel",
//   medicalSystemCode: "doctorPanel",
//   specialities: "doctorPanel",
//   province: "general",
//   city: "general",
//   address: "general",
// };
