import asnsData from '../data/asns.json';
// v0.1: Vercel Edge Middleware does not expose ASN data directly.
// This module exists for v0.2+. The detector is intentionally a no-op
// and is wired through the pipeline so future ASN sources slot in here.
export function detectByAsn(_ip) {
    return { matched: false };
}
export function listKnownAsns() {
    return (asnsData.asns ?? []);
}
