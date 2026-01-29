import React from "react";

const llmTypes = ["llm_chatgpt", "llm_gemini", "llm_perplexity", "llm_claude"];

const modelMap = {
    llm_chatgpt: "ChatGPT-4",
    llm_gemini: "gemini-2.5-flash",
    llm_perplexity: "sonar-reasoning",
    llm_claude: "claude-opus-4-0",
};

const findLLMArray = (root, key) => {
    if (!root) return [];
    if (Array.isArray(root[key])) return root[key];
    if (root.data && Array.isArray(root.data[key])) return root.data[key];
    if (root.llmResults && Array.isArray(root.llmResults[key])) return root.llmResults[key];
    if (root.data && root.data.llmResults && Array.isArray(root.data.llmResults[key]))
        return root.data.llmResults[key];
    return [];
};

const countCitationsInItem = (it) => {
    if (!it) return 0;
    if (Array.isArray(it.citations)) return it.citations.length;

    if (Array.isArray(it.data?.citations)) return it.data.citations.length;

    if (Array.isArray(it.results)) {
        try {
            const r0 = it.results[0] || {};
            const chatCount = r0?.items?.[2]?.sources?.length;
            if (Number.isFinite(chatCount)) return chatCount;

            const annCount = r0?.items?.[0]?.sections?.[0]?.annotations?.length;
            if (Number.isFinite(annCount)) return annCount;

            const flatAnn = r0?.items?.[0]?.sections
                ?.flatMap((s) => (Array.isArray(s.annotations) ? s.annotations : []))
                .length;
            if (Number.isFinite(flatAnn)) return flatAnn;
        } catch (e) {
        }
    }

    if (Array.isArray(it.sources)) return it.sources.length;

    return 0;
};

const Citations = ({ data }) => {

    return (
        <div className="">
            <div className="card h-100">
                <div className="card-body p-24">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-start mb-12">
                        <div>
                            <h6 className="mb-2" style={{ color: "#000", fontWeight: 700 }}>
                                AI Performance Score
                            </h6>
                            <p className="mb-0 text-secondary small">
                                Performance score for your brands across different AI models
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                        <table className="table table-sm mb-0 ym-table bordered-table">
                            <thead className="table-light">
                                <tr className="text-nowrap">
                                    <th>AI Model</th>
                                    <th className="text-center">Total Prompts</th>
                                    <th className="text-center">Avg. Rank</th>
                                    <th className="text-center">Total Mentions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {llmTypes.map((slug) => {
                                    const arr = findLLMArray(data, slug) || [];
                                    const totalKeywords = Array.isArray(arr) ? arr.length : 0;
                                    const totalCitations = Array.isArray(arr)
                                        ? arr.reduce((sum, it) => sum + countCitationsInItem(it), 0)
                                        : 0;

                                    // compute average rank (exclude nulls)
                                    const ranks = Array.isArray(arr)
                                        ? arr.map((it) => it.rank).filter((r) => r !== null && r !== undefined)
                                        : [];

                                    const avgRank =
                                        ranks.length > 0
                                            ? (ranks.reduce((sum, r) => sum + r, 0) / totalKeywords).toFixed(2)
                                            : "0";

                                    const displayName = modelMap[slug] || slug;

                                    return (
                                        <tr key={slug} className="text-nowrap">
                                            <td>{displayName}</td>
                                            <td className="text-center">{totalKeywords}</td>
                                            <td className="text-center">{avgRank}</td>
                                            <td className="text-center">{totalCitations}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Citations;
