export default function Head() {
  const url = "https://optinodeiq.com/oi/oi-for-business-decisions";
  return (
    <>
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
    </>
  );
}