# Development Scripts Guide

This directory contains PowerShell scripts to help manage the AVID Logistics development environment.

## Available Scripts

### 🛑 stop-all-processes.ps1
**Purpose**: Stop all development processes and free up ports
**Usage**: `.\scripts\stop-all-processes.ps1`

**What it does**:
- Stops all .NET processes (dotnet, AVIDLogistics.WebApi)
- Stops all Node.js processes (node, npm, yarn)
- Stops development servers (webpack, react-scripts)
- Frees common development ports (3000, 3001, 5000, 5001, 5166, etc.)
- Stops IIS Express processes
- Cleans temporary build files
- Provides final port status report

**Use when**:
- Switching between projects
- Ports are stuck/occupied
- Need a clean development environment
- Before restarting development servers

### 🚀 setup-dev-environment.ps1
**Purpose**: Configure consistent port settings between frontend and backend
**Usage**: `.\scripts\setup-dev-environment.ps1 [-BackendPort 5166] [-FrontendPort 3000]`

**What it does**:
- Updates backend launch settings
- Updates frontend .env files
- Validates configuration consistency
- Provides next steps for starting the application

**Use when**:
- Setting up development environment for first time
- Changing port configurations
- After cloning the repository
- When port mismatches occur

### 🔍 validate-configuration.ps1
**Purpose**: Check configuration consistency and connectivity
**Usage**: `.\scripts\validate-configuration.ps1`

**What it does**:
- Validates backend launch settings
- Checks frontend .env configuration
- Verifies port consistency
- Tests API connectivity
- Provides troubleshooting suggestions

**Use when**:
- Debugging connection issues
- Verifying configuration after changes
- Before starting development
- Troubleshooting 400/connection errors

## Quick Commands

### Complete Environment Reset
```powershell
# Stop everything and clean up
.\scripts\stop-all-processes.ps1

# Reconfigure environment
.\scripts\setup-dev-environment.ps1

# Validate everything is correct
.\scripts\validate-configuration.ps1
```

### Start Development Environment
```powershell
# Terminal 1: Start Backend
cd backend/AVIDLogistics.WebApi
dotnet run --launch-profile http

# Terminal 2: Start Frontend
cd frontend
npm start
```

### Troubleshooting Workflow
```powershell
# 1. Check current configuration
.\scripts\validate-configuration.ps1

# 2. If issues found, stop all processes
.\scripts\stop-all-processes.ps1

# 3. Reconfigure environment
.\scripts\setup-dev-environment.ps1

# 4. Validate again
.\scripts\validate-configuration.ps1

# 5. Start fresh
# Backend: cd backend/AVIDLogistics.WebApi && dotnet run --launch-profile http
# Frontend: cd frontend && npm start
```

## Common Port Issues

### Port Already in Use
```powershell
.\scripts\stop-all-processes.ps1
```

### Frontend Can't Connect to Backend
```powershell
.\scripts\validate-configuration.ps1
# Check for port mismatches, then:
.\scripts\setup-dev-environment.ps1
```

### Multiple Instances Running
```powershell
.\scripts\stop-all-processes.ps1
# Wait a few seconds, then start fresh
```

## Script Parameters

### setup-dev-environment.ps1
- `-BackendPort`: Port for backend API (default: 5166)
- `-FrontendPort`: Port for frontend dev server (default: 3000)

Example:
```powershell
.\scripts\setup-dev-environment.ps1 -BackendPort 5167 -FrontendPort 3001
```

## Files Modified by Scripts

### setup-dev-environment.ps1 modifies:
- `backend/AVIDLogistics.WebApi/Properties/launchSettings.json`
- `frontend/.env`
- `frontend/.env.development`

### stop-all-processes.ps1 cleans:
- `frontend/node_modules/.cache`
- `frontend/.next`
- `frontend/build`
- `frontend/dist`
- `backend/AVIDLogistics.WebApi/bin/Debug`
- `backend/AVIDLogistics.WebApi/obj`

## Best Practices

1. **Always validate** after making configuration changes
2. **Stop all processes** before switching projects or major changes
3. **Use setup script** when onboarding new developers
4. **Check validation script** when debugging connection issues
5. **Keep ports consistent** between frontend and backend

## Troubleshooting

### Script Won't Run
```powershell
# Enable script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Ports Still Occupied After Script
- Some processes may require administrator privileges to stop
- Restart your computer if ports remain stuck
- Check for antivirus software blocking port access

### Configuration Not Taking Effect
- Restart VS Code after running setup script
- Clear browser cache if frontend changes don't appear
- Ensure no hardcoded URLs in application code

## Related Documentation

- [Configuration Management Guide](../docs/CONFIGURATION_MANAGEMENT.md)
- [Backend Launch Settings](../backend/AVIDLogistics.WebApi/Properties/launchSettings.json)
- [Frontend Environment Variables](../frontend/.env)
