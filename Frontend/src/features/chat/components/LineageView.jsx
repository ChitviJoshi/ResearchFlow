import { useEffect, useId, useMemo, useState } from "react";
import { getLineage } from "../services/chat.api";
import { ICONS, Icon, TYPE_META } from "../../../shared/components/icons.jsx";

const NODE_W = 176;
const NODE_H = 54;
const COL_GAP = 56;
const ROW_GAP = 20;
const PAD = 22;
const AXIS_H = 34;

const REASONS = {
  manual: "Linked by hand",
  "zip-contains": "Found inside a zip bundle",
  "notebook-output-hash": "Identical to an image in the notebook's output",
  "notebook-output-filename": "The notebook saves a file with this name",
  "notebook-input-filename": "The notebook reads a file with this name",
};

/** Shortens from the middle so the file extension and run number stay visible. */
const clipName = (text, max) => {
  if (text.length <= max) return text;
  const tail = 8;
  return `${text.slice(0, max - tail - 1)}\u2026${text.slice(-tail)}`;
};

/** Number of ids reachable from `start` by following `nextOf`. */
const reach = (start, nextOf) => {
  const seen = new Set();
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    for (const next of nextOf.get(current) || []) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen.size;
};

/**
 * Places nodes in columns by depth (a node sits one column right of its
 * deepest source), then orders each column to keep the lines short.
 */
