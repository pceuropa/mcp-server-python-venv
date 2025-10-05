export interface VenvInfo {
  found: boolean;
  path: string;
  type: string;
}

export interface PythonVersion {
  version: string;
  path: string;
}

export interface Package {
  name: string;
  version: string;
}

export interface PackageList {
  packages: Package[];
}

export interface PackageCheck {
  installed: boolean;
  version?: string;
  matches?: boolean;
}

export interface RequirementsComparison {
  missing: Array<{ name: string; required_version: string }>;
  extra: Array<{ name: string; installed_version: string }>;
  mismatched: Array<{ name: string; required: string; installed: string }>;
  install_command: string;
}

export interface OutdatedPackage {
  name: string;
  current_version: string;
  latest_version: string;
  upgrade_type: 'major' | 'minor' | 'patch';
}

export interface OutdatedCheck {
  outdated: OutdatedPackage[];
  upgrade_command: string;
}

export interface VenvSetup {
  has_venv: boolean;
  python_available: boolean;
  suggested_commands: string[];
  tool_recommendations: Array<{ name: string; reason: string }>;
}

export interface VenvSummary {
  python_version: string;
  venv_path: string;
  venv_type: string;
  package_count: number;
  total_size: string;
  requirements_status: string;
  outdated_count: number;
}

export interface EnvironmentManager {
  manager: 'venv' | 'poetry' | 'pipenv' | 'conda' | 'uv';
  config_files: string[];
  env_path: string;
}

export interface SecurityVulnerability {
  package: string;
  version: string;
  vulnerability: string;
  severity: string;
  fix: string;
}

export interface SecurityCheck {
  vulnerabilities: SecurityVulnerability[];
  scan_date: string;
}

export interface LicenseInfo {
  name: string;
  version: string;
  license: string;
  category: string;
}

export interface LicenseCheck {
  packages: LicenseInfo[];
  warnings: string[];
}

export interface PackageSearchResult {
  name: string;
  version: string;
  description: string;
  author: string;
  downloads: number;
}

export interface PackageSearch {
  results: PackageSearchResult[];
  total: number;
}

export interface EnvironmentExport {
  format: 'requirements' | 'pyproject' | 'conda';
  content: string;
}

