// Stored text (a doctor's bio, a review, a blog title) goes into this
// <script>: "</script>" or "<!--" in it would end the script early and the
// rest would run as HTML. Escaped, the JSON is the same to a crawler.
const toScriptJson = (schema: unknown) =>
  JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

const JsonLdSchema = ({
  schema,
}: {
  schema?: Record<string, unknown> | null;
}) => {
  if (!schema) return null;
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: toScriptJson(schema) }}
    />
  );
};

export default JsonLdSchema;
