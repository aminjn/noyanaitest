import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

export type BotChatPopulation = Population<{ User: UserPopulation }>;
export interface IBotChat<
  T extends BotChatPopulation = BotChatPopulation,
> extends MongoDoc {
  user: T["User"] extends UserPopulation ? IUser<T["User"]> : string;
  name: string;
  createdAt: Date;
}

const useBotChats = () => {
  const { data, error, mutate } = useSWR<IBotChat[]>(
    `${API}/wizard/chat`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return { data, error, mutate };
};

export default useBotChats;
