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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default JsonLdSchema;
