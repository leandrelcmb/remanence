import type { ChasseType } from "./ChasseScreen";

type Props = {
  onBack: () => void;
  onChasse: (type: ChasseType) => void;
  onComingSoon: () => void;
};

type GameCard = {
  id: string;
  emoji: string;
  title: string;
  sub: string;
  active: true;
  chasseType: ChasseType;
} | {
  id: string;
  emoji: string;
  title: string;
  sub: string;
  active: false;
};

const GAMES: GameCard[] = [
  { id: "chromatic", emoji: "🎨", title: "Chasse Chromatique", sub: "Traque une couleur au festival",       active: true,  chasseType: "chromatic"    },
  { id: "formes",    emoji: "🔷", title: "Chasse des Formes",   sub: "Capture des formes géométriques",    active: true,  chasseType: "formes"       },
  { id: "perso",     emoji: "🧑", title: "Chasse des Persos",   sub: "Immortalise des archétypes du camp", active: true,  chasseType: "personnages"  },
  { id: "soon1",     emoji: "⚡", title: "Blind Set",           sub: "Bientôt",                            active: false },
  { id: "soon2",     emoji: "🃏", title: "Mémoire Sensorielle", sub: "Bientôt",                            active: false },
  { id: "soon3",     emoji: "🎪", title: "Bingo Festival",      sub: "Bientôt",                            active: false },
];

export function GamesScreen({ onBack, onChasse, onComingSoon }: Props) {
  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* ── Header fixe ── */}
      <div style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 16px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>Jeux 🎮</div>
          <div style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>Explore le festival autrement</div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 999,
            padding: "8px 16px",
            fontSize: 13,
            color: "white",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Home ॐ
        </button>
      </div>

      {/* ── Corps scrollable ── */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: "auto",
        padding: "20px 16px 60px",
      }}>

        {/* Grille 2 colonnes */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}>
          {GAMES.map((game) => {
            const handleClick = game.active
              ? () => onChasse(game.chasseType)
              : onComingSoon;

            return (
              <button
                key={game.id}
                onClick={handleClick}
                style={{
                  aspectRatio: "1",
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  padding: 16,
                  cursor: "pointer",
                  opacity: game.active ? 1 : 0.45,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: "white",
                  position: "relative",
                }}
              >
                {/* Emoji */}
                <div style={{ fontSize: 32, lineHeight: 1 }}>{game.emoji}</div>

                {/* Texte */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>
                    {game.title}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.4 }}>
                    {game.sub}
                  </div>
                </div>

                {/* Badge "Bientôt" pour les inactifs */}
                {!game.active && (
                  <div style={{
                    position: "absolute",
                    top: 10, right: 10,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 10,
                    opacity: 0.8,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}>
                    BIENTÔT
                  </div>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
