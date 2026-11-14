import { BrandMark, ICONS } from "../../../shared/components/icons.jsx";

const NODES = [
  { type: "dataset", label: "Dataset", file: "vibration_run1.csv", x: 0, y: 8, tone: "#8A6D3B", soft: "#F1EAD9" },
  { type: "experiment", label: "Experiment", file: "fft_analysis.ipynb", x: 86, y: 78, tone: "#3D6A87", soft: "#E1EAF0" },
  { type: "result", label: "Result", file: "fig_spectrum.png", x: 172, y: 148, tone: "#A15A3D", soft: "#F4E4DD" },
  { type: "paper", label: "Paper", file: "paper_v2.pdf", x: 258, y: 218, tone: "#2F5D50", soft: "#E3ECE7" },
];
const W = 132;
const H = 46;

/** Left panel on the sign-in and register screens: the product idea as one small diagram. */
function AuthAside() {
  return (
    <aside className="auth-aside">
      <div className="auth-aside-brand">
        <BrandMark size={28} />
        <span>ResearchFlow</span>
      </div>

      <div className="auth-aside-copy">
        <h2>Every figure in your paper, traced back to the data behind it.</h2>
        <p>Version your research, review it with your supervisor, and always know where a result came from.</p>
      </div>

      <svg className="auth-motif" viewBox="0 0 394 272" role="img" aria-label="A dataset leads to an experiment, then a result, then a paper">
        <defs>
          <marker id="motif-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="#CFE0D8" />
          </marker>
        </defs>

        {NODES.slice(0, -1).map((n, i) => {
          const next = NODES[i + 1];
          const x1 = n.x + W / 2;
          const y1 = n.y + H;
          const x2 = next.x + W / 2;
          const y2 = next.y;
          return (
            <path
              key={n.type}
              d={`M ${x1} ${y1} C ${x1} ${y1 + 24}, ${x2} ${y2 - 24}, ${x2} ${y2 - 2}`}
              fill="none"
              stroke="#CFE0D8"
              strokeWidth="1.6"
              strokeDasharray="1"
              pathLength="1"
              markerEnd="url(#motif-arrow)"
              className="motif-edge"
              style={{ animationDelay: `${0.25 + i * 0.25}s` }}
            />
          );
        })}

        {NODES.map((n, i) => (
          <g key={n.type} transform={`translate(${n.x},${n.y})`} className="motif-node" style={{ animationDelay: `${i * 0.18}s` }}>
            <rect width={W} height={H} rx="12" fill={n.soft} stroke={n.tone} strokeWidth="1.2" />
            <circle cx="22" cy={H / 2} r="13" fill={n.tone} />
            <g transform={`translate(${22 - 8},${H / 2 - 8}) scale(0.667)`} fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              {ICONS[n.type].map((d, k) => <path key={k} d={d} />)}
            </g>
            <text x="42" y="20" fontSize="12.5" fontWeight="600" fill="#1F1D1A">{n.label}</text>
            <text x="42" y="35" fontSize="10.5" fill="#5C574E">{n.file}</text>
          </g>
        ))}
      </svg>
    </aside>
  );
}

export default AuthAside;
