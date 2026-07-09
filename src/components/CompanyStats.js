import React from "react";

function CompanyStats({ assets }) {
    const stats = assets.reduce((result, asset) => {
        const company = asset.company || "Chưa có công ty";

        if (!result[company]) {
            result[company] = {
                total: 0,
                stock: 0,
                using: 0,
            };
        }

        result[company].total += 1;

        if (asset.status === "Kho") {
            result[company].stock += 1;
        } else {
            result[company].using += 1;
        }

        return result;
    }, {});
    const total = assets.reduce(
        (result, asset) => {
            result.total++;

            if (asset.status === "Kho") {
                result.stock++;
            } else {
                result.using++;
            }

            return result;
        },
        {
            total: 0,
            stock: 0,
            using: 0,
        }
    );

    return (
        <div className="company-stats">
            <div className="stat-card total-card">

                <div className="stat-header">
                    TẤT CẢ
                </div>

                <div className="stat-total">
                    {total.total}
                </div>


                <div className="stat-footer">

                    <div className="using-item">
                        🟢 {total.using}
                    </div>

                    <div className="stock-item">
                        📦 {total.stock}
                    </div>

                </div>

            </div>
            {Object.entries(stats).map(([company, value]) => (
                <div className="stat-card" key={company}>

                    <div className="stat-header">
                        {company}
                    </div>

                    <div className="stat-total">
                        {value.total}
                    </div>

                    <div className="stat-footer">

                        <div className="using-item">
                            🟢 {value.using}
                        </div>

                        <div className="stock-item">
                            📦 {value.stock}
                        </div>

                    </div>

                </div>
            ))}
        </div>
    );
}

export default CompanyStats;