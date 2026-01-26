export default function Head() {
  const url = "https://optinodeiq.com/oi/oi-verification-rules";
  return (
    <>
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
    </>
  );
}