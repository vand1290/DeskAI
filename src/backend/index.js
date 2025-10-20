const express = require('express');
const path = require('path');

const PreferenceManager = require('./PreferenceManager');
const InteractionTracker = require('./InteractionTracker');
const LearningMode = require('./LearningMode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize learning mode components
// Note: In browser context, these will be initialized client-side
const preferenceManager = new PreferenceManager();
const interactionTracker = new InteractionTracker(preferenceManager);
const learningMode = new LearningMode(preferenceManager, interactionTracker);

learningMode.initialize();

// API Routes
app.get('/api/learning/status', (req, res) => {
  res.json({
    enabled: learningMode.isEnabled(),
    statistics: learningMode.getStatistics()
  });
});

app.post('/api/learning/enable', (req, res) => {
  const { enabled } = req.body;
  learningMode.setEnabled(enabled);
  res.json({ success: true, enabled: learningMode.isEnabled() });
});

app.post('/api/learning/track', (req, res) => {
  const { toolName, metadata } = req.body;
  learningMode.trackAction(toolName, metadata);
  res.json({ success: true });
});

app.get('/api/learning/suggestions', (req, res) => {
  const context = {
    currentTool: req.query.currentTool
  };
  const suggestions = learningMode.getSuggestions(context);
  res.json(suggestions);
});

app.get('/api/learning/data', (req, res) => {
  res.json(learningMode.getLearnedData());
});

app.post('/api/learning/reset', (req, res) => {
  learningMode.resetLearning();
  res.json({ success: true });
});

app.get('/api/learning/export', (req, res) => {
  const data = learningMode.exportData();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=deskai-learned-data.json');
  res.send(data);
});

app.post('/api/learning/import', (req, res) => {
  const { data } = req.body;
  const success = learningMode.importData(data);
  res.json({ success });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DeskAI server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to use the application`);
  });
}

module.exports = { app, learningMode, preferenceManager, interactionTracker };
