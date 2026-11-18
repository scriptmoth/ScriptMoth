import { Art, ButtonLink, Window } from "@/components/ui";
import { assets } from "@/lib/assets";

export default function NotFound() {
  return (
    <div className="section site-container status-page">
      <Window label="scriptmoth / 404" className="lost-window">
        <div className="lost-page">
          <Art artwork={assets.mark} className="lost-moth" sizes="34px" />
          <Art artwork={assets.faq} sizes="92px" />
          <h1>Page not found</h1>
          <p>Check the URL, or return home.</p>
          <ButtonLink href="/">Return home</ButtonLink>
        </div>
      </Window>
    </div>
  );
}
