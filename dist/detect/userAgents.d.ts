type CrawlerEntry = {
    name: string;
    ua: string;
    vendor: string;
};
type TagEntry = {
    tag: string;
    vendor: string;
};
export type CrawlerMatch = {
    matched: false;
} | {
    matched: true;
    name: string;
};
export declare function matchCrawler(ua: string, customCrawlers?: string[], customTags?: string[]): CrawlerMatch;
export declare function listCrawlers(): CrawlerEntry[];
export declare function listTags(): TagEntry[];
export {};
