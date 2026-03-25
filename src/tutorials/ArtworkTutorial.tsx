import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const ArtworkTutorial: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const imgOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' });
  const blur = interpolate(frame, [40, 200], [25, 0], { extrapolateRight: 'clamp' });
  const revealOpacity = interpolate(frame, [200, 220], [0, 1], { extrapolateRight: 'clamp' });
  const hintOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: 'clamp' });

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
      }}>Artwork Mode</h1>

      <p style={{
        opacity: titleOpacity,
        color: '#9e9a92',
        fontSize: 20,
        fontStyle: 'italic',
      }}>Identify the creature from its art</p>

      {/* Blurred placeholder */}
      <div style={{
        opacity: imgOpacity,
        width: 300,
        height: 220,
        borderRadius: 12,
        border: '2px solid #3a3830',
        overflow: 'hidden',
        background: '#242527',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4a3520, #2a1a10, #3a2515, #1a0a05)',
          filter: `blur(${blur}px)`,
          transition: 'filter 0.3s',
        }} />
      </div>

      <p style={{
        opacity: hintOpacity,
        fontSize: 18,
        color: '#9e9a92',
      }}>Each wrong guess clears the blur a little more...</p>

      <p style={{
        opacity: revealOpacity,
        fontFamily: "'Cinzel', serif",
        fontSize: 24,
        color: '#e8d48b',
      }}>Can you name the creature? \uD83D\uDC09</p>
    </AbsoluteFill>
  );
};
