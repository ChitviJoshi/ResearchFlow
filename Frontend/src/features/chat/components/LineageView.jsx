import { useEffect, useId, useMemo, useState } from "react";
import { getLineage } from "../services/chat.api";

const NODE_W = 156;
const NODE_H = 46;
const COL_GAP = 46;
const ROW_GAP = 16;
const PAD = 14;

const TYPE_STYLE = {
  paper: { fill: "#E8EFE9", stroke: "#2F5D50", label: "Paper" },
  dataset: { fill: "#EFEAE0", stroke: "#8A6D3B", label: "Dataset" },
  experiment: { fill: "#E6EEF3", stroke: "#3D6A87", label: "Experiment" },
  result: { fill: "#F3E8E6", stroke: "#A15A3D", label: "Result" },
};

const REASONS = {
  manual: "Linked by hand",
  "zip-contains": "Found inside a zip bundle",
  "notebook-output-hash": "Identical to an image in the notebook's output",
  "notebook-output-filename": "The notebook saves a file with this name",
  "notebook-input-filename": "The notebook reads a file with this name",
};

const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 3)}...` : text);

/** Every id reachable from `start` by following `nextOf`. */
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
    width: PAD * 2 + (maxDepth + 1) * NODE_W + maxDepth * COL_GAP,
    height: PAD * 2 + tallest,
    cameFrom: reach(rootId, parentsOf),
    ledTo: reach(rootId, childrenOf),
  };
}

const edgePath = (a, b) => {
  const x1 = a.x + NODE_W;
  const y1 = a.y + NODE_H / 2;
  const x2 = b.x;
  const y2 = b.y + NODE_H / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
};

const plural = (n) => `${n} item${n === 1 ? "" : "s"}`;

function LineageView({ versionId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const markerId = `arrow-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
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

  if (error) return <p className="attachment-note not-found">{error}</p>;
  if (!graph) return <p className="attachment-note">Loading lineage...</p>;

  const rootId = String(data.root);
  const isAlone = data.nodes.length <= 1;

  return (
    <div className="lineage">
      <p className="lineage-summary">
        {isAlone
          ? "No lineage recorded yet. This item has no known sources and nothing has been made from it."
          : `Came from ${plural(graph.cameFrom)}, led to ${plural(graph.ledTo)}.`}
      </p>

      <div className="lineage-scroll">
        <svg
          width={graph.width}
          height={graph.height}
          role="img"
          aria-label="Lineage graph: sources on the left, what was made from them on the right"
        >
          <defs>
            <marker id={markerId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="#5C574E" />
            </marker>
          </defs>

          {data.edges.map((e, i) => {
            const from = graph.pos.get(String(e.from));
            const to = graph.pos.get(String(e.to));
            if (!from || !to) return null;
            const d = edgePath(from, to);
            const isAuto = e.source === "auto";
            return (
              <g key={i}>
                <title>{`${REASONS[e.reason] || "Linked"}${isAuto ? " (automatic)" : ""}`}</title>
                <path
                  d={d}
                  fill="none"
                  stroke={isAuto ? "#5C574E" : "#2F5D50"}
                  strokeWidth="1.5"
                  strokeDasharray={isAuto ? "5 4" : undefined}
                  markerEnd={`url(#${markerId})`}
                />
                <path d={d} fill="none" stroke="transparent" strokeWidth="12" />
              </g>
            );
          })}

          {data.nodes.map((n) => {
            const id = String(n._id);
            const p = graph.pos.get(id);
            const style = TYPE_STYLE[n.type] || TYPE_STYLE.result;
            const isRoot = id === rootId;
            return (
              <g key={id} transform={`translate(${p.x},${p.y})`}>
                <title>{`${n.fileName} (${style.label} v${n.versionNumber})`}</title>
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="6"
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={isRoot ? 2.6 : 1.2}
                />
                <text x="10" y="19" className="lineage-node-name">{clip(n.fileName, 20)}</text>
                <text x="10" y="35" className="lineage-node-meta">
                  {style.label} v{n.versionNumber}{isRoot ? " - selected" : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="lineage-legend">
        {Object.values(TYPE_STYLE).map((s) => (
          <span key={s.label}>
            <i className="legend-swatch" style={{ background: s.fill, borderColor: s.stroke }} />
            {s.label}
          </span>
        ))}
        <span>Solid line: linked by hand</span>
        <span>Dashed line: found automatically</span>
      </div>
    </div>
  );
}

export default LineageView;