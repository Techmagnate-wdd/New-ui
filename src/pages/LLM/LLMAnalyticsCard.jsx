import React from "react";
import { Icon } from "@iconify/react";
import { Tooltip } from "react-tooltip";

const LLMAnalyticsCard = ({ title, stats, icon, iconColor, iconBg, tooltipContent }) => {
    const tooltipId = `${title.replace(/\s+/g, "-")}-tooltip`;
    const iconWrapperStyle = {
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: iconBg,
    };

    return (
        <div className="col">
            <div className="card border-0 shadow-sm rounded-3 h-100 bg-white hover-shadow">
                <div className="card-body p-20">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <p className="small text-muted mb-1 d-flex align-items-center gap-2">
                            <span className="" style={{ fontSize: "18px" }}>{title}</span>
                            <span
                                data-tooltip-id={tooltipId}
                                className="text-muted cursor-pointer"
                                tabIndex={0}
                                role="button"
                                aria-label={`More info about ${title}`}
                                style={{ lineHeight: "0" }}
                            >
                                <Icon icon="fa6-solid:circle-question" className="text-muted" />
                            </span>
                        </p>
                        <div style={iconWrapperStyle}>
                            <Icon icon={icon} style={{ color: iconColor }} className="text-2xl" />
                        </div>
                    </div>

                    {/* Stats section */}
                    <div className="d-flex justify-content-between align-items-center">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <h4 className="mb-0 fw-bold" style={{ color: iconColor }}>
                                    {stat.value}
                                </h4>
                                <p className="small text-muted mb-0">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Tooltip
                id={tooltipId}
                place="top"
                content={tooltipContent}
                delayShow={150}
            />
        </div>
    );
};

export default LLMAnalyticsCard;
