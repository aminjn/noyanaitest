import ContactPage from "@/Components/Contact/ContactPage";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/contact");

const Contact = async () => {
  const webSchema = await getListPageWebSchema("/contact");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <ContactPage />
    </>
  );
};

export default Contact;
