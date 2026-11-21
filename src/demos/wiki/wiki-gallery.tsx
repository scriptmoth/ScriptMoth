import { wikiTemplates } from "@/demos/wiki/wiki-templates";
import { DemoGallery } from "@/demos/demo-gallery";

export function WikiGallery() {
  return (
    <DemoGallery
      frameHeight={940}
      items={wikiTemplates.map((template) => ({
        slug: template.slug,
        name: template.name,
        useCase: template.useCase,
        vibe: template.vibe,
        summary: template.summary,
        swatches: [template.palette.accentSoft, template.palette.accent, template.palette.head, template.palette.page],
        contactHref: `/contact?type=oc-wiki&design=${template.slug}`,
      }))}
    />
  );
}
