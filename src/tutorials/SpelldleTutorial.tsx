import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const SpelldleTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const rowOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' });
  const legendOpacity = interpolate(frame, [140, 160], [0, 1], { extrapolateRight: 'clamp' });
  const finalOpacity = interpolate(frame, [200, 220], [0, 1], { extrapolateRight: 'clamp' });

  const rowY = spring({ frame: frame - 50, fps, config: { damping: 15 } });

  const cols = ['Lvl 3', 'Evoc.', '1 Act', '150ft', 'V,S,M', '1 rnd', 'Yes'];
  const colors = ['#2a6e2e', '#2a2925', '#2a6e2e', '#2a2925', '#7a6218', '#2a2925', '#2a6e2e'];
  const texts = ['#b5f0b5', '#6a665e', '#b5f0b5', '#facc15', '#f0d870', '#6a665e', '#b5f0b5'];

  return (
    <AbsoluteFill style={{
      backgroundColor: '#1c1e21',
      fontFamily: "'Crimson Text', Georgia, serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      gap: 20,
    }}>
      <h1 style={{
        opacity: titleOpacity,
        fontFamily: "'Cinzel', serif",
        fontSize: 48,
        color: '#c8a951',
        letterSpacing: 4,
      }}>Spell'dle</h1>

      <p style={{
        opacity: titleOpacity,
        color: '#9e9a92',
        fontSize: 20,
        fontStyle: 'italic',
      }}>Guess the spell by its properties</p>

      {/* Column headers */}
      <div style={{
        opacity: rowOpacity,
        display: 'flex',
        gap: 6,
        width: '90%',
        maxWidth: 650,
      }}>
        {['Level', 'School', 'Cast', 'Range', 'Comp.', 'Dur.', 'Conc.'].map((h, i) => (
          <div key={i} style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            color: '#8a7535',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>{h}</div>
        ))}
      </div>

      {/* Mock row */}
      <div style={{
        opacity: rowOpacity,
        transform: `translateY(${interpolate(rowY, [0, 1], [20, 0])}px)`,
        display: 'flex',
        gap: 6,
        width: '90%',
        maxWidth: 650,
      }}>
        {cols.map((label, i) => {
          const d = 70 + i * 8;
          const o = interpolate(frame, [d, d + 10], [0, 1], { extrapolateRight: 'clamp' });
          const arrow = i === 3 ? ' \u2B07' : '';
          return (
            <div key={i} style={{
              opacity: o,
              flex: 1,
              padding: '12px 4px',
              background: colors[i],
              borderRadius: 8,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: texts[i],
            }}>{label}{arrow}</div>
          );
        })}
      </div>

      <div style={{
        opacity: legendOpacity,
        display: 'flex',
        gap: 16,
        fontSize: 16,
        color: '#e8e6e1',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <span>Level \u2022 School \u2022 Casting Time \u2022 Range</span>
      </div>
      <div style={{
        opacity: legendOpacity,
        display: 'flex',
        gap: 16,
        fontSize: 16,
        color: '#9e9a92',
      }}>
        <span>Components \u2022 Duration \u2022 Concentration</span>
      </div>

      <p style={{
        opacity: finalOpacity,
        fontFamily: "'Cinzel', serif",
        fontSize: 22,
        color: '#e8d48b',
      }}>557 spells from all D&D sourcebooks! \u2728</p>
    </AbsoluteFill>
  );
};
