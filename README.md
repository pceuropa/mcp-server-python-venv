# MCP Python Venv Server

A comprehensive Python virtual environment inspector for Cursor IDE using the Model Context Protocol (MCP).

## Features

- 🔍 **Virtual Environment Detection** - Automatically find and analyze Python virtual environments
- 📦 **Package Management** - List, check, and compare installed packages
- 📋 **Requirements Analysis** - Compare installed packages with requirements files
- 🐍 **Python Version Detection** - Get Python version information from virtual environments
- 🔧 **Multi-Format Support** - Support for requirements.txt, pyproject.toml, Pipfile, and more
- ⚡ **UV Support** - Full support for uv-managed environments
- 🎯 **Flexible Configuration** - Choose between pip and uv via environment variables

## Supported Package Managers

✅ **Fully Supported:**
- **pip** - Python package manager
- **uv** - Fast Python package manager (recommended)
- **pipenv** - Python dependency management

❌ **Not Supported:**
- **PDM** - Python Dependency Manager (not yet implemented)
- **Poetry** - Limited support (detection only, no package operations)

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

#### Basic Configuration (Auto-detection)

Add this to your Cursor MCP configuration (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "python-venv": {
      "command": "npx",
      "args": ["@pceuropa/mcp-server-python-venv"],
      "transport": "stdio"
    }
  }
}
```

#### Advanced Configuration (Explicit Package Manager)

For better control, specify the package manager explicitly:

**For UV-managed projects:**
```json
{
  "mcpServers": {
    "python-venv": {
      "command": "npx",
      "args": ["@pceuropa/mcp-server-python-venv"],
      "transport": "stdio",
      "env": {
        "PYTHON_PATH": "/path/to/your/venv/bin/python",
        "VIRTUAL_ENV": "/path/to/your/venv",
        "UV_PATH": "/path/to/uv"
      }
    }
  }
}
```

**For pip-managed projects:**
```json
{
  "mcpServers": {
    "python-venv": {
      "command": "npx",
      "args": ["@pceuropa/mcp-server-python-venv"],
      "transport": "stdio",
      "env": {
        "PYTHON_PATH": "/path/to/your/venv/bin/python",
        "VIRTUAL_ENV": "/path/to/your/venv",
        "PIP_PATH": "/path/to/your/venv/bin/pip"
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
- **Note**: Limited support - detection only, package operations may not work

#### `get_pipenv_info`
Get Pipenv project information and dependencies.
- **Input**: `projectPath` (optional) - Project path
- **Output**: Pipenv project details, dependencies, and environment info

#### `get_conda_info`
Get Conda environment information and packages.
- **Input**: `projectPath` (optional) - Project path
- **Output**: Conda environment details, packages, and configuration
- **Note**: Basic support - may have limited functionality

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

## Environment Variables

The server supports the following environment variables for configuration:

| Variable | Description | Priority |
|----------|-------------|----------|
| `UV_PATH` | Path to uv executable (forces uv usage) | Highest |
| `PIP_PATH` | Path to pip executable (forces pip usage) | High |
| `PYTHON_PATH` | Path to Python executable | Medium |
| `VIRTUAL_ENV` | Path to virtual environment | Medium |

**Priority Order:**
1. `UV_PATH` - If set, uses `uv pip` for all operations
2. `PIP_PATH` - If set, uses specified pip executable
3. Auto-detection - Detects package manager from project files

## Limitations

### Not Supported Package Managers

- **PDM (Python Dependency Manager)** - Not yet implemented
- **Poetry** - Limited support (detection only, no package operations)

### Known Issues

- **Poetry environments** - Can detect but cannot list packages
- **PDM environments** - Not detected or supported
- **Mixed environments** - May not work correctly if using multiple package managers

## Troubleshooting

### Server Not Finding Virtual Environment

1. **Check environment variables:**
   ```bash
   echo $VIRTUAL_ENV
   echo $PYTHON_PATH
   ```

2. **Use explicit paths in MCP configuration:**
   ```json
   {
     "env": {
       "VIRTUAL_ENV": "/absolute/path/to/your/venv",
       "PYTHON_PATH": "/absolute/path/to/your/venv/bin/python"
     }
   }
   ```

3. **Restart Cursor IDE** after configuration changes

### Empty Package List

1. **For UV projects:** Ensure `UV_PATH` is set
2. **For pip projects:** Ensure `PIP_PATH` is set
3. **Check package manager detection:**
   ```bash
   npx @pceuropa/mcp-server-python-venv
   # Then call detect_environment_manager tool
   ```

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
- **uv** - UV package manager (recommended)
- **pipenv** - Pipenv environments
- **conda** - Conda environments
- **poetry** - Poetry environments (detection only)

## Supported Requirements Formats

- `requirements.txt`
- `requirements-dev.txt`
- `requirements-test.txt`
- `pyproject.toml` (project dependencies)
- `pyproject.toml` (poetry dependencies - limited support)
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

