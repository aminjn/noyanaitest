"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import ServiceCard from "@/Components/Service/ServiceCard";
import classes from "./DoctorProducts.module.css";

type ServiceNode = Parameters<typeof ServiceCard>[0]["node"];

// The doctor's own services and packages for sale (2026-10, «محصولات
// پزشک»): the same cards as /service, only this doctor's. Nothing to sell =
// nothing drawn (the section and its tab are left out).
export const useDoctorProducts = (doctorId: string) =>
  useSWR<ServiceNode[]>(`${API}/public/service?owner=${doctorId}`, (url: string) =>
    fetcher<{ data?: { data?: ServiceNode[] } }>({ url }).then((res) =>
      Array.isArray(res?.data?.data) ? res.data!.data! : [],
    ),
  );

const DoctorProducts = ({ items }: { items: ServiceNode[] }) => (
  <div className={classes.grid}>
    {items.map((node) => (
      <ServiceCard key={node._id} node={node} />
    ))}
  </div>
);

export default DoctorProducts;
