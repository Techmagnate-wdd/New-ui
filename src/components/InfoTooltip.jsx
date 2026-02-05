import { Tooltip } from "antd";

export const InfoTooltip = ({ title, children }) => (
  <Tooltip
    title={<div style={{ maxWidth: 320 }}>{title}</div>}
    placement="top"
  >
    <span className="cursor-help">{children}</span>
  </Tooltip>
);
