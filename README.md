# MCP Python Venv Server

A comprehensive Python virtual environment inspector for Cursor IDE using the Model Context Protocol (MCP).

## Features

- 🔍 **Virtual Environment Detection** - Automatically find and analyze Python virtual environments
- 📦 **Package Management** - List, check, and compare installed packages
- 📋 **Requirements Analysis** - Compare installed packages with requirements files
- 🐍 **Python Version Detection** - Get Python version information from virtual environments
- 🔧 **Multi-Format Support** - Support for requirements.txt, pyproject.toml, Pipfile, and more

## Installation

### Global Usage (Recommended)

No installation needed - use directly with npx:

```bash
npx @pceuropa/mcp-server-python-venv
```

### Global Installation (Optional)

```bash
npm install -g @pceuropa/mcp-server-python-venv
```

## Usage

### Cursor Configuration

#### Basic Configuration

Add this to your Cursor settings (`.cursor/settings.json`):

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "DEBUG": "false"
        }
      }
    }
  }
}
```

#### Advanced Configuration

For more control over the environment:

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "DEBUG": "false",
          "PROJECT_PATH": "${workspaceFolder}",
          "PYTHON_PATH": "python3",
          "PIP_PATH": "pip3"
        }
      }
    }
  }
}
```

#### Multi-Project Configuration

For projects with multiple Python environments:

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "DEBUG": "false"
        }
      }
    }
  },
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "python.analysis.autoImportCompletions": true,
  "python.analysis.typeCheckingMode": "basic"
}
```

### Available Tools

#### `ping`
Test server connectivity.

#### `find_venv`
Find virtual environment in the current project.
- **Input**: `projectPath` (optional) - Project path to search
- **Output**: Virtual environment information

#### `get_python_version`
Get Python version from the virtual environment.
- **Output**: Python version and path

#### `list_packages`
List all installed packages in the virtual environment.
- **Input**: `sortBy` (optional) - Sort by "name" or "version"
- **Output**: List of installed packages

#### `check_package`
Check if a specific package is installed and matches version requirements.
- **Input**: 
  - `packageName` (required) - Name of the package
  - `version` (optional) - Version requirement (e.g., ">=1.0.0", "==2.1.0")
- **Output**: Package installation status and version info

#### `compare_requirements`
Compare installed packages with requirements files.
- **Input**: `file` (optional) - Specific requirements file to check
- **Output**: Missing, extra, and mismatched packages with install command

#### `check_outdated`
Check for outdated packages in the virtual environment.
- **Output**: List of outdated packages with upgrade commands

#### `suggest_venv_setup`
Get suggestions for setting up a virtual environment.
- **Output**: Setup commands and tool recommendations

#### `get_venv_summary`
Get a comprehensive summary of the virtual environment.
- **Output**: Python version, package count, size, requirements status, and outdated count

#### `get_dependency_tree`
Get dependency tree visualization for packages.
- **Input**: 
  - `package` (optional) - Specific package to analyze
  - `depth` (optional) - Maximum depth of dependency tree (default: 3)
- **Output**: Dependency tree with circular dependencies and unused packages

#### `detect_environment_manager`
Detect which Python environment manager is being used.
- **Input**: `projectPath` (optional) - Project path to analyze
- **Output**: Detected manager (venv, poetry, pipenv, conda, uv) with config files

#### `get_poetry_info`
Get Poetry project information and dependencies.
- **Input**: `projectPath` (optional) - Project path
- **Output**: Poetry project details, dependencies, and environment info

#### `get_pipenv_info`
Get Pipenv project information and dependencies.
- **Input**: `projectPath` (optional) - Project path
- **Output**: Pipenv project details, dependencies, and environment info

#### `get_conda_info`
Get Conda environment information and packages.
- **Input**: `projectPath` (optional) - Project path
- **Output**: Conda environment details, packages, and configuration

#### `check_security`
Check for security vulnerabilities in installed packages.
- **Output**: List of vulnerabilities with severity and fix recommendations

#### `check_licenses`
Check licenses of installed packages and identify potential issues.
- **Output**: License information with warnings for problematic licenses

#### `search_package`
Search for packages on PyPI.
- **Input**: 
  - `query` (required) - Search query
  - `limit` (optional) - Maximum results (default: 10)
- **Output**: Search results with package information

#### `export_environment`
Export current environment to various formats.
- **Input**: `format` (required) - Export format: "requirements", "pyproject", or "conda"
- **Output**: Formatted environment specification

## Development

## Testing the Installation

### Test with npx

```bash
# Test the server directly
npx @pceuropa/mcp-server-python-venv

# Test with a specific command
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | npx @pceuropa/mcp-server-python-venv
```

### Test in Cursor

1. Add the configuration to your `.cursor/settings.json`
2. Restart Cursor IDE
3. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
4. Type "MCP" and select "MCP: Show Servers"
5. Verify that "python-venv" server is connected

### Prerequisites

- Node.js 18+
- Python 3.8+
- npm or yarn

### Setup

```bash
git clone https://github.com/pceuropa/mcp-server-python-venv.git
cd mcp-server-python-venv
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run format
```

## Supported Virtual Environment Types

- **venv** - Standard Python venv
- **virtualenv** - Virtualenv package
- **poetry** - Poetry environments
- **pipenv** - Pipenv environments
- **conda** - Conda environments
- **uv** - UV package manager

## Supported Requirements Formats

- `requirements.txt`
- `requirements-dev.txt`
- `requirements-test.txt`
- `pyproject.toml` (project dependencies)
- `pyproject.toml` (poetry dependencies)
- `Pipfile`
- `setup.py` (basic support)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

## Support

- **Issues**: [GitHub Issues](https://github.com/pceuropa/mcp-server-python-venv/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pceuropa/mcp-server-python-venv/discussions)
- **Email**: info@pceuropa.net

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

