"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { DefaultPrescription } from "../PrescriptionContext";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import {
  Document,
  Font,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import { calculateAge } from "@/Components/helpers/lib";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionPrint"];

Font.register({ family: "yekan", src: "/font.ttf" });

const styles = StyleSheet.create({
  page: {
    fontFamily: "yekan",
  },
  header: {},
  line2: {},
  line2Item: {},
  lineBig: {},
  date: {},
  patient: {},
  line3: {},
  line3Item: {},
  tamin: {},
  listBox: {},
  listTitle: {},
  list: {},
  listItem: {},
});

const PrescrfiptionDocument = ({ node }: { node: DefaultPrescription }) => {
  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.lineBig}>
            <Text style={styles.date}>{`${getContent(
              "prescriptionCreationDate"
            )} : ${new Date(node.createdAt).toLocaleDateString("fa-IR", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}`}</Text>
          </View>
          <View style={styles.line2}>
            <Text style={styles.line2Item}>{`${getContent(
              "doctorName"
            )} : ${getDoctorProfileLabel(node.author)}`}</Text>
            <Text style={styles.line2Item}>{`${getContent(
              "medicalSystemCode"
            )} : ${node.author.mcCode?.mcCode || "-"}`}</Text>
          </View>
        </View>
        <View style={styles.patient}>
          <View style={styles.line3}>
            <Text style={styles.line3Item}>{`${getContent("patientName")} : ${
              node.patient.givenName
            } ${node.patient.lastName}`}</Text>
            <Text style={styles.line3Item}>{`${getContent(
              "patientNationalCode"
            )} : ${node.patient.nationalId}`}</Text>
            <Text style={styles.line3Item}>{`${getContent(
              "age"
            )} : ${calculateAge(new Date(node.patient.dateOfbirth))}`}</Text>
          </View>
        </View>
        {!!node.taminStatus && (
          <View style={styles.tamin}>
            <View style={styles.line3}>
              <Text style={styles.line3Item}>{`${getContent("trackingCode")} ${
                node.taminStatus.tracking
              }`}</Text>
              <Text style={styles.line3Item}>{`${getContent("taminId")} : ${
                node.taminStatus.taminId
              }`}</Text>
              <Text style={styles.line3Item}>{`${getContent(
                "taminSendDate"
              )} : ${new Date(node.taminStatus.submittedAt).toLocaleDateString(
                "fa-IR",
                { month: "long", day: "numeric", year: "numeric" }
              )}`}</Text>
            </View>
          </View>
        )}
        <View style={styles.listBox}>
          <Text style={styles.listTitle}>{getContent("medications")}</Text>
          <View style={styles.list}>
            {node.items.map((item) => (
              <Text key={item._id} style={styles.listItem}> </Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

const PrintPrescriptionPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<DefaultPrescription>(
    `${API}/doctor/presc/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <PDFViewer height="100%" width="100%">
          <PrescrfiptionDocument node={data} />
        </PDFViewer>
      )}
    </HandleLoading>
  );
};

export default PrintPrescriptionPage;
