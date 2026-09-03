import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyHistoryData } from '../api/spc_dummy_data';
import { getStatusColor } from '../utils/status_color';

export default function SpcHistoryPage() {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [periodFilter, setPeriodFilter] = useState('All Time');
  const navigate = useNavigate();

  const filteredData = dummyHistoryData.filter((item) => {
    if (statusFilter !== 'All Status' && item.status !== statusFilter) return false;
    // Filter periode belum diimplementasi nyata karena masih data dummy tanpa tanggal asli
    return true;
  });

  return (
    <div className="page-container">
      <h1>Analyses History</h1>

      <div className="filter-row">
        <div className="form-group">
          <label>Analysis Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Capable</option>
            <option>Marginal</option>
            <option>Not Capable</option>
            <option>Process Unstable</option>
          </select>
        </div>

        <div className="form-group">
          <label>Period</label>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option>All Time</option>
            <option>3 Months</option>
            <option>6 Months</option>
            <option>1 Year</option>
          </select>
        </div>
      </div>

      <div className="history-list">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="history-card"
            onClick={() => navigate(`/spc-analysis/history/${item.id}`)}
          >
            <div>
              <h4>{item.productName}</h4>
              <p className="history-date">{item.date}</p>
              <span className={`status-badge ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <span className="arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}