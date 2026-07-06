import { useEffect } from 'react';

export default function FloatingText({ x, y, value, onAnimationEnd }) {
  useEffect(() => { const timer = setTimeout(onAnimationEnd, 1000); return () => clearTimeout(timer); }, [onAnimationEnd]);
  return <div className="floating-text" style={{ left: x, top: y }}>+₱{value}</div>;
}
