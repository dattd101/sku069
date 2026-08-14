import RedirectClient from "./redirect-client";

export default function HomePage() {
  return (
    <main className="container">
      <section className="card">
        <div
          className="cat-bow"
          role="img"
          aria-label="Mèo đang cúi chào"
        >
          <div className="cat-face">🐱</div>
          <div className="cat-paws">🐾</div>
        </div>

        <h1>Xin chào bạn!</h1>

        <p className="description">
          Mèo nhỏ đang chuẩn bị đưa bạn đến một trang thú vị.
        </p>

        <RedirectClient />
      </section>
    </main>
  );
}