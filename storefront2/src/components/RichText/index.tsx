interface RichTextProps {
  title?: string;
  content?: string;
}

export default function RichText({ title, content = "<p>Conteúdo da página</p>" }: RichTextProps) {
  return (
    <section className="section" data-section-type="rich-text">
      <div className="container" style={{ maxWidth: "800px" }}>
        {title && <h2 className="heading h3" style={{ marginBottom: "20px", textAlign: "center" }}>{title}</h2>}
        <div className="rte" style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </section>
  );
}
