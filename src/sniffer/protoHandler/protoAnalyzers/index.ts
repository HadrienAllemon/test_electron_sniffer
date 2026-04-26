import { priceAnalyzer }          from "./priceAnalyzer";
import { jgdAnalyzer }           from "./jgdAnalyzer";
import { jhrAnalyzer }           from "./jhrAnalyzer";
import { jcvAnalyzer }           from "./jcvAnalyzer";
import { jerAnalyzer }           from "./jerAnalyzer";
import { jduAnalyzer }           from "./jduAnalyzer";
import { offlineAuctionAnalyzer } from "./offlineAuctionAnalyzer";
import { priceUpdateAnalyzer } from "./priceUpdateAnalyzer";

// Order matters: more specific detectors first to avoid false positives.
// jdu is last because it matches any single-number-field message.
export const analyzers = [
    priceAnalyzer,
    priceUpdateAnalyzer,
    offlineAuctionAnalyzer,
    jgdAnalyzer,
    jhrAnalyzer,
    jcvAnalyzer,
    jerAnalyzer,
    jduAnalyzer,
];
