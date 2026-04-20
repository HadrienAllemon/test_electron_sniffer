import { saleAnalyzer }          from "./saleAnalyzer";
import { jgdAnalyzer }           from "./jgdAnalyzer";
import { jhrAnalyzer }           from "./jhrAnalyzer";
import { jcvAnalyzer }           from "./jcvAnalyzer";
import { jerAnalyzer }           from "./jerAnalyzer";
import { jduAnalyzer }           from "./jduAnalyzer";
import { offlineAuctionAnalyzer } from "./offlineAuctionAnalyzer";

// Order matters: more specific detectors first to avoid false positives.
// jdu is last because it matches any single-number-field message.
export const analyzers = [
    saleAnalyzer,
    jgdAnalyzer,
    jhrAnalyzer,
    jcvAnalyzer,
    jerAnalyzer,
    offlineAuctionAnalyzer,
    jduAnalyzer,
];
