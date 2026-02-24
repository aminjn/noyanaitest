import { MongoDoc } from "@/Components/Hooks/useUser";
import { createContext } from "react";

export interface IPrescription2Item extends MongoDoc {}

export interface IPrescription extends MongoDoc {}

export interface TaminPrescription extends MongoDoc {}

const DoctorPrescriptionContext = createContext<{}>({});
