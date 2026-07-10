import React from "react";

function AuditLog({ logs = [] }) {
  if (!logs.length) {
    return <p>Chưa có lịch sử thay đổi.</p>;
  }

  return (
    <div className="audit-log">
      <h3>Lịch sử thay đổi</h3>

      {logs.slice().reverse().map((log, index) => (
        <div className="log-item" key={index}>
          <div className="log-date">{log.date}</div>
          <div className="log-action">{log.action}</div>
          <div className="log-detail">{log.detail}</div>
        </div>
      ))}
    </div>
  );
}

export default AuditLog;