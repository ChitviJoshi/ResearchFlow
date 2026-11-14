import { Icon } from "../../../shared/components/icons.jsx";

const STATUS = {
  open: { label: "Open", icon: "clock" },
  changes_requested: { label: "Changes requested", icon: "alert" },
  approved: { label: "Approved", icon: "check" },
};

/** Status shown as icon plus words, so it never depends on colour alone. */
function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.open;
  return (
    <span className={`status-pill status-${status}`}>
      <Icon name={s.icon} size={13} />
      {s.label}
    </span>
  );
}

export default StatusPill;
