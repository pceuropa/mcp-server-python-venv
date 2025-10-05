# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Add to Cursor Settings

Copy this configuration to your `.cursor/settings.json`:

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

### Step 2: Restart Cursor

Close and reopen Cursor IDE to load the new MCP server.

### Step 3: Test the Connection

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "MCP" and select "MCP: Show Servers"
3. Verify "python-venv" server is connected

## 🎯 Try These Tools

### Basic Tools

**Find Virtual Environment**
```
Use tool: find_venv
```

**List Installed Packages**
```
Use tool: list_packages
```

**Get Python Version**
```
Use tool: get_python_version
```

### Advanced Tools

**Check Package Version**
```
Use tool: check_package
Arguments: {"packageName": "requests", "version": ">=2.31.0"}
```

**Compare with Requirements**
```
Use tool: compare_requirements
```

**Get Environment Summary**
```
Use tool: get_venv_summary
```

**Search PyPI Packages**
```
Use tool: search_package
Arguments: {"query": "http client", "limit": 5}
```

## 🔧 Configuration Examples

### For Poetry Projects

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "PROJECT_PATH": "${workspaceFolder}"
        }
      }
    }
  }
}
```

### For Pipenv Projects

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "PROJECT_PATH": "${workspaceFolder}"
        }
      }
    }
  }
}
```

### For Conda Projects

```json
{
  "mcp": {
    "servers": {
      "python-venv": {
        "command": "npx",
        "args": ["@pceuropa/mcp-server-python-venv"],
        "env": {
          "CONDA_ENV": "my-conda-env"
        }
      }
    }
  }
}
```

## 🐛 Troubleshooting

### Server Not Connecting

1. **Check Node.js version**: Requires Node.js 18+
2. **Verify npx access**: Try `npx @pceuropa/mcp-server-python-venv`
3. **Check Cursor logs**: View → Output → MCP

### Tools Not Working

1. **Activate virtual environment**: Ensure Python venv is active
2. **Check Python path**: Verify Python and pip are accessible
3. **Restart Cursor**: Sometimes a restart helps

### Performance Issues

1. **Use specific tools**: Instead of full package lists, use targeted tools
2. **Check environment size**: Large environments may be slow
3. **Enable caching**: The server caches results automatically

## 📚 Learn More

- **Full Documentation**: [README.md](README.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **User Guide**: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## 🆘 Need Help?

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share tips
- **Documentation**: Comprehensive guides and examples

---

**Happy coding with MCP Python Venv Server! 🐍✨**
