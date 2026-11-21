import { carrdTemplates } from "@/demos/carrd/carrd-templates";
import { DemoGallery } from "@/demos/demo-gallery";

export function CarrdGallery() {
  return (
    <DemoGallery
      frameHeight={820}
      items={carrdTemplates.map((template) => ({
        slug: template.slug,
        name: template.name,
        useCase: template.useCase,
        vibe: template.vibe,
        summary: template.summary,
        swatches: [template.palette.tab, template.palette.tabActive, template.palette.accent, template.palette.glow],
        contactHref: `/contact?type=personal-site&design=${template.slug}`,
      }))}
    />
  );
}