function layoutGraph(nodes, edges, rootId) {
  const ids = nodes.map((n) => String(n._id));
  const byId = new Map(nodes.map((n) => [String(n._id), n]));
  const parentsOf = new Map(ids.map((id) => [id, []]));
  const childrenOf = new Map(ids.map((id) => [id, []]));

  edges.forEach((e) => {
    const from = String(e.from);
    const to = String(e.to);
    if (parentsOf.has(from) && parentsOf.has(to)) {
      parentsOf.get(to).push(from);
      childrenOf.get(from).push(to);
    }
  });

  // The pass limit keeps a bad cycle in old data from looping forever
  const depth = new Map(ids.map((id) => [id, 0]));
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false;
    for (const id of ids) {
      for (const parent of parentsOf.get(id)) {
        if (depth.get(id) < depth.get(parent) + 1) {
          depth.set(id, depth.get(parent) + 1);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  const maxDepth = Math.max(...depth.values());
  const columns = Array.from({ length: maxDepth + 1 }, () => []);
  ids.forEach((id) => columns[depth.get(id)].push(id));

  const row = new Map();
  columns.forEach((column, d) => {
    const byName = (a, b) => byId.get(a).fileName.localeCompare(byId.get(b).fileName);
    if (d === 0) {
      column.sort(byName);
    } else {
      const score = (id) => {
        const parents = parentsOf.get(id);
        return parents.length ? parents.reduce((sum, p) => sum + (row.get(p) ?? 0), 0) / parents.length : 0;
      };
      column.sort((a, b) => score(a) - score(b) || byName(a, b));
    }
    column.forEach((id, i) => row.set(id, i));
  });

  const columnHeight = (count) => count * NODE_H + (count - 1) * ROW_GAP;
  const tallest = columnHeight(Math.max(...columns.map((c) => c.length)));
  const pos = new Map();
  columns.forEach((column, d) => {
    const offset = (tallest - columnHeight(column.length)) / 2;
    column.forEach((id, i) => {
      pos.set(id, { x: PAD + d * (NODE_W + COL_GAP), y: PAD + offset + i * (NODE_H + ROW_GAP) });
    });
  });

  return {
    pos,
    byId,
    parentsOf,
    childrenOf,
    width: PAD * 2 + (maxDepth + 1) * NODE_W + maxDepth * COL_GAP,
    height: PAD * 2 + tallest,
    cameFrom: reach(rootId, parentsOf),
    ledTo: reach(rootId, childrenOf),
  };
}

const edgePath = (a, b) => {
  const x1 = a.x + NODE_W;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x - 3;
  const y2 = b.y + NODE_H / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
};

const plural = (n) => `${n} item${n === 1 ? "" : "s"}`;
const TYPES = Object.keys(TYPE_META);

function LineageView({ versionId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const markerId = `arrow-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    setActive(null);
    getLineage(versionId)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Could not load the lineage");
      });
    return () => {
      cancelled = true;
    };
  }, [versionId]);

  const graph = useMemo(
    () => (data ? layoutGraph(data.nodes, data.edges, String(data.root)) : null),
    [data]
  );

  // The hovered or focused node plus its direct neighbours stay bright; the rest recedes
  const lit = useMemo(() => {
    if (!active || !graph) return null;
    const set = new Set([active]);
    graph.parentsOf.get(active)?.forEach((id) => set.add(id));
    graph.childrenOf.get(active)?.forEach((id) => set.add(id));
    return set;
  }, [active, graph]);

  if (error) return <p className="evidence-status is-missing">{error}</p>;
  if (!graph) return <p className="evidence-status">Loading lineage...</p>;

  const rootId = String(data.root);
  const isAlone = data.nodes.length <= 1;
  const svgHeight = graph.height + (isAlone ? 0 : AXIS_H);

  return (
    <div className="lineage">
      <p className="lineage-summary">
        {isAlone
          ? "No lineage recorded yet. This item has no known sources and nothing has been made from it."
          : `Came from ${plural(graph.cameFrom)}, led to ${plural(graph.ledTo)}.`}
      </p>

      {!isAlone && <p className="lineage-hint">Swipe sideways to follow the whole chain.</p>}

      <div className="lineage-scroll">
        <svg
          width={graph.width}
          height={svgHeight}
          viewBox={`0 0 ${graph.width} ${svgHeight}`}
          style={{ width: "100%", minWidth: Math.round(graph.width * 0.72), maxWidth: graph.width, height: "auto" }}
          role="group"
          aria-label="Lineage graph: sources on the left, what was made from them on the right"
        >
          <defs>
            {TYPES.map((t) => (
              <marker key={t} id={`${markerId}-${t}`} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" className={`lm lm-${t}`} />
              </marker>
            ))}
            <marker id={`${markerId}-axis`} viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" className="lm-axis" />
            </marker>
          </defs>

          {data.edges.map((e, i) => {
            const from = graph.pos.get(String(e.from));
            const to = graph.pos.get(String(e.to));
            if (!from || !to) return null;
            const sourceType = graph.byId.get(String(e.from))?.type || "result";
            const isAuto = e.source === "auto";
            const connected = active && (String(e.from) === active || String(e.to) === active);
            const state = !active ? "" : connected ? " is-hot" : " is-dim";
            return (
              <path
                key={i}
                d={edgePath(from, to)}
                className={`le le-${sourceType} ${isAuto ? "le-auto" : "le-solid"}${state}`}
                pathLength={isAuto ? undefined : 1}
                markerEnd={`url(#${markerId}-${sourceType})`}
                style={{ animationDelay: `${0.12 + i * 0.07}s` }}
              >
                <title>{`${REASONS[e.reason] || "Linked"}${isAuto ? " (automatic)" : ""}`}</title>
              </path>
            );
          })}

          {data.nodes.map((n, i) => {
            const id = String(n._id);
            const p = graph.pos.get(id);
            const meta = TYPE_META[n.type] || TYPE_META.result;
            const isRoot = id === rootId;
            const dim = lit && !lit.has(id);
            return (
              <g
                key={id}
                transform={`translate(${p.x},${p.y})`}
                className={`ln ln-${n.type}${isRoot ? " is-root" : ""}${dim ? " is-dim" : ""}`}
                tabIndex={0}
                role="group"
                aria-label={`${n.fileName}, ${meta.label} version ${n.versionNumber}${isRoot ? ", selected item" : ""}`}
                onMouseEnter={() => setActive(id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(id)}
                onBlur={() => setActive(null)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <title>{`${n.fileName} (${meta.label} v${n.versionNumber})`}</title>
                {isRoot && <rect className="ln-glow" x="-5" y="-5" width={NODE_W + 10} height={NODE_H + 10} rx="17" />}
                <rect className="ln-box" width={NODE_W} height={NODE_H} rx="12" />
                <circle className="ln-badge" cx="25" cy={NODE_H / 2} r="12.5" />
                <g className="ln-icon" transform={`translate(${25 - 8.4},${NODE_H / 2 - 8.4}) scale(0.7)`}>
                  {ICONS[meta.icon].map((d, k) => <path key={k} d={d} />)}
                </g>
                <text className="ln-name" x="45" y="23">{clipName(n.fileName, 18)}</text>
                <text className="ln-meta" x="45" y="39">
                  {meta.label} · v{n.versionNumber}{isRoot ? " · selected" : ""}
                </text>
              </g>
            );
          })}

          {!isAlone && (
            <g transform={`translate(0,${graph.height + 4})`} aria-hidden="true">
              <text className="axis-label" x={PAD} y="13">Sources</text>
              <line className="axis-line" x1={PAD + 58} y1="9" x2={graph.width - PAD - 108} y2="9" markerEnd={`url(#${markerId}-axis)`} />
              <text className="axis-label" x={graph.width - PAD} y="13" textAnchor="end">Made from them</text>
            </g>
          )}
        </svg>
      </div>

      <div className="lineage-legend">
        {TYPES.map((t) => (
          <span key={t} className={`legend-chip type-${t}`}>
            <Icon name={TYPE_META[t].icon} size={12} />
            {TYPE_META[t].label}
          </span>
        ))}
        <span className="legend-line">
          <svg width="26" height="8" aria-hidden="true"><line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          Linked by hand
        </span>
        <span className="legend-line">
          <svg width="26" height="8" aria-hidden="true"><line x1="0" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5 4" /></svg>
          Found automatically
        </span>
      </div>
    </div>
  );
}

export default LineageView;
