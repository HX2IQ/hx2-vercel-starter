export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ background: "#ffffff", color: "#111827", minHeight: "100dvh" }}>
      {children}
    </div>
  );
}
