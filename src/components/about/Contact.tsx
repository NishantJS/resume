import { FC, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin, Physics2DPlugin);

const EMAIL = "itsnishantchorge@gmail.com";
const CONFETTI = ["#a855f7", "#22d3ee", "#f43f5e", "#f59e0b", "#10b981", "#818cf8"];

/**
 * Page finale: giant masked-line reveal with a hand-drawn underline
 * (DrawSVG), an email that unscrambles on hover (ScrambleText), and a
 * magnetic CTA that bursts confetti on click (Physics2D).
 */
const Contact: FC = () => {
  const ref = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const emailRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const heading = el.querySelector<HTMLElement>(".contact-h");
    const scribble = el.querySelector<SVGPathElement>(".contact-scribble path");
    const rest = el.querySelectorAll<HTMLElement>(".contact-rest");
    if (!heading) return;

    if (reduced) {
      gsap.set([heading, ...rest], { opacity: 1 });
      if (scribble) gsap.set(scribble, { drawSVG: "100%" });
      return;
    }

    // st-line-mask gets bottom padding via CSS so descenders (g, y…)
    // aren't clipped by the masks' overflow:clip.
    const split = SplitText.create(heading, {
      type: "lines,words,chars",
      mask: "lines",
      linesClass: "st-line",
      wordsClass: "contact-word",
    });
    gsap.set(heading, { opacity: 1 });

    // Each character rises with a 3D tilt and ignites in an accent colour
    // (purple ↔ cyan, matching the swoosh gradient) before settling to white
    // — a calmer echo of the name hero's lock-in flash. The whole reveal is
    // SCRUBBED to scroll: letters rise and settle as the heading travels up
    // the viewport, and re-hide when you scroll back.
    const accents = ["#a855f7", "#22d3ee"];
    gsap.set(split.chars, { transformPerspective: 500 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heading,
        start: "top 85%",
        end: "top 38%",
        scrub: 0.6,
      },
    });
    tl.from(split.chars, {
      yPercent: 120,
      rotateX: -75,
      opacity: 0,
      transformOrigin: "50% 100%",
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.022,
    });
    split.chars.forEach((c, i) => {
      tl.fromTo(c,
        { color: accents[i % accents.length] },
        { color: "#ffffff", duration: 0.6, ease: "power2.out" },
        0.12 + i * 0.022,
      );
    });

    // Supporting copy + CTA just fade up once when the section enters — they
    // sit below the heading and shouldn't depend on the scrub position.
    gsap.fromTo(rest,
      { opacity: 0, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12,
        scrollTrigger: { trigger: el, start: "top 55%", once: true },
      },
    );

    // The swoosh is scrubbed to scroll — it strokes in as it rises through
    // the viewport and unwinds when you scroll back. Trigger on the svg
    // ITSELF (not the tall section): starting right where it enters at the
    // bottom means it's at 0% on first sight, and ending high enough that
    // the range stays reachable at max scroll means retraction starts the
    // moment you scroll up from the page bottom.
    if (scribble) {
      gsap.fromTo(scribble,
        { drawSVG: "0%" },
        {
          drawSVG: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: scribble.closest("svg"),
            start: "top 96%",
            end: "top 62%",
            scrub: 0.5,
          },
        },
      );
    }

    return () => split.revert();
  }, { scope: ref, dependencies: [reduced] });

  // Magnetic CTA — drifts toward the cursor, snaps back elastically.
  useGSAP(() => {
    const btn = btnRef.current;
    if (!btn || reduced) return;
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width / 2) * 0.35,
        y: (e.clientY - r.top - r.height / 2) * 0.35,
        duration: 0.4,
        ease: "power2.out",
      });
    };
    const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    return () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, { dependencies: [reduced] });

  // Confetti burst from the button on click (the mailto still opens).
  useGSAP(() => {
    const btn = btnRef.current;
    if (!btn || reduced) return;
    const burst = () => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      for (let i = 0; i < 26; i++) {
        const piece = document.createElement("span");
        piece.className = "cta-confetti";
        piece.style.left = `${cx}px`;
        piece.style.top = `${cy}px`;
        piece.style.background = CONFETTI[i % CONFETTI.length];
        document.body.appendChild(piece);
        gsap.to(piece, {
          physics2D: {
            velocity: gsap.utils.random(260, 560),
            angle: gsap.utils.random(220, 320),
            gravity: 1000,
          },
          rotation: gsap.utils.random(-220, 220),
          opacity: 0,
          duration: gsap.utils.random(0.9, 1.5),
          ease: "none",
          onComplete: () => piece.remove(),
        });
      }
    };
    btn.addEventListener("click", burst);
    return () => btn.removeEventListener("click", burst);
  }, { dependencies: [reduced] });

  // Email unscrambles on hover.
  useGSAP(() => {
    const em = emailRef.current;
    if (!em || reduced) return;
    const scramble = () => {
      gsap.to(em, {
        duration: 0.9,
        scrambleText: { text: EMAIL, chars: "lowerCase", speed: 1.2 },
        ease: "none",
      });
    };
    const parent = em.closest("a");
    parent?.addEventListener("mouseenter", scramble);
    return () => parent?.removeEventListener("mouseenter", scramble);
  }, { dependencies: [reduced] });

  return (
    <section
      ref={ref}
      className="relative px-6 md:px-12 xl:px-16 pt-28 pb-40 max-w-5xl 2xl:max-w-screen-xl mx-auto w-full text-center"
      aria-label="Contact"
    >
      <p className="contact-rest mono text-xs uppercase tracking-[0.3em] text-gray-500 opacity-0">
        What's next
      </p>
      <h2
        className="contact-h mt-5 font-bold tracking-tight leading-[1.08] opacity-0"
        style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)" }}
      >
        Let's build something great together.
      </h2>

      {/* Hand-drawn swoosh, stroked in after the heading reveals. */}
      <svg
        className="contact-scribble mx-auto mt-4"
        width="240"
        height="22"
        viewBox="0 0 240 22"
        fill="none"
        aria-hidden
      >
        <path
          d="M4 14 C 50 4, 90 20, 130 10 S 210 6, 236 12"
          stroke="url(#scribble-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scribble-grad" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>

      <p className="contact-rest mono text-sm md:text-base text-gray-400 mt-8 max-w-xl mx-auto opacity-0">
        I'm currently open to new opportunities — full-time roles, contract work, or
        just a conversation about an interesting problem.
      </p>

      <div className="contact-rest mt-12 flex flex-col items-center gap-7 opacity-0">
        <a
          ref={btnRef}
          href={`mailto:${EMAIL}`}
          className="link contact-cta mono"
        >
          Get in touch
          <span className="cta-arrow" aria-hidden>
            <svg width="15" height="15" viewBox="0 0 11 11" fill="none">
              <path d="M1 10L10 1M10 1H4M10 1V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
        <a href={`mailto:${EMAIL}`} className="link mono text-sm text-gray-500 hover:text-gray-300 transition-colors">
          <span ref={emailRef}>{EMAIL}</span>
        </a>
      </div>
    </section>
  );
};

export default Contact;
