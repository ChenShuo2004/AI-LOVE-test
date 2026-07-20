import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import BorderGlow from "./BorderGlow";
import "./CardNav.css";

type CardNavLink = {
  label: string;
  ariaLabel: string;
  href?: string;
  onClick?: () => void;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links?: CardNavLink[];
};

type CardNavProps = {
  logo: string;
  logoAlt?: string;
  brandTitle?: string;
  brandSubtitle?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonLabel?: string;
  showButton?: boolean;
  onButtonClick?: () => void;
};

function CardNav({
  logo,
  logoAlt = "Logo",
  brandTitle,
  brandSubtitle,
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#fff",
  menuColor,
  buttonBgColor = "#111",
  buttonTextColor = "white",
  buttonLabel = "Get Started",
  showButton = true,
  onButtonClick,
}: CardNavProps) {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const getCollapsedHeight = () => (window.matchMedia("(max-width: 480px)").matches ? 64 : 72);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector<HTMLElement>(".card-nav-content");
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";

        const topBar = getCollapsedHeight();
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 272;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: getCollapsedHeight(), overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, "-=0.1");

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (index: number) => (element: HTMLDivElement | null) => {
    if (element) cardsRef.current[index] = element;
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? "open" : ""}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""}`}
            onClick={toggleMenu}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleMenu();
              }
            }}
            role="button"
            aria-label={isExpanded ? "关闭菜单" : "打开菜单"}
            aria-expanded={isExpanded}
            tabIndex={0}
            style={{ color: menuColor || "#000" }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            <img src={logo} alt={logoAlt} className="logo" />
            {(brandTitle || brandSubtitle) && (
              <span className="logo-copy">
                {brandTitle && <strong>{brandTitle}</strong>}
                {brandSubtitle && <small>{brandSubtitle}</small>}
              </span>
            )}
          </div>

          {showButton ? (
            <BorderGlow
              className="card-nav-button-glow"
              edgeSensitivity={26}
              glowColor="330 28 58"
              backgroundColor={buttonBgColor}
              borderRadius={13}
              glowRadius={22}
              glowIntensity={0.78}
              coneSpread={24}
              colors={["#A97A93", "#E2D8DF", "#EEF0F3"]}
              fillOpacity={0.22}
            >
              <button
                type="button"
                className="card-nav-cta-button"
                style={{ backgroundColor: "transparent", color: buttonTextColor }}
                onClick={onButtonClick}
              >
                {buttonLabel}
              </button>
            </BorderGlow>
          ) : (
            <span className="card-nav-button-spacer" aria-hidden="true" />
          )}
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="nav-card"
              ref={setCardRef(index)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((link, linkIndex) => (
                  <a
                    key={`${link.label}-${linkIndex}`}
                    className="nav-card-link"
                    href={link.href || "#"}
                    aria-label={link.ariaLabel}
                    onClick={(event) => {
                      if (!link.href || link.onClick) event.preventDefault();
                      link.onClick?.();
                      if (link.onClick) toggleMenu();
                    }}
                  >
                    <ArrowUpRight className="nav-card-link-icon" size={16} aria-hidden="true" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default CardNav;
