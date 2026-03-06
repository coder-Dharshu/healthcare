const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const SymptomCheck = require('../models/SymptomCheck');
const { protect } = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/analyze', protect, async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;
    if (!symptoms || symptoms.length === 0)
      return res.status(400).json({ message: 'Please provide symptoms' });

    const prompt = `You are a medical AI assistant. A patient reports the following symptoms: ${symptoms.join(', ')}.
Patient info: Age: ${age || 'unknown'}, Gender: ${gender || 'unknown'}.

Please provide:
1. A brief summary of the presentation.
2. 2-3 possible conditions with probability and description.
3. Urgency level (Immediate, Within 24hrs, Within a week, Monitor at home).
4. Recommended medical specialist to consult (e.g., General Physician).
5. 2-3 immediate home remedies.
6. Warning signs to watch for.

IMPORTANT: Keep response concise and clear. Format as JSON ONLY, with these exact keys:
{
  "summary": "...",
  "possibleConditions": [{"condition": "...", "probability": "High/Medium/Low", "description": "..."}],
  "urgencyLevel": "...",
  "recommendedSpecialist": "...",
  "homeRemedies": ["...", "..."],
  "warningsigns": ["...", "..."]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 800,
    });

    let aiResponse = completion.choices[0]?.message?.content || '';
    let parsed = {};
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON object found");
      }
    } catch (e) {
      console.error("JSON parsing error", e, aiResponse);
      parsed = { raw: aiResponse };
    }

    const symptomCheck = await SymptomCheck.create({
      user: req.user._id,
      symptoms,
      aiResponse: JSON.stringify(parsed),
      recommendedSpecialist: parsed.recommendedSpecialist || '',
      severity: parsed.urgencyLevel || 'low'
    });

    res.json({ aiResponse: parsed, checkId: symptomCheck._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get symptom history
router.get('/history', protect, async (req, res) => {
  try {
    const history = await SymptomCheck.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
