import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { categoryBadgeLabel, type Finding } from '../api/findings_api';

export default function FindingCard({ finding }: { finding: Finding }) {
  return (
    <article className={`fd-card fd-card--${finding.category}`}>
      <div className="fd-card-head">
        <h2>{finding.title}</h2>
        <span className="fd-badge">
          <span className="fd-badge-dot" />
          {categoryBadgeLabel[finding.category] ?? finding.category}
        </span>
      </div>

      {finding.clauseRef ? (
        <p className="fd-card-clause">{finding.clauseRef}</p>
      ) : (
        <p className="fd-card-clause fd-card-clause--empty">No clause reference</p>
      )}
      <p className="fd-card-desc">{finding.description}</p>

      <div className="fd-card-foot">
        <Link to={`/findings/${finding.id}/edit`} className="fd-btn-outline">
          Edit
        </Link>
        <Link to={`/findings/${finding.id}`} className="fd-link">
          Details <ChevronRight size={16} />
        </Link>
      </div>
    </article>
  );
}
