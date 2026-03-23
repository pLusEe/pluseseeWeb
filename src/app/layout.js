import "./globals.css";
import CustomCursor from "../components/CustomCursor";
import LoadingScreen from "../components/LoadingScreen";

function NavFlipLabel({ en, zh }) {
  return (
    <span className="nav-float-track">
      <span className="nav-float-line nav-en">{en}</span>
      <span className="nav-float-line nav-zh">{zh}</span>
    </span>
  );
}

export const metadata = {
  title: "plusesee.me | Portfolio",
  description: "Design portfolio by plusesee",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LoadingScreen />
        <CustomCursor />
        <div className="layout-container">
          <header className="header">
            <div className="logo-area">
              <a href="/" className="logo">plusesee.me</a>
            </div>
            <nav className="nav">
              <a href="/commercial-design" className="nav-float" aria-label="commercial design / 商业设计">
                <NavFlipLabel en="commercial design" zh="商业设计" />
              </a>
              <a href="/personal-design" className="nav-float" aria-label="personal design / 个人设计">
                <NavFlipLabel en="personal design" zh="个人设计" />
              </a>
              <a href="/bio" className="nav-float" aria-label="bio / 简介">
                <NavFlipLabel en="bio" zh="简介" />
              </a>
              <div className="nav-item nav-dropdown">
                <a href="#" className="nav-link nav-float" aria-label="other works / 其他作品">
                  <NavFlipLabel en="other works" zh="其他作品" />
                </a>
                <div className="dropdown-menu">
                  <a href="#">soundart</a>
                  <a href="#">media art</a>
                  <a href="#">photography</a>
                </div>
              </div>
              <a href="/admin" className="admin-link nav-float" aria-label="admin / 管理后台">
                <NavFlipLabel en="admin" zh="管理后台" />
              </a>
            </nav>
          </header>

          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
