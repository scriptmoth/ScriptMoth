import { toyhouseTemplates } from "@/demos/toyhouse/toyhouse-templates";
import { DemoGallery } from "@/demos/demo-gallery";

export function ToyhouseGallery() {
  return (
    <DemoGallery
      frameHeight={980}
      items={toyhouseTemplates.map((template) => ({
        slug: template.slug,
        name: template.name,
        useCase: template.useCase,
        vibe: template.vibe,
        summary: template.summary,
        swatches: [template.palette.accentSoft, template.palette.accent, template.palette.headerBar, template.palette.soft],
        contactHref: `/contact?type=toyhouse-profile&design=${template.slug}`,
      }))}
    />
  );
}
