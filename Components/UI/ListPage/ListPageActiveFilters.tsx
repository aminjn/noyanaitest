"use client";

import { useSearchParams } from "next/navigation";
import Button from "../Button";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "./ListPageActiveFilters.module.css";
import { ListPageFilters } from "./listFilters";

const NS: ContentNamespace[] = ["common"];

// The tag / accepted-insurance filter a list was opened with, as removable
// chips - removing one keeps the rest of the query (search, category...).
const ListPageActiveFilters = ({
  basePath,
  filters,
}: {
  basePath: string;
  filters?: ListPageFilters | null;
}) => {
  const getContent = useScopedLocale(NS);
  const searchParams = useSearchParams();
  if (!filters?.tag && !filters?.insurance) return null;

  const without = (key: keyof ListPageFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <div className={classes.main}>
      {!!filters.tag && (
        <Button
          variant="Primary"
          mode="Outline"
          size="S"
          radius="High"
          href={without("tag")}
          tailIcon={<XMarkIcon />}
          ariaLabel={`${getContent("removeFilter")}`}
        >
          {getContent("listFilterTag", [filters.tag.name || ""])}
        </Button>
      )}
      {!!filters.insurance && (
        <Button
          variant="Primary"
          mode="Outline"
          size="S"
          radius="High"
          href={without("insurance")}
          tailIcon={<XMarkIcon />}
          ariaLabel={`${getContent("removeFilter")}`}
        >
          {getContent("listFilterInsurance", [filters.insurance.name || ""])}
        </Button>
      )}
    </div>
  );
};

export default ListPageActiveFilters;
