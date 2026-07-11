"use client";
import { IBecomeParaClinicRequest } from "@/Components/Layout/BecomeParaClinicPage";
import { useParams } from "next/navigation";
import useSWR from "swr";

const AdminManageBecomeParaClinicPage = () => {
  const { nodeId } = useParams();
  const { data, error } =
    useSWR<IBecomeParaClinicRequest<{ User: Record<never, never> }>[]>(``);
 
  return <p>AdminManageBecomeParaClinicPage</p>;
};

export default AdminManageBecomeParaClinicPage;
 