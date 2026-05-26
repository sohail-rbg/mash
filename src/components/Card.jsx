export default function Card({ children, className = "" }) {
  return (
    <div className={`border border-white/10 rounded-2xl shadow-2xl p-6 bg-zinc-900/50 backdrop-blur-xl text-white ${className}`}>
      {children}
    </div>
  );
}
