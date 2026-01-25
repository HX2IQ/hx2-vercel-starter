import { SiteHeader, SiteFooter, Container } from "./_ui/shell";

export const dynamic = "force-dynamic";

export default function OILayout({ children }: { children: any }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <SiteHeader />
      <Container>
        <div style={{ paddingTop: 18, paddingBottom: 8 }}>{children}</div>
      </Container>
      <SiteFooter />
    </div>
  );
}
