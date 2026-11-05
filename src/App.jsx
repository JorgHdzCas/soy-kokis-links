
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  FaInstagram,
  FaTiktok,
  FaFacebookF,
  FaYoutube,
  FaTwitch,
  FaDiscord,
} from "react-icons/fa6";

import SpaceBackground from "./SpaceBackground";
import { profile, socialLinks } from "./links";

const iconMap = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  twitch: FaTwitch,
  discord: FaDiscord,
};

const categories = ["Todos", "Redes sociales", "Streaming", "Comunidad"];

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [copied, setCopied] = useState(false);

  const filteredLinks =
    activeCategory === "Todos"
      ? socialLinks
      : socialLinks.filter((link) => link.category === activeCategory);

  const handleShare = async () => {
    const shareData = {
      title: profile.name,
      text: profile.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          alert("No se pudo compartir el enlace.");
        }
      }
    }
  };

  return (
    <>
      <SpaceBackground />

      <main className="app-shell">
        <div className="page-container">
          <header className="profile">
            <div className="avatar-wrapper">
              <img
                className="avatar"
                src={profile.avatar}
                alt={`Logo de ${profile.name}`}
              />
              <span className="online-indicator" title="En línea" />
            </div>

            <h1>{profile.name}</h1>

            <p className="username">{profile.username}</p>

            <p className="description">{profile.description}</p>

            <button className="share-button" onClick={handleShare}>
              <span>{copied ? "¡Enlace copiado!" : "Compartir perfil"}</span>
              <span className="link-arrow" aria-hidden="true">
                <ArrowUpRight size={18} strokeWidth={2} />
              </span>
            </button>
          </header>

          <section className="links-section">
            <div className="section-heading">
              <span className="section-line" />
              <h2>ENCUÉNTRAME EN EL UNIVERSO DIGITAL</h2>
              <span className="section-line" />
            </div>

            <nav className="category-filters" aria-label="Filtrar enlaces">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`filter-button ${
                    activeCategory === category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </nav>

            <div className="links-grid">
              {filteredLinks.map((link) => {
                const Icon = iconMap[link.icon];

                return (
                  <a
                    className="link-card"
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={link.id}
                    style={{ "--brand-color": link.color }}
                  >
                    <span className="link-icon">
                      {Icon && <Icon />}
                    </span>

                    <span className="link-text">
                      <strong>{link.title}</strong>
                      <small>{link.description}</small>
                    </span>

                    <span className="link-arrow" aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={2} />
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          <footer className="footer">
            <div className="footer-decoration">
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
            </div>

            <p>
              TRANSMITIENDO DESDE EL UNIVERSO DE{" "}
              <strong>SOY KOKIS</strong>
            </p>

            <small>Gracias por formar parte de LOS KOKITOS 💜</small>

            <span className="copyright">
              © {new Date().getFullYear()} Soy Kokis
            </span>
          </footer>
        </div>
      </main>
    </>
  );
}
