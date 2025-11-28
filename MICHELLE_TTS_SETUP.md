# Michelle TTS Setup Guide

## ✅ Frontend Changes (Complete)

Your AI Assistant now:
1. **Uses Michelle by default** - Free, high-quality Edge TTS voice
2. **Keeps ElevenLabs as fallback** - For when you get the premium plan
3. **Voice selector button** - Top-right corner to switch between voices
4. **Smart fallback system** - Edge TTS → ElevenLabs → Browser TTS

## 🔧 Backend Setup Required

Add this endpoint to your `journal.js` router:

```javascript
// Edge TTS endpoint for Michelle
router.post("/assistant/speak-edge", verifyToken, async (req, res) => {
  try {
    const { text, voice = "en-US-MichelleNeural" } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const { exec } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
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

## 🚀 Server Setup

Make sure Edge TTS is installed on your server:

```bash
# On your server/deployment
pipx install edge-tts

# Test it works
edge-tts --voice "en-US-MichelleNeural" --text "Hello, I am Michelle" --write-media test.mp3
```

## 🎯 How It Works Now

### Default Behavior (Michelle - FREE):
1. User sends message
2. AI generates reply
3. **Michelle speaks** using Edge TTS (free, high quality)
4. Text animates word-by-word in sync

### Premium Mode (ElevenLabs):
1. Click the voice selector button (top-right)
2. Switch to "ElevenLabs" mode
3. Same experience but with premium ElevenLabs voice

### Fallback Chain:
```
Michelle (Edge TTS) → ElevenLabs → Browser TTS
```

## 🎤 Voice Selector

- **Green button**: Michelle (Free) - Currently active
- **Purple button**: ElevenLabs (Premium) - When you get the plan
- **Click to switch** between voices anytime

## 🧪 Testing

1. **Test Michelle**: Default mode, should work immediately after backend setup
2. **Test ElevenLabs**: Click voice selector, requires your existing ElevenLabs setup
3. **Test Fallback**: Disable both endpoints to test browser TTS

## 💡 Benefits

- **Free high-quality voice** with Michelle
- **Keep ElevenLabs code** for future premium use
- **Seamless switching** between voice providers
- **Automatic fallbacks** ensure voice always works
- **Cross-platform compatibility** with Edge TTS

Your AI Assistant now has Michelle's beautiful voice for free! 🎉