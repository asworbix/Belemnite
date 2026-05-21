type CrawlerEntry = {
    name: string;
    ua: string;
    vendor: string;
};
export type CrawlerMatch = {
    matched: false;
} | {
    matched: true;
    name: string;
};
export declare function matchCrawler(ua: string, customCrawlers?: string[]): CrawlerMatch;
export declare function listCrawlers(): CrawlerEntry[];
export {};
