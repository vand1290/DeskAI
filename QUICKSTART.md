# Quick Start Guide

## Get Started with DeskAI Learning Mode in 5 Minutes

### Installation

```bash
# Clone the repository
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI

# Install dependencies
npm install

# Start the application
npm start
```

Visit **http://localhost:3000** in your browser.

### First Steps

#### 1. Understanding the Interface

When you open DeskAI, you'll see:
- 🧠 **Learning Mode** - Toggle switch (enabled by default)
- 📊 **Learning Statistics** - Shows tracked data metrics
- 💡 **Adaptive Suggestions** - Personalized tool recommendations
- 🛠️ **Available Tools** - Click to simulate usage
- 📚 **Review Learned Data** - View, export, or reset preferences

#### 2. Start Using Tools

Click on any tool button to simulate usage:
- Create Ticket
- Search Knowledge Base
- Send Email
- Update Status
- And more...

Each click is tracked when learning mode is enabled.

#### 3. Watch the Magic Happen

After clicking a few tools, you'll notice:
- **Statistics update** - Shows tools tracked, interactions, patterns
- **Suggestions appear** - Based on your usage patterns
- **Badges indicate why** - Frequently Used, Workflow Pattern, Time-based

#### 4. Build Workflow Patterns

Use tools in sequence to teach the system your workflows:

**Example Workflow:**
1. Click "Create Ticket"
2. Click "Search Knowledge Base"
3. Click "Send Email"
4. Repeat the same sequence

The system will learn this pattern and suggest the next likely tool!

#### 5. Review Your Data

Click **"View Learned Preferences"** to see:
- Tool usage counts and timestamps
- Learned workflow patterns with frequency
- Time-based usage patterns (hourly/daily)

All data is stored locally in your browser - never sent anywhere!

#### 6. Control Your Learning

**Disable Learning:**
- Toggle the switch to stop tracking
- Suggestions will be hidden
- Existing data is preserved

**Reset Learning:**
- Click "Reset Learning Data"
- Confirm in the modal
- All learned data is cleared
- Start fresh!

**Export Your Data:**
- Click "Export Data"
- Save as JSON file
- Backup your learned preferences

### Privacy Features

✅ **100% Local** - All data in browser localStorage  
✅ **No Tracking** - No analytics or external calls  
✅ **User Control** - Easy disable/reset anytime  
✅ **Transparent** - View all data in JSON format  

### Understanding Suggestions

Suggestions come from three sources:

1. **🔥 Frequently Used** (0.5x weight)
   - Tools you use most often
   - Based on total usage count

2. **🔄 Workflow Pattern** (3.0x weight - highest priority)
   - Tools that follow other tools in sequences
   - Learned from your usage patterns

3. **⏰ Time-based** (2.0x weight)
   - Tools you typically use at this time
   - Based on hour of day and day of week

### Tips for Best Results

1. **Use tools consistently** - More data = better suggestions
2. **Follow workflows** - Use tools in logical sequences
3. **Be patient** - Patterns emerge after 5-10 interactions
4. **Review regularly** - Check what the system learned
5. **Reset if needed** - Start over if patterns don't match your needs

### Running Tests

```bash
# Run all tests
npm test

# Expected: 40 tests passing
```

### Troubleshooting

**No suggestions appearing?**
- Use more tools (need at least 1-2 interactions)
- Check that learning mode is enabled

**Data not persisting?**
- Ensure browser localStorage is enabled
- Check browser privacy settings

**Want to start fresh?**
- Use the "Reset Learning Data" button
- All data will be cleared

### What's Next?

- Continue using tools to build richer patterns
- Export your data for backup
- Share feedback on what works well
- Suggest new features!

### Need Help?

- Check [README.md](README.md) for full documentation
- Read [LEARNING_MODE.md](LEARNING_MODE.md) for technical details
- Open an issue on GitHub for questions

---

**Enjoy your adaptive, privacy-first helpdesk experience!** 🚀
