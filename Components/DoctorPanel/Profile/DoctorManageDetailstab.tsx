import CreateForm from "@/Components/Admin/UI/CreateForm";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import useDoctor from "@/Components/Hooks/useDoctor";
import useForm from "@/Components/Hooks/useForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { genders, IDoctorProfile } from "../DoctorPanelPage";
import { ISpeciality } from "@/Components/Admin/Speciality/AdminManageSpecialitiesPage";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IServiceCategory } from "@/Components/Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { serviceCategoryIds } from "@/Components/helpers/serviceCatalog";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

const DoctorManageDetailsTab = () => {
  const { doctor, mutate } = useDoctor();
  const form = useForm<IDoctorProfile>({
    path: `${API}/doctor/profile`,
    method: "POST",
    successCb: () => {
      mutate();
    },
  });

  const getContent = useScopedLocale(NS);

  // mcCode comes back populated (server selects only its `mcCode` string
  // field) purely for read-only display here, so it's swapped for a plain
  // string before being handed to CreateForm.
  const formDefaultValue = doctor
    ? {
        ...doctor,
        mcCode:
          (doctor.mcCode as unknown as { mcCode?: string } | undefined)
            ?.mcCode || "",
      }
    : undefined;

  return (
    <HandleLoading data={!!doctor}>
      {!!doctor && (
        <CreateForm
          style={{ width: "100%" }}
          defaultValue={formDefaultValue}
          hookProvided={form}
          renderer={{
            firstName: {
              type: "text",
              title: getContent("firstName"),
              readOnly: true,
            },
            lastName: {
              type: "text",
              title: getContent("lastName"),
              readOnly: true,
            },
            ssid: {
              type: "text",
              title: getContent("ssid"),
              readOnly: true,
            },
            gender: {
              type: "select",
              title: getContent("gender"),
              readOnly: true,
              options: genders.reduce(
                (acc, el) => ({ ...acc, [el]: getContent(el) }),
                {},
              ),
            },
            medicalSystemCode: {
              type: "text",
              title: getContent("medicalSystemCode"),
              readOnly: true,
            },
            avatar: { type: "image", title: getContent("avatar") },
            mainSpeciality: {
              type: "nodes",
              title: getContent("mainSpeciality"),
              path: `${API}/public/selectspeciality`,
              multi: false,
              clearable: true,
              getOptionLabel: (node) =>
                (node as ISpeciality).name || (node as ISpeciality)._id,
              getOptionValue: (node) => (node as ISpeciality)._id,
              getDefaultValue: (inp) => inp.mainSpeciality,
            },
            specialities: {
              type: "nodes",
              title: getContent("specialities"),
              path: `${API}/public/selectspeciality`,
              multi: true,
              getOptionLabel: (node) =>
                (node as ISpeciality).name || (node as ISpeciality)._id,
              getOptionValue: (node) => (node as ISpeciality)._id,
              getDefaultValue: (inp) => inp.specialities,
            },
            introduction: { type: "area", title: getContent("introduction") },
            // from the service catalogue, the list /book filters by
            // (2026-10): a missing service is added inline, matched by
            // name first so the same service is never listed twice; it
            // shows on the doctor's page at once and in the site's search
            // once the team has reviewed it
            serviceCategories: {
              type: "nodes",
              title: getContent("services"),
              path: `${API}/doctor/serviceCatalog`,
              multi: true,
              creatable: {
                path: `${API}/doctor/serviceCatalog`,
                field: "title",
                formatLabel: (input) => getContent("serviceCatalogAdd", [input]),
                errorText: getContent("serviceCatalogAddFailed"),
              },
              getOptionLabel: (node) => {
                const n = node as IServiceCategory;
                return n.pendingReview
                  ? getContent("serviceCatalogPending", [n.title || ""])
                  : n.title || "";
              },
              getOptionValue: (node) => (node as IServiceCategory)._id,
              getDefaultValue: (inp) => serviceCategoryIds(inp.serviceCategories),
              hint: getContent("serviceCatalogHint"),
            },
            achivements: { type: "strings", title: getContent("achivemets") },
            website: { type: "text", title: getContent("website") },
            landLine: { type: "text", title: getContent("landLine") },
            address: { type: "text", title: getContent("address") },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorManageDetailsTab;
