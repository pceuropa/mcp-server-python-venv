import { executePipCommand } from '../utils/pip-wrapper.js';
import { findVenv } from '../utils/venv-finder.js';

export interface DependencyNode {
    name: string;
    version: string;
    dependencies: DependencyNode[];
}

export interface DependencyTree {
    root: DependencyNode | null;
    circular_dependencies: string[];
    unused_dependencies: string[];
}

export function getDependencyTree(packageName?: string, depth = 3): DependencyTree {
    const venvInfo = findVenv();

    if (!venvInfo.found) {
        throw new Error('No virtual environment found');
    }

    try {
        const installedPackages = getInstalledPackages(venvInfo);
        const dependencyMap = buildDependencyMap(venvInfo, installedPackages);
        const circularDeps = findCircularDependencies(dependencyMap);
        const unusedDeps = findUnusedDependencies(dependencyMap, installedPackages);

        let root: DependencyNode | null = null;

        if (packageName) {
            root = buildTreeForPackage(packageName, dependencyMap, depth);
        } else {
            root = buildFullTree(dependencyMap, depth);
        }

        return {
            root,
            circular_dependencies: circularDeps,
            unused_dependencies: unusedDeps
        };
    } catch (error) {
        throw new Error(`Failed to get dependency tree: ${error}`);
    }
}

function getInstalledPackages(venvInfo: any): Array<{ name: string; version: string }> {
    try {
        const output = executePipCommand(venvInfo, ['list', '--format=json']);
        return JSON.parse(output);
    } catch (error) {
        throw new Error(`Failed to get installed packages: ${error}`);
    }
}

function buildDependencyMap(venvInfo: any, packages: Array<{ name: string; version: string }>): Map<string, string[]> {
    const dependencyMap = new Map<string, string[]>();

    for (const pkg of packages) {
        try {
            const output = executePipCommand(venvInfo, ['show', pkg.name]);
            const dependencies = parseDependenciesFromShow(output);
            dependencyMap.set(pkg.name.toLowerCase(), dependencies);
        } catch (error) {
            dependencyMap.set(pkg.name.toLowerCase(), []);
        }
    }

    return dependencyMap;
}

function parseDependenciesFromShow(showOutput: string): string[] {
    const lines = showOutput.split('\n');
    const dependencies: string[] = [];
    let inRequires = false;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('Requires:')) {
            inRequires = true;
            const deps = trimmed.substring(9).trim();
            if (deps && deps !== '') {
                dependencies.push(...deps.split(',').map(dep => dep.trim().toLowerCase()));
            }
            continue;
        }

        if (inRequires && trimmed.startsWith('Required-by:')) {
            break;
        }

        if (inRequires && trimmed && !trimmed.includes(':')) {
            dependencies.push(...trimmed.split(',').map(dep => dep.trim().toLowerCase()));
        }
    }

    return dependencies;
}

function findCircularDependencies(dependencyMap: Map<string, string[]>): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const packageName of dependencyMap.keys()) {
        if (!visited.has(packageName)) {
            const cycle = findCycle(packageName, dependencyMap, visited, recursionStack);
            if (cycle.length > 0) {
                circular.push(...cycle);
            }
        }
    }

    return [...new Set(circular)];
}

function findCycle(
    packageName: string,
    dependencyMap: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
): string[] {
    visited.add(packageName);
    recursionStack.add(packageName);

    const dependencies = dependencyMap.get(packageName) || [];

    for (const dep of dependencies) {
        if (!visited.has(dep)) {
            const cycle = findCycle(dep, dependencyMap, visited, recursionStack);
            if (cycle.length > 0) {
                return cycle;
            }
        } else if (recursionStack.has(dep)) {
            return [packageName, dep];
        }
    }

    recursionStack.delete(packageName);
    return [];
}

function findUnusedDependencies(
    dependencyMap: Map<string, string[]>,
    installedPackages: Array<{ name: string; version: string }>
): string[] {
    const used = new Set<string>();

    for (const deps of dependencyMap.values()) {
        for (const dep of deps) {
            used.add(dep);
        }
    }

    return installedPackages
        .map(pkg => pkg.name.toLowerCase())
        .filter(name => !used.has(name) && !isStandardLibrary(name));
}

function isStandardLibrary(packageName: string): boolean {
    const stdlibPackages = [
        'os', 'sys', 'json', 'datetime', 'collections', 'itertools',
        'functools', 'operator', 'math', 'random', 'string', 're',
        'urllib', 'http', 'email', 'html', 'xml', 'sqlite3', 'csv',
        'configparser', 'logging', 'unittest', 'doctest', 'pdb',
        'profile', 'timeit', 'trace', 'gc', 'inspect', 'ast',
        'dis', 'pickle', 'copy', 'pprint', 'reprlib', 'enum',
        'numbers', 'decimal', 'fractions', 'statistics', 'pathlib',
        'fileinput', 'tempfile', 'glob', 'fnmatch', 'linecache',
        'shutil', 'macpath', 'platform', 'errno', 'io', 'time',
        'argparse', 'getopt', 'logging', 'getpass', 'curses',
        'platform', 'ctypes', 'struct', 'codecs', 'unicodedata',
        'stringprep', 'readline', 'rlcompleter'
    ];

    return stdlibPackages.includes(packageName);
}

function buildTreeForPackage(
    packageName: string,
    dependencyMap: Map<string, string[]>,
    maxDepth: number,
    currentDepth = 0,
    visited = new Set<string>()
): DependencyNode | null {
    if (currentDepth >= maxDepth || visited.has(packageName.toLowerCase())) {
        return null;
    }

    visited.add(packageName.toLowerCase());

    const dependencies = dependencyMap.get(packageName.toLowerCase()) || [];
    const childNodes: DependencyNode[] = [];

    for (const dep of dependencies) {
        const childNode = buildTreeForPackage(dep, dependencyMap, maxDepth, currentDepth + 1, new Set(visited));
        if (childNode) {
            childNodes.push(childNode);
        }
    }

    return {
        name: packageName,
        version: 'unknown',
        dependencies: childNodes
    };
}

function buildFullTree(dependencyMap: Map<string, string[]>, maxDepth: number): DependencyNode | null {
    const rootPackages = findRootPackages(dependencyMap);

    if (rootPackages.length === 0) {
        return null;
    }

    if (rootPackages.length === 1) {
        const rootPackage = rootPackages[0];
        if (rootPackage) {
            return buildTreeForPackage(rootPackage, dependencyMap, maxDepth);
        }
    }

    return {
        name: 'root',
        version: '1.0.0',
        dependencies: rootPackages.map(pkg =>
            buildTreeForPackage(pkg, dependencyMap, maxDepth) || { name: pkg, version: 'unknown', dependencies: [] }
        )
    };
}

function findRootPackages(dependencyMap: Map<string, string[]>): string[] {
    const allPackages = new Set(dependencyMap.keys());
    const dependentPackages = new Set<string>();

    for (const deps of dependencyMap.values()) {
        for (const dep of deps) {
            dependentPackages.add(dep);
        }
    }

    return Array.from(allPackages).filter(pkg => !dependentPackages.has(pkg));
}
