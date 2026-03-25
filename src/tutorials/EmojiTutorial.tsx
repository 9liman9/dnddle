import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const EmojiTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  const emojiRows = [
    { emojis: ['\uD83D\uDC18', '\uD83D\uDC09'], label: 'Size + Type', delay: 40 },
    { emojis: ['\uD83C\uDFD4\uFE0F', '\uD83D\uDD73\uFE0F'], label: 'Biome', delay: 80 },
    { emojis: ['\uD83E\uDD85', '\uD83D\uDEB6'], label: 'Movement', delay: 120 },
    { emojis: ['\uD83D\uDE31', '\u2694\uFE0F', '\u2694\uFE0F', '\u2694\uFE0F'], label: 'Danger Level', delay: 160 },
  ];

  const revealOpacity = interpolate(frame, [200, 220], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      backgroundColor: '#1c1e21',
      fontFamily: "'Crimson Text', Georgia, serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      gap: 16,
    }}>
      <h1 style={{
        opacity: titleOpacity,
        fontFamily: "'Cinzel', serif",
        fontSize: 48,
        color: '#c8a951',
        letterSpacing: 4,
      }}>Emoji Mode</h1>

      <p style={{
        opacity: titleOpacity,
        color: '#9e9a92',
        fontSize: 20,
        fontStyle: 'italic',
        marginBottom: 12,
      }}>Decode the emojis to find the monster</p>

      {emojiRows.map((row, i) => {
        const rowSpring = spring({ frame: frame - row.delay, fps, config: { damping: 12 } });
        const rowOpacity = interpolate(frame, [row.delay, row.delay + 15], [0, 1], { extrapolateRight: 'clamp' });
        return (
          <div key={i} style={{
            opacity: rowOpacity,
            transform: `translateX(${interpolate(rowSpring, [0, 1], [-40, 0])}px)`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '12px 20px',
            background: '#2c2e31',
            borderRadius: 12,
            border: '1px solid #3a3830',
            width: '70%',
            maxWidth: 400,
          }}>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 12,
              color: '#8a7535',
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: '2px solid #8a7535',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>{i + 1}</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {row.emojis.map((e, j) => (
                <span key={j} style={{ fontSize: 32 }}>{e}</span>
              ))}
            </div>
            <span style={{ color: '#9e9a92', fontSize: 14, marginLeft: 'auto' }}>{row.label}</span>
          </div>
        );
      })}

      <p style={{
        opacity: revealOpacity,
        fontFamily: "'Cinzel', serif",
        fontSize: 22,
        color: '#e8d48b',
        marginTop: 12,
      }}>New clues unlock with each guess! \uD83D\uDD2E</p>
    </AbsoluteFill>
  );
};
