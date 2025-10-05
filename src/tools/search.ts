import type { PackageSearch, PackageSearchResult } from '../types/index.js';

export async function searchPackage(query: string, limit = 10): Promise<PackageSearch> {
    try {
        const results = await searchPyPI(query, limit);

        return {
            results,
            total: results.length
        };
    } catch (error) {
        throw new Error(`Failed to search packages: ${error}`);
    }
}

async function searchPyPI(query: string, limit: number): Promise<PackageSearchResult[]> {
    try {
        const response = await fetch(`https://pypi.org/search/?q=${encodeURIComponent(query)}&o=-created`);
        const html = await response.text();

        return parseSearchResults(html, limit);
    } catch (error) {
        console.warn('PyPI search failed, returning empty results:', error);
        return [];
    }
}

function parseSearchResults(html: string, limit: number): PackageSearchResult[] {
    const results: PackageSearchResult[] = [];

    try {
        const packageRegex = /<a[^>]*class="package-snippet"[^>]*href="\/project\/([^\/]+)\/"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*class="package-snippet__description"[^>]*>([^<]+)<\/p>/g;

        let match;
        let count = 0;

        while ((match = packageRegex.exec(html)) !== null && count < limit) {
            const name = match[1];
            const description = match[3]?.trim();

            if (name) {
                results.push({
                    name,
                    version: 'latest',
                    description: description || '',
                    author: 'Unknown',
                    downloads: 0
                });

                count++;
            }
        }
    } catch (error) {
        console.warn('Failed to parse search results:', error);
    }

    return results;
}

export function getPackageInfo(packageName: string): Promise<PackageSearchResult | null> {
    return new Promise((resolve) => {
        fetch(`https://pypi.org/pypi/${packageName}/json`)
            .then(response => response.json())
            .then(data => {
                resolve({
                    name: data.info.name,
                    version: data.info.version,
                    description: data.info.summary || '',
                    author: data.info.author || 'Unknown',
                    downloads: 0
                });
            })
            .catch(error => {
                console.warn(`Failed to get package info for ${packageName}:`, error);
                resolve(null);
            });
    });
}
