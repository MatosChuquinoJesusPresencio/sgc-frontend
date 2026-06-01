import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const NotFoundPage = () => {
  const num404Ref = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const alignCrack = () => {
      if (!num404Ref.current) return;
      const rect = num404Ref.current.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const pct = (mid / window.innerHeight * 100).toFixed(2) + "%";

      const crack = document.getElementById("nf-crack");
      const ptop  = document.getElementById("nf-ptop");
      const pbot  = document.getElementById("nf-pbot");
      const frags = document.querySelectorAll(".nf-frag");

      if (crack) crack.style.top = pct;
      if (ptop)  ptop.style.clipPath  = `polygon(0 0,100% 0,100% ${pct},0 ${pct})`;
      if (pbot)  pbot.style.clipPath  = `polygon(0 ${pct},100% ${pct},100% 100%,0 100%)`;
      frags.forEach(f => (f.style.top = pct));
    };

    document.fonts.ready.then(alignCrack);
    window.addEventListener("resize", alignCrack);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", alignCrack);
    };
  }, []);

  const FRAGS = [
    { l:"12%", h:55, dy:"-70px", dx:"-25px", orig:"top",    b:false },
    { l:"25%", h:38, dy:"-45px", dx:"18px",  orig:"top",    b:true  },
    { l:"42%", h:65, dy:"-88px", dx:"-8px",  orig:"top",    b:false },
    { l:"60%", h:42, dy:"-55px", dx:"30px",  orig:"top",    b:true  },
    { l:"78%", h:50, dy:"-68px", dx:"-18px", orig:"top",    b:false },
    { l:"90%", h:35, dy:"-40px", dx:"12px",  orig:"top",    b:false },
    { l:"8%",  h:48, dy:"62px",  dx:"-12px", orig:"bottom", b:false },
    { l:"33%", h:60, dy:"80px",  dx:"22px",  orig:"bottom", b:true  },
    { l:"52%", h:35, dy:"50px",  dx:"-28px", orig:"bottom", b:false },
    { l:"70%", h:68, dy:"90px",  dx:"8px",   orig:"bottom", b:true  },
    { l:"84%", h:44, dy:"58px",  dx:"-16px", orig:"bottom", b:false },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Space+Mono:wght@400;700&display=swap');
        .nf-root { position:fixed;inset:0;background:var(--primary);overflow:hidden;font-family:'Space Mono',monospace; }
        .nf-root::before {
          content:'';position:fixed;inset:0;
          background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.10) 3px,rgba(0,0,0,.10) 4px);
          pointer-events:none;z-index:999;
        }
        .nf-crack {
          position:fixed;left:0;right:0;height:3px;top:50%;transform:translateY(-50%);
          background:linear-gradient(90deg,transparent 0%,var(--accent) 25%,#fff 50%,var(--accent) 75%,transparent 100%);
          opacity:0;z-index:800;box-shadow:0 0 12px var(--accent);
          animation:nfCrack .3s ease .65s forwards;
        }
        @keyframes nfCrack {
          0%  {opacity:0;transform:translateY(-50%) scaleX(.1)}
          45% {opacity:1;transform:translateY(-50%) scaleX(1)}
          100%{opacity:0;transform:translateY(-50%) scaleX(1)}
        }
        .nf-panel { position:fixed;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden; }
        .nf-ptop  { clip-path:polygon(0 0,100% 0,100% 50%,0 50%);  animation:nfTop .55s cubic-bezier(.77,0,.18,1) .7s forwards; }
        .nf-pbot  { clip-path:polygon(0 50%,100% 50%,100% 100%,0 100%); animation:nfBot .55s cubic-bezier(.77,0,.18,1) .7s forwards; }
        @keyframes nfTop { 0%{transform:translateY(0)} 35%{transform:translateY(-5px)} 100%{transform:translateY(-55px)} }
        @keyframes nfBot { 0%{transform:translateY(0)} 35%{transform:translateY(5px)}  100%{transform:translateY(55px)}  }
        .nf-scene { text-align:center;width:100%;padding:0 clamp(16px,5vw,60px); }
        .nf-404 {
          font-family:'Black Han Sans',sans-serif;
          font-size:clamp(100px,18vw,240px);
          line-height:1;color:transparent;
          -webkit-text-stroke:clamp(1px,.3vw,3px) #f8fafc;
          position:relative;display:inline-block;
          animation:nfShake .45s ease .15s, nfGrow .65s cubic-bezier(.34,1.46,.64,1) .72s forwards;
        }
        .nf-404::before {
          content:'404';position:absolute;inset:0;
          font-family:'Black Han Sans',sans-serif;font-size:inherit;
          color:transparent;-webkit-text-stroke:clamp(1px,.3vw,3px) var(--accent);
          animation:nfGlR 3s infinite 1.6s;clip-path:polygon(0 28%,100% 28%,100% 52%,0 52%);pointer-events:none;
        }
        .nf-404::after {
          content:'404';position:absolute;inset:0;
          font-family:'Black Han Sans',sans-serif;font-size:inherit;
          color:transparent;-webkit-text-stroke:clamp(1px,.3vw,3px) #93c5fd;
          animation:nfGlC 3s infinite 1.9s;clip-path:polygon(0 60%,100% 60%,100% 78%,0 78%);pointer-events:none;
        }
        @keyframes nfShake {
          0%,100%{transform:translateX(0) rotate(0)} 10%{transform:translateX(-7px) rotate(-1deg)}
          25%{transform:translateX(9px) rotate(1.2deg)} 40%{transform:translateX(-9px) rotate(-1.4deg)}
          55%{transform:translateX(9px) rotate(1.2deg)} 70%{transform:translateX(-5px) rotate(-.8deg)}
          85%{transform:translateX(4px) rotate(.5deg)}
        }
        @keyframes nfGrow {
          0%{transform:scale(1)} 55%{transform:scale(1.28) translateY(-6px)} 100%{transform:scale(1.18) translateY(-3px)}
        }
        @keyframes nfGlR {
          0%,88%,100%{transform:translateX(0);opacity:0} 89%{transform:translateX(-5px);opacity:.95}
          91%{transform:translateX(5px);opacity:.7} 93%{transform:translateX(-2px);opacity:.85} 95%{opacity:0}
        }
        @keyframes nfGlC {
          0%,83%,100%{transform:translateX(0);opacity:0} 84%{transform:translateX(6px);opacity:.9}
          86%{transform:translateX(-5px);opacity:.6} 88%{opacity:0}
        }
        .nf-hl  { font-size:clamp(11px,1.8vw,18px);letter-spacing:clamp(3px,1vw,7px);text-transform:uppercase;color:#f8fafc;opacity:0;animation:nfUp .45s ease 1.3s forwards;margin-bottom:clamp(6px,1.2vw,12px); }
        .nf-sub { font-size:clamp(10px,1.3vw,13px);color:rgba(248,250,252,.5);letter-spacing:clamp(1px,.5vw,3px);opacity:0;animation:nfUp .45s ease 1.5s forwards;margin-bottom:clamp(24px,4vw,40px); }
        @keyframes nfUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .nf-btn {
          display:inline-block;padding:clamp(10px,1.5vw,14px) clamp(20px,4vw,40px);
          font-family:'Space Mono',monospace;font-size:clamp(10px,1.2vw,13px);
          letter-spacing:clamp(2px,.6vw,4px);text-transform:uppercase;text-decoration:none;
          color:var(--primary);background:var(--accent);border:none;cursor:pointer;
          position:relative;overflow:hidden;opacity:0;animation:nfUp .45s ease 1.7s forwards;
          transition:color .28s;clip-path:polygon(7px 0%,100% 0%,calc(100% - 7px) 100%,0% 100%);font-weight:700;
        }
        .nf-btn::before {
          content:'';position:absolute;inset:0;background:#f8fafc;
          transform:translateX(-102%);transition:transform .3s cubic-bezier(.77,0,.18,1);z-index:0;
        }
        .nf-btn:hover::before{transform:translateX(0)} .nf-btn:hover{color:var(--primary)}
        .nf-btn span{position:relative;z-index:1}
        .nf-frag {
          position:fixed;width:2px;opacity:0;background:var(--accent);
          animation:nfFrag .75s ease .65s forwards;z-index:600;
        }
        .nf-frag.b{background:#93c5fd}
        @keyframes nfFrag {
          0%  {opacity:1;transform:translateY(0) scaleY(1)}
          100%{opacity:0;transform:translateY(var(--dy)) translateX(var(--dx)) scaleY(.2)}
        }
      `}</style>

      <div className="nf-root">
        <div className="nf-crack" id="nf-crack" />

        {FRAGS.map((f, i) => (
          <div key={i} className={`nf-frag${f.b ? " b" : ""}`}
            style={{
              left: f.l, top: "50%", height: f.h,
              transformOrigin: f.orig,
              "--dy": f.dy, "--dx": f.dx,
            }}
          />
        ))}

        <div className="nf-panel nf-ptop" id="nf-ptop">
          <div className="nf-scene">
            <div className="nf-404" ref={num404Ref}>404</div>
            <div className="nf-hl">Página no encontrada</div>
            <div className="nf-sub">La página que buscas no existe o fue movida.</div>
            <Link to="/" className="nf-btn"><span>← Volver al inicio</span></Link>
          </div>
        </div>

        <div className="nf-panel nf-pbot" id="nf-pbot">
          <div className="nf-scene">
            <div className="nf-404">404</div>
            <div className="nf-hl">Página no encontrada</div>
            <div className="nf-sub">La página que buscas no existe o fue movida.</div>
            <Link to="/" className="nf-btn"><span>← Volver al inicio</span></Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
