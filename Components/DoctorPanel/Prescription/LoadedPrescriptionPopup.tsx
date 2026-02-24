import PopupCard from "@/Components/UI/PopupCard";

import classes from "./LoadedPrescriptionPopup.module.css";

const LoadedPrescriptionPopup = ({ data }: { data: LoadedPrescription }) => {
  return (
    <PopupCard>
      <div className={classes.items}>
        {data.map((item) => (
          <div className={classes.item} key={item.noteDetailsEprscId}>
            <span className={classes.itemName}>{item?.srvId?.srvName}</span>
            <div className={classes.itemDetails}>
              <span>{item?.drugInstruction?.drugInstConcept}</span>
              <span>-</span>
              <span>{item?.timesAday?.drugAmntConcept}</span>
              <span>-</span>
              <span>{item?.dose}</span>
            </div>
          </div>
        ))}
      </div>
    </PopupCard>
  );
};

export default LoadedPrescriptionPopup;

export type LoadedPrescription = {
  noteDetailsEprscId: number;
  noteDetailDrug: null;
  srvId: {
    srvId: number;
    srvType: {
      srvType: string;
      srvTypeDes: string;
      status: string;
      statusstDate: string;
      custType: string;
      prescTypeId: number;
      headExpireDate: number;
    };
    srvCode: string;
    srvName: string;
    srvName2: null;
    srvBimSw: string;
    srvSex: null;
    srvPrice: number;
    srvPriceDate: string;
    doseCode: null;
    formCode: {
      formCode: string;
      formDes: string;
      formGrp: null;
      status: string;
      statusstDate: string;
    };
    parTarefGrp: null;
    status: string;
    statusstDate: string;
    bGType: string;
    gSrvCode: string;
    agreementFlag: null;
    isDeleted: string;
    visible: string;
    dentalServiceType: null;
    wsSrvCode: string;
    hosprescType: string;
    srvRule: null;
    countIsRestricted: null;
    drugWarning: string;
    terminology: null;
    srvCodeComplete: string;
  };
  srvQty: number;
  srvRem: number;
  srvPrice: number;
  timesAday: {
    drugAmntId: number;
    drugAmntCode: string;
    drugAmntSumry: string;
    drugAmntLatin: string;
    drugAmntConcept: string;
    visibled: string;
  };
  dose: string;
  doseCode: number;
  repeat: null;
  isBrand: null;
  dateDo: null;
  isOk: string;
  drugInstruction: {
    drugInstId: number;
    drugInstCode: string;
    drugInstSumry: null;
    drugInstLatin: null;
    drugInstConcept: string;
  };
  isPayable: null;
  organId: null;
  organDesc: null;
  illnessId: null;
  illnessDesc: null;
  planId: null;
  planDesc: null;
  organDet: null;
  organDetDesc: null;
  confirmStatusflag: null;
  drugAmntId: number;
  drugInstId: number;
  isDentalService: null;
  noteHeadEprscId: null;
  toothId: null;
  referenceStatus: null;
  repeatDays: null;
  readOnly: boolean;
  messages: null;
  dialysisType: null;
}[];
