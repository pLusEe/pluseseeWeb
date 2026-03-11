import "./globals.css";
import AIChat from "../components/AIChat";
import CustomCursor from "../components/CustomCursor";

export const metadata = {
  title: "d3adrabbit | Portfolio",
  description: "Monochromatic architectural portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />
        <div className="layout-container">
          <header className="header">
            <div className="logo-area">
              <h1>plusesee.me</h1>
            </div>
            <nav className="nav">
              <a href="/">Projects</a>
              <a href="/info">Info</a>
              <a href="/contact">Contact</a>
            </nav>
          </header>

          <main className="main-content">
            {children}
          </main>

          <footer className="footer">
            <div className="footer-left">
              <span>©2024 d3adrabbit</span>
            </div>
            <div className="footer-right">
              <span>Architectural Designer</span>
            </div>
          </footer>
        </div>
        <AIChat />
      </body>
    </html>
  );
}
