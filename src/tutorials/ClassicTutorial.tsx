import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const ClassicTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const searchOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
  const rowOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' });
  const legendOpacity = interpolate(frame, [160, 180], [0, 1], { extrapolateRight: 'clamp' });
  const finalOpacity = interpolate(frame, [230, 250], [0, 1], { extrapolateRight: 'clamp' });

  const rowY = spring({ frame: frame - 80, fps, config: { damping: 15 } });

  // Simulated typing
  const typedChars = Math.min(Math.floor((frame - 35) / 4), 8);
  const searchText = 'Beholder'.slice(0, Math.max(0, typedChars));

  const mockCells = [
    { label: 'Large', color: '#2a6e2e', text: '#b5f0b5' },
    { label: 'Aberr.', color: '#2a6e2e', text: '#b5f0b5' },
    { label: '13 \u2B07', color: '#2a2925', text: '#facc15' },
    { label: 'LE', color: '#7a6218', text: '#f0d870' },
    { label: '\u2014', color: '#2a2925', text: '#6a665e' },
    { label: 'Fly', color: '#7a6218', text: '#f0d870' },
    { label: 'DV', color: '#2a6e2e', text: '#b5f0b5' },
  ];

  return (
    <AbsoluteFill style={{
      backgroundColor: '#1c1e21',
      fontFamily: "'Crimson Text', Georgia, serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      gap: 24,
    }}>
      {/* Title */}
      <div style={{ opacity: titleOpacity, textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 48,
          color: '#c8a951',
          letterSpacing: 4,
          margin: 0,
        }}>Classic Mode</h1>
      </div>
      <p style={{
        opacity: subtitleOpacity,
        color: '#9e9a92',
        fontSize: 22,
        fontStyle: 'italic',
        margin: 0,
      }}>Guess the D&D monster by its attributes</p>

      {/* Mock search */}
      <div style={{
        opacity: searchOpacity,
        width: '80%',
        maxWidth: 500,
        padding: '14px 20px',
        background: '#1a1c1f',
        border: '2px solid #3a3830',
        borderRadius: 10,
        color: searchText ? '#e8e6e1' : '#5e5a52',
        fontSize: 20,
        fontStyle: searchText ? 'normal' : 'italic',
      }}>
        {searchText || 'Type a monster name...'}
        {searchText && frame % 20 < 10 && <span style={{ color: '#c8a951' }}>|</span>}
      </div>

      {/* Mock guess row */}
      <div style={{
        opacity: rowOpacity,
        transform: `translateY(${interpolate(rowY, [0, 1], [20, 0])}px)`,
        display: 'flex',
        gap: 6,
        width: '90%',
        maxWidth: 700,
      }}>
        <div style={{
          padding: '12px 10px',
          background: '#242527',
          border: '1px solid #3a3830',
          borderRadius: 8,
          color: '#e8e6e1',
          fontFamily: "'Cinzel', serif",
          fontSize: 14,
          fontWeight: 700,
          minWidth: 100,
        }}>Beholder</div>
        {mockCells.map((cell, i) => {
          const cellDelay = 100 + i * 8;
          const cellOpacity = interpolate(frame, [cellDelay, cellDelay + 10], [0, 1], { extrapolateRight: 'clamp' });
          return (
            <div key={i} style={{
              opacity: cellOpacity,
              flex: 1,
              padding: '12px 4px',
              background: cell.color,
              borderRadius: 8,
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: cell.text,
            }}>{cell.label}</div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        opacity: legendOpacity,
        display: 'flex',
        gap: 20,
        fontSize: 18,
        color: '#e8e6e1',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <span>\uD83D\uDFE9 <span style={{ color: '#b5f0b5' }}>Match</span></span>
        <span>\uD83D\uDFE8 <span style={{ color: '#f0d870' }}>Partial</span></span>
        <span>\u2B1B <span style={{ color: '#6a665e' }}>Wrong</span></span>
        <span>\u2B06\u2B07 <span style={{ color: '#facc15' }}>Higher/Lower</span></span>
      </div>

      {/* Final message */}
      <p style={{
        opacity: finalOpacity,
        fontFamily: "'Cinzel', serif",
        fontSize: 22,
        color: '#e8d48b',
        textAlign: 'center',
      }}>Keep guessing until all cells are \uD83D\uDFE9!</p>
    </AbsoluteFill>
  );
};
