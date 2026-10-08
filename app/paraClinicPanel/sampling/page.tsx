import { Suspense } from "react";
import ParaClinicSamplingPage from "@/Components/ParaClinicDashboard/Sampling/ParaClinicSamplingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["labSampling"];

const ParaClinicSampling = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <Suspense>
        <ParaClinicSamplingPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default ParaClinicSampling;
