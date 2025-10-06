# Cross-Department Tagging & Shared Awareness System

## Overview
This system automatically identifies when documents affect multiple departments and ensures all relevant teams are notified and can access shared information.

## How It Works

### 1. Smart AI Detection
When documents are uploaded, the AI system now:
- **Analyzes content** to identify which departments are affected
- **Assigns relevance scores** (0.0 to 1.0) for each department
- **Generates appropriate tags** (e.g., "safety", "policy-change", "training-required")
- **Determines coordination requirements** between departments

**Examples:**
- **Design change document** → Tagged for Engineering (primary) + Design department
- **Safety bulletin** → Tagged for HR (primary) + Operations department  
- **Financial policy** → Tagged for Finance (primary) + relevant operational departments

### 2. Enhanced Document Types
Documents now support:
- `affectedDepartmentIds`: Additional departments that should be aware
- `crossDepartmentTags`: Specific tags indicating multi-department relevance
- `departmentRelevanceScore`: AI-calculated relevance scores per department

### 3. Cross-Department Notifications
The notification system automatically:
- **Notifies primary department** users as before
- **Alerts all affected departments** when documents are uploaded
- **Uses special messaging** for cross-department items
- **Prevents duplicate notifications** for users in multiple relevant departments

### 4. Shared Awareness Dashboard
A new dashboard component shows:
- **Cross-department documents** affecting multiple teams
- **Compliance items** requiring coordination
- **Priority filtering** (high/medium/low)
- **Department-specific views** with affected departments highlighted
- **Real-time statistics** on cross-department items

### 5. Enhanced API Endpoints
New endpoints support:
- `/api/compliance?action=cross-department&departmentIds=...` - Cross-department compliance
- `/api/compliance?action=shared-awareness&departmentIds=...` - Shared awareness items
- `/api/cross-department?action=shared-awareness&departmentIds=...` - Cross-department documents

## Key Features

### Smart Tagging Examples
1. **Design Change Document**
   - Primary: Engineering
   - Affected: Design
   - Tags: ["design-change", "coordination-required"]
   - Relevance: Engineering (1.0), Design (0.8)

2. **Safety Bulletin**
   - Primary: HR
   - Affected: Operations
   - Tags: ["safety", "policy-change", "training-required"]
   - Relevance: HR (1.0), Operations (0.9)

3. **Regulatory Update**
   - Primary: Legal
   - Affected: Operations, Engineering
   - Tags: ["regulatory", "compliance", "deadline"]
   - Relevance: Legal (1.0), Operations (0.7), Engineering (0.6)

### Dashboard Benefits
- **No department left blind** - All relevant teams see cross-department items
- **Priority-based organization** - High priority items surface first  
- **Visual department indicators** - Clear primary vs affected department distinction
- **Coordination flags** - Items requiring multi-department coordination highlighted
- **Real-time updates** - Live data from all relevant departments

### Compliance Integration
- **Cross-department compliance** items automatically notify all affected departments
- **Shared compliance requirements** with department-specific notes
- **Coordination tracking** for multi-department compliance tasks

## User Experience

### For Regular Users
- See relevant documents from other departments
- Get notified when documents affect their department
- Access shared awareness dashboard for cross-department visibility

### For Administrators  
- View all cross-department relationships
- Monitor coordination requirements
- Track cross-departmental compliance

### For Department Heads
- Oversight of all items affecting their department
- Understanding of interdepartmental dependencies
- Better coordination planning

## Technical Implementation

### AI Enhancement
The AI flow now includes cross-department analysis with:
- Multi-department relevance detection
- Automatic tagging based on content analysis
- Coordination requirement identification
- Relevance scoring for prioritization

### Database Schema Updates
Extended document and compliance types with:
- Multi-department relationship fields
- Cross-department metadata
- Relevance scoring storage
- Coordination flags

### Real-time Updates
- Live notification system for cross-department items
- Real-time dashboard updates
- Automatic user targeting based on department membership

This system ensures comprehensive visibility across departments while maintaining clean separation of primary responsibilities and cross-departmental awareness.