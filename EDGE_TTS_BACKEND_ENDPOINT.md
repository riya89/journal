# Edge TTS Backend Endpoint (ES Modules)

Add this endpoint to your `journal.js` router to support Michelle's voice:

```javascript
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Edge TTS endpoint for Michelle
router.post("/assistant/speak-edge", verifyToken, async (req, res) => {
  try {
    const { text, voice = "en-US-MichelleNeural" } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    
    // Create temp file path
    const tempFile = path.join(__dirname, `temp_${Date.now()}.mp3`);
    
    // Generate audio with Edge TTS
    const command = `edge-tts --voice "${voice}" --text "${text.replace(/"/g, '\\"')}" --write-media "${tempFile}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Edge TTS error:", error);
        return res.status(500).json({ error: "TTS generation failed" });
      }
      
      // Check if file was created
      if (!fs.existsSync(tempFile)) {
        return res.status(500).json({ error: "Audio file not generated" });
      }
      
      // Send the audio file
      res.setHeader('Content-Type', 'audio/mpeg');
      const audioStream = fs.createReadStream(tempFile);
      
      audioStream.pipe(res);
      
      // Clean up temp file after sending
      audioStream.on('end', () => {
        fs.unlink(tempFile, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });
      });
    });
    
  } catch (err) {
    console.error("Edge TTS endpoint error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
```

## Alternative: Direct Node.js Implementation

If you prefer a more direct approach without shell commands:

```javascript
// Alternative using edge-tts npm package directly
const edgeTTS = require('edge-tts');

router.post("/assistant/speak-edge", verifyToken, async (req, res) => {
  try {
    const { text, voice = "en-US-MichelleNeural" } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Generate audio buffer
    const audioBuffer = await edgeTTS.synthesize(text, voice);
    
    // Send as audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
    
  } catch (err) {
    console.error("Edge TTS error:", err);
    res.status(500).json({ error: "TTS generation failed" });
  }
});
```

## Installation

Make sure Edge TTS is available on your server:

```bash
# On your server
pipx install edge-tts

# Or if using npm package
npm install edge-tts
```

## Testing

Test the endpoint:

```bash
curl -X POST http://localhost:8000/journal/assistant/speak-edge \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "Hello, I am Michelle from Edge TTS"}' \
  --output test_michelle.mp3
```

This will give you Michelle's voice for free while keeping ElevenLabs as a premium fallback option!