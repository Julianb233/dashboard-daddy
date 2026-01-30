# New Features: Sharing & Multi-Machine Support

This document describes the newly implemented features for Dashboard Daddy: **Sharable Dashboard Links** and **Multi-Machine Support**.

## 🔗 Sharable Dashboard Links

### Overview
Create and manage secure, configurable share links to provide external access to your dashboard data.

### Features

#### 1. **Link Creation**
- **Access**: Header "Share" button or Settings > Sharing tab
- **Configuration Options**:
  - Share name (for organization)
  - Public/Private visibility
  - Permission levels (stats, commands, errors, full)
  - Optional expiration date
  - Embedding allowance
  - Authentication requirement

#### 2. **Permission Levels**
- **Stats**: Basic metrics (agent counts, task statistics)
- **Commands**: Agent status and actions
- **Errors**: Error logs and warnings
- **Full**: Complete dashboard access

#### 3. **Link Management**
- View all created links in Settings > Sharing
- Toggle active/inactive status
- Track access analytics (view count, last accessed)
- Copy share URLs and embed codes
- Delete unused links

#### 4. **Security Features**
- Token-based authentication
- Configurable expiration dates
- Optional password protection
- Access tracking and analytics
- IP-based access logs

### Usage

1. **Create Share Link**:
   ```
   Header > Share Button > Configure permissions > Create
   ```

2. **Access Shared Dashboard**:
   ```
   https://your-domain.com/share/{token}
   ```

3. **Embed Dashboard**:
   ```html
   <iframe src="https://your-domain.com/share/{token}" 
           width="100%" height="600" frameborder="0">
   </iframe>
   ```

### API Endpoints

- `GET /api/share` - List all share links
- `POST /api/share` - Create new share link
- `GET /api/share/{id}` - Get specific share link
- `PATCH /api/share/{id}` - Update share link
- `DELETE /api/share/{id}` - Delete share link
- `GET /api/share/{token}/data` - Get filtered dashboard data

## 🖥️ Multi-Machine Support

### Overview
Discover, monitor, and manage multiple Dashboard Daddy nodes from a centralized interface.

### Features

#### 1. **Node Discovery**
- **Auto-discovery**: Automatically finds nodes on the network
- **Manual addition**: Add nodes by IP/hostname
- **Health monitoring**: Continuous health checks
- **Status tracking**: Connection state monitoring

#### 2. **Node Information**
- **System metrics**: CPU, memory, disk usage
- **Network stats**: Latency, uptime
- **Capabilities**: Agent support, GPU availability
- **Platform details**: OS, architecture, version

#### 3. **Node Management**
- **Selection**: Switch between nodes via header dropdown
- **Actions**: Connect/disconnect/restart nodes
- **Health status**: Visual health indicators
- **Real-time updates**: Auto-refresh every 30 seconds

#### 4. **Health Status Indicators**
- 🟢 **Healthy**: Node operating normally
- 🟡 **Warning**: Performance issues detected
- 🔴 **Error**: Critical issues requiring attention
- ⚪ **Offline**: Node disconnected or unreachable

### Usage

1. **Select Node**:
   ```
   Header > Node Selector > Choose target node
   ```

2. **Monitor Health**:
   ```
   Settings > Nodes > View detailed metrics
   ```

3. **Manage Nodes**:
   ```
   Settings > Nodes > Configure discovery settings
   ```

### Configuration

#### Auto-Discovery Settings
- **Discovery interval**: How often to scan for new nodes (default: 30s)
- **Health check interval**: Frequency of health checks (default: 10s)
- **Timeout**: Connection timeout duration
- **Allowed networks**: CIDR blocks for node discovery

#### Node Capabilities
- **Max agents**: Maximum concurrent agents per node
- **Agent types**: Supported agent implementations
- **GPU support**: Hardware acceleration availability
- **Container support**: Docker/Kubernetes compatibility

### API Endpoints

- `GET /api/nodes` - List all discovered nodes
- `POST /api/nodes` - Execute node action (connect/disconnect/restart)

## 🎨 Dark Theme Integration

Both features are fully integrated with the existing dark theme:

- **Consistent styling**: Matches existing gray-900/800/700 color scheme
- **Hover effects**: Smooth transitions and hover states
- **Focus indicators**: Accessible focus styles
- **Icon consistency**: Lucide React icons throughout
- **Typography**: Consistent font weights and sizes

## 📱 Responsive Design

All components are responsive and work across device sizes:

- **Mobile**: Simplified layouts, touch-friendly controls
- **Tablet**: Optimized grid layouts
- **Desktop**: Full feature set with rich interactions

## 🔧 Implementation Details

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React
- **State**: React hooks with custom state management
- **TypeScript**: Full type safety throughout

### File Structure
```
src/
├── components/
│   ├── sharing/
│   │   ├── ShareLinkModal.tsx
│   │   └── index.ts
│   └── nodes/
│       ├── NodeSelector.tsx
│       ├── NodeHealthBadge.tsx
│       └── index.ts
├── hooks/
│   ├── useSharing.ts
│   └── useNodes.ts
├── types/
│   ├── sharing.ts
│   └── nodes.ts
├── app/
│   ├── api/
│   │   ├── share/
│   │   └── nodes/
│   └── share/
│       └── [token]/
└── layout updates
```

### State Management
- **useSharing**: Manages share links, creation, deletion, analytics
- **useNodes**: Handles node discovery, selection, health monitoring
- **Real-time updates**: Automatic refresh and state synchronization

## 🚀 Future Enhancements

### Sharing
- [ ] Advanced analytics dashboard
- [ ] Webhook notifications for access events
- [ ] Custom branding for shared dashboards
- [ ] Time-based access restrictions
- [ ] Role-based permission templates

### Multi-Machine
- [ ] Load balancing across nodes
- [ ] Automatic failover mechanisms
- [ ] Node clustering and groups
- [ ] Performance benchmarking
- [ ] Resource allocation policies

## 📋 Testing

To test the new features:

1. **Start the development server**:
   ```bash
   cd /home/dev/dashboard-daddy/frontend
   npm run dev
   ```

2. **Test sharing**:
   - Click "Share" in header
   - Create a new share link
   - Access the generated URL
   - Verify permission filtering

3. **Test multi-machine**:
   - View node selector in header
   - Switch between mock nodes
   - Check health status indicators
   - Explore node settings

## 🐛 Known Issues

- Mock data used for development (replace with real APIs)
- Node discovery limited to mock nodes
- Share link persistence requires database integration

## 📝 Notes

- All components follow existing code patterns
- TypeScript types are comprehensive and well-documented
- Error handling included throughout
- Accessibility features implemented (focus, ARIA labels)
- Performance optimized with proper memoization