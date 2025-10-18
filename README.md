# DeskAI

Your Professional Helpdesk with Adaptive Learning Mode

## Overview

DeskAI is an intelligent helpdesk system that learns from your usage patterns to provide adaptive suggestions and streamline your workflow. All learning happens locally on your device - your data never leaves your computer.

## Features

### 🧠 Learning Mode
- **Adaptive Suggestions**: Get personalized tool recommendations based on your usage history
- **Workflow Pattern Recognition**: Automatically detects and learns your common workflows
- **Time-based Recommendations**: Suggests tools based on your time-of-day usage patterns
- **Privacy-First**: All data stored locally using browser localStorage
- **User Control**: Enable/disable learning mode at any time

### 📊 Analytics & Insights
- Track tool usage statistics
- View learned workflow patterns
- Review time-based usage patterns
- Export/import learned data for backup

### 🔒 Privacy & Security
- **100% Local Storage**: No data sent to external servers
- **User Control**: Easy enable/disable toggle
- **Data Reset**: Clear all learned data with one click
- **Data Export**: Backup your learned preferences locally

## Installation

```bash
# Clone the repository
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI

# Install dependencies
npm install

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Basic Usage

1. **Enable Learning Mode**: Toggle the learning mode switch in the UI (enabled by default)
2. **Use Tools**: Click on tools to simulate usage
3. **View Suggestions**: See adaptive suggestions based on your patterns
4. **Review Statistics**: Check your usage statistics and learned patterns

### Learning Mode Controls

- **Toggle Learning**: Use the switch to enable/disable learning
- **View Learned Data**: Click "View Learned Preferences" to see what the system has learned
- **Export Data**: Save your learned preferences to a JSON file
- **Reset Data**: Clear all learned preferences and start fresh

### How It Works

#### Tool Usage Tracking
Every time you use a tool, the system records:
- Tool name and usage count
- Time of usage (hour and day of week)
- Context information
- Last used timestamp

#### Workflow Pattern Detection
The system analyzes sequences of tool usage to detect patterns:
- Tracks tools used in succession
- Records frequency of patterns
- Suggests next likely tools based on current context

#### Time-based Learning
The system learns when you typically use certain tools:
- Hourly patterns (e.g., morning vs. afternoon usage)
- Daily patterns (e.g., Monday vs. Friday usage)
- Provides time-appropriate suggestions

#### Adaptive Suggestions
Suggestions are combined from multiple sources:
- **Frequently Used**: Tools you use most often
- **Workflow Patterns**: Next tools in common workflows
- **Time-based**: Tools appropriate for current time
- Weighted and ranked for best recommendations

## Architecture

### Backend Components

#### PreferenceManager (`src/backend/PreferenceManager.js`)
Manages storage and retrieval of learned preferences:
- Tool usage tracking
- Workflow pattern recording
- Time pattern analysis
- Suggestion generation
- Data persistence to localStorage

#### InteractionTracker (`src/backend/InteractionTracker.js`)
Tracks user interactions and session management:
- Session-based tracking
- Automatic session timeout
- Pattern detection from sessions
- Integration with PreferenceManager

#### LearningMode (`src/backend/LearningMode.js`)
Main controller coordinating learning features:
- Action tracking
- Suggestion aggregation
- Enable/disable control
- Data export/import
- Statistics generation

### Frontend Components

#### User Interface (`src/frontend/`)
- **index.html**: Main application layout
- **styles.css**: Modern, responsive styling
- **app.js**: Client-side learning mode implementation and UI logic

### API Endpoints

```
GET  /api/learning/status        - Get learning mode status and statistics
POST /api/learning/enable        - Enable/disable learning mode
POST /api/learning/track         - Track a tool usage
GET  /api/learning/suggestions   - Get adaptive suggestions
GET  /api/learning/data          - Get all learned data
POST /api/learning/reset         - Reset all learned data
GET  /api/learning/export        - Export learned data
POST /api/learning/import        - Import learned data
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Project Structure

```
DeskAI/
├── src/
│   ├── backend/
│   │   ├── PreferenceManager.js    # Preference storage and retrieval
│   │   ├── InteractionTracker.js   # Session and interaction tracking
│   │   ├── LearningMode.js         # Main learning mode controller
│   │   └── index.js                # Express server setup
│   └── frontend/
│       ├── index.html              # Main HTML interface
│       ├── styles.css              # Styling
│       └── app.js                  # Client-side logic
├── tests/
│   ├── PreferenceManager.test.js   # PreferenceManager tests
│   ├── InteractionTracker.test.js  # InteractionTracker tests
│   └── LearningMode.test.js        # LearningMode tests
├── package.json                     # Project dependencies
├── jest.config.js                   # Jest test configuration
└── README.md                        # This file
```

## Configuration

### Storage
The system uses browser localStorage with key: `deskai_learned_preferences`

### Session Timeout
Default: 5 minutes of inactivity
Configure in `InteractionTracker.js`: `sessionTimeout` property

### Pattern Limits
- Maximum workflow patterns stored: 20
- Maximum contexts per tool: 50

## Privacy & Data

### What is Stored Locally
- Tool usage counts and timestamps
- Workflow patterns (tool sequences)
- Time-based usage patterns (hourly/daily)
- Learning mode enable/disable status

### What is NOT Stored
- Personal information
- Ticket content or details
- User credentials
- Any external service data

### Data Location
All data is stored in your browser's localStorage. It remains on your device and is never transmitted to external servers.

## Browser Compatibility

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported

Requires: localStorage support (all modern browsers)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Built with ❤️ for helpdesk professionals who value privacy and efficiency
