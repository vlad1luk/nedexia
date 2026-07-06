/**
 * Page racine minimale — sert de point de contrôle « le service tourne ».
 * Tout le reste du backend est exposé sous /api/* et /auth/*.
 */
export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 640,
        margin: "10vh auto",
        padding: "0 1.5rem",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
        Eden Backend
      </h1>
      <p style={{ color: "#555" }}>
        Service API en ligne. Les endpoints d&apos;Eden sont exposés sous{" "}
        <code>/api/*</code>. Consultez le <code>README.md</code> pour la liste
        complète et l&apos;intégration.
      </p>
    </main>
  );
}
