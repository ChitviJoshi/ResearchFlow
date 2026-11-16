import { Icon } from "../../../shared/components/icons.jsx";
import { initials } from "../../../shared/utils/format.js";

/** Who can see this repository. Only the owner gets the "Add person" button. */
function PeopleStrip({ repo, isOwner, onAdd }) {
  const members = [
    { user: repo.owner, label: "Owner" },
    ...(repo.collaborators || [])
      .filter((c) => c.user)
      .map((c) => ({ user: c.user, label: c.user.role === "professor" ? "Reviewer" : "Collaborator" })),
  ];

  return (
    <section className="people-strip" aria-label="People with access">
      <h2 className="people-title">People</h2>

      <ul className="people-list">
        {members.map(({ user, label }) => (
          <li key={user._id} className="person" title={user.email}>
            <span className={`avatar sm role-${user.role}`} aria-hidden="true">{initials(user.name)}</span>
            <span className="person-text">
              <strong>{user.name}</strong>
              <span>{label}</span>
            </span>
          </li>
        ))}
      </ul>

      {isOwner && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onAdd}>
          <Icon name="plus" size={14} /> Add person
        </button>
      )}
    </section>
  );
}

export default PeopleStrip;
