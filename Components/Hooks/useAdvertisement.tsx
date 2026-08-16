"use client";

import useSWR from "swr";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import {
  AdvertisementPosition,
  AdvertisementResourceModel,
} from "../Admin/Advertisement/advertisementConstants";
import { IAdvertisement } from "../Admin/Advertisement/AdminManageAdvertisementsPage";

export type UseAdvertisementProps = {
  position: AdvertisementPosition;
  // when both are set, the backend prefers an ad targeted at this exact
  // resource, falling back to the generic ad for `position` if none exists
  resourceModel?: AdvertisementResourceModel;
  resource?: string;
};

// Fetches the ad to show for a given slot. See findAdvertisementsForPosition
// in the backend's Models/Advertisement.ts for the targeted/generic fallback
// lookup this endpoint performs.
const useAdvertisement = ({
  position,
  resourceModel,
  resource,
}: UseAdvertisementProps) => {
  const params = new URLSearchParams({ position });
  if (resourceModel && resource) params.set("resourceId", resource);

  const { data } = useSWR<IAdvertisement[]>(
    `${API}/public/advertisement/position?${params.toString()}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return data?.[0];
};

export default useAdvertisement;
