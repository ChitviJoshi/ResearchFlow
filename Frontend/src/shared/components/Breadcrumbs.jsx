import { Link } from "react-router-dom";
import { Icon } from "./icons.jsx";

function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, i) => (
          <li key={i}>
            {item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            {i < items.length - 1 && <Icon name="chevronRight" size={13} className="crumb-sep" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
