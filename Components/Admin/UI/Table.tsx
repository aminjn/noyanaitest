"use client";

import dynamic from "next/dynamic";
import type TableGridComponent from "./TableGrid";
import Loading from "./Loading";

export type { TableFilter, TableRenderer } from "./TableGrid";

// The data grid (ag-grid enterprise with its charts and Excel export, about
// 2 MB) loads only when a table is actually on screen, not with every page
// that imports a table somewhere in a tab (2026-10 speed fix).
const Table = dynamic(() => import("./TableGrid"), {
  ssr: false,
  loading: () => <Loading />,
}) as unknown as typeof TableGridComponent;

export default Table;
