import { tumblrTemplates } from "@/demos/tumblr/tumblr-templates";
import { DemoGallery } from "@/demos/demo-gallery";

export function TumblrGallery() {
  return (
    <DemoGallery
      frameHeight={900}
      items={tumblrTemplates.map((template) => ({
        slug: template.slug,
        name: template.name,
        useCase: template.useCase,
        vibe: template.vibe,
        summary: template.summary,
        swatches: [template.palette.chip, template.palette.accent, template.palette.glow, template.palette.soft],
        contactHref: `/contact?type=tumblr-theme&design=${template.slug}`,
      }))}
    />
  );
}
