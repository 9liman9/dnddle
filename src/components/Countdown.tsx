import { useCountdown } from '../hooks/useCountdown';
import './Countdown.css';

export function Countdown() {
  const { formatted } = useCountdown();

  return (
    <div className="countdown">
      <span className="countdown__label">Next puzzle in</span>
      <span className="countdown__time">{formatted}</span>
    </div>
  );
}
