const OpenAI = require('openai');

exports.generateContent = async (req, res) => {
  try {
    const { title, date, shortDescription } = req.body;

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return res.status(200).json({ 
        generatedContent: `[MOCK AI CONTENT] The event "${title}" held on ${date || 'recent days'} was a spectacular success. ${shortDescription || ''} It brought together students and faculty in a celebration of academic and extracurricular excellence. The department is proud of the enthusiasm shown by all participants.`
      });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5174",
        "X-Title": "Newsletter App",
      }
    });

    const prompt = `Write a formal, engaging, and professional paragraph (around 100-150 words) for a college computer engineering department newsletter. 
Event Title: ${title}
Event Date: ${date || 'Unknown'}
Short Description/Notes: ${shortDescription || 'None'}
The tone should be celebratory, formal, and similar to a university magazine.`;

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    });

    res.status(200).json({ generatedContent: response.choices[0].message.content.trim() });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ message: 'Error generating content', error: error.message });
  }
};
