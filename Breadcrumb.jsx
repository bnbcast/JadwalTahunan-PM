const portfolioUrl =
  import.meta.env.VITE_PORTFOLIO_URL || "https://bnbcast.github.io/";

export default function Breadcrumb({ current }) {
  const linkStyle = { color: "inherit", textDecoration: "none" };
  return (
    <div
      role="navigation"
      aria-label="Breadcrumb"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1rem",
        color: "var(--mut, #59636e)",
        font: "500 0.82rem/1.5 system-ui, sans-serif",
      }}
    >
      <a href={portfolioUrl} style={linkStyle}>Portfolio</a>
      <span aria-hidden="true">/</span>
      <a href={`${portfolioUrl.replace(/\/?$/, "/")}#projects`} style={linkStyle}>Projects</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{current}</span>
    </div>
  );
}
