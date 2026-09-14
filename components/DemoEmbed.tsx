export function DemoEmbed({ slug }: { slug: string }) {
  return (
    <aside
      data-entry-slug={slug}
      className="mt-12 border border-dashed border-rule px-6 py-10 text-center text-sm text-inkSoft"
    >
      An interactive demo will live here.
    </aside>
  );
}
