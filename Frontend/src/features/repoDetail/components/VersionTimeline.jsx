import { useMemo } from "react";
import VersionCard from "./VersionCard.jsx";
import { dayKey, dayLabel } from "../../../shared/utils/format.js";

/**
 * `versions` is what to show (possibly filtered); `allVersions` is the whole
 * repository, used to find the newest item of each type and to name the
 * sources an item was derived from.
 */
function VersionTimeline({ versions, allVersions }) {
  const everything = allVersions || versions;

  const { latestIds, byId } = useMemo(() => {
    const latest = new Map();
    const lookup = new Map();
    everything.forEach((v) => {
      lookup.set(v._id, v);
      const current = latest.get(v.type);
      if (!current || new Date(v.createdAt) > new Date(current.createdAt)) latest.set(v.type, v);
    });
    return { latestIds: new Set([...latest.values()].map((v) => v._id)), byId: lookup };
  }, [everything]);

  const groups = useMemo(() => {
    const out = [];
    versions.forEach((v) => {
      const key = dayKey(v.createdAt);
      const last = out[out.length - 1];
      if (last && last.key === key) last.items.push(v);
      else out.push({ key, label: dayLabel(v.createdAt), items: [v] });
    });
    return out;
  }, [versions]);

  if (versions.length === 0) {
    return <p className="home-status timeline-empty">Nothing to show here yet.</p>;
  }

  return (
    <div className="timeline">
      {groups.map((group) => (
        <section key={group.key} className="timeline-day">
          <h3 className="timeline-date">{group.label}</h3>
          <ol className="timeline-items">
            {group.items.map((v) => (
              <VersionCard
                key={v._id}
                version={v}
                isLatest={latestIds.has(v._id)}
                sources={(v.derivedFrom || []).map((d) => byId.get(d.version)).filter(Boolean)}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export default VersionTimeline;
