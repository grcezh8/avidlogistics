# Configuration Management Guide

This document explains how to prevent port configuration mismatches and maintain consistent API connectivity between the frontend and backend.

## Overview

The original issue was caused by:
- Frontend configured to connect to port 5000
- Backend configured to run on port 5166
- Hardcoded port overrides in Program.cs

## Current Solution

### 1. Environment-Based Configuration

**Frontend (.env files):**
- `frontend/.env` - Default configuration
- `frontend/.env.development` - Development-specific overrides
- `frontend/.env.production` - Production-specific overrides

**Backend (launchSettings.json):**
- `backend/AVIDLogistics.WebApi/Properties/launchSettings.json` - Defines available launch profiles

### 2. Configuration Files

#### Frontend Environment Variables
```bash
# frontend/.env
REACT_APP_API_BASE_URL=http://localhost:5166/api
REACT_APP_API_TIMEOUT=10000
```

#### Backend Launch Settings
```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5166"
    }
  }
}
```

### 3. API Client Configuration

The frontend API client (`frontend/src/services/apiClient.js`) now:
- Uses environment variables with fallback defaults
- Includes request/response interceptors for debugging
- Provides clear error messages for connection issues

## Best Practices

### 1. Single Source of Truth
- Keep port configuration in `launchSettings.json` for backend
- Reference this port in frontend `.env` files
- Never hardcode ports in application code

### 2. Environment-Specific Configuration
- Use `.env.development` for local development
- Use `.env.production` for production deployment
- Keep sensitive data out of version control

### 3. Validation and Error Handling
- API client includes connection error detection
- Clear error messages when backend is unreachable
- Request logging for debugging

## Development Workflow

### Starting the Application
1. **Backend**: `cd backend/AVIDLogistics.WebApi && dotnet run --launch-profile http`
2. **Frontend**: `cd frontend && npm start`

### Changing Ports
1. Update `backend/AVIDLogistics.WebApi/Properties/launchSettings.json`
2. Update `frontend/.env` with new API URL
3. Restart both applications

### Troubleshooting
- Check console logs for API connection errors
- Verify backend is running: `http://localhost:5166/health`
- Ensure no hardcoded ports in code

## Configuration Validation

### Backend Port Check
```bash
# Check if backend is running on correct port
curl http://localhost:5166/health
```

### Frontend Environment Check
```javascript
// In browser console
console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
```

## Common Issues and Solutions

### Issue: "ECONNREFUSED" Error
**Cause**: Backend not running or wrong port
**Solution**: 
1. Start backend: `dotnet run --launch-profile http`
2. Verify port in launchSettings.json matches .env

### Issue: 404 Not Found
**Cause**: Incorrect API base URL
**Solution**: Check REACT_APP_API_BASE_URL includes `/api` suffix

### Issue: CORS Errors
**Cause**: Frontend URL not in backend CORS policy
**Solution**: Update CORS policy in Program.cs

## Deployment Considerations

### Production Environment
- Use environment-specific .env files
- Configure reverse proxy (nginx/IIS) for proper routing
- Use HTTPS in production
- Set appropriate timeouts and retry policies

### Docker Deployment
```dockerfile
# Example environment variable injection
ENV REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
```

## Monitoring and Maintenance

### Health Checks
- Backend: `/health` endpoint
- Frontend: API client interceptors log connection status

### Regular Audits
- Review .env files for consistency
- Validate all environments use correct URLs
- Test API connectivity in all deployment environments

## Future Improvements

1. **Configuration Service**: Centralized configuration management
2. **Service Discovery**: Automatic backend URL detection
3. **Health Dashboard**: Real-time connectivity monitoring
4. **Automated Testing**: Integration tests for API connectivity
