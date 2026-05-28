require('dotenv').config({ path: './.env' });
const OpenAI = require('openai');
const sequelize = require('./config/database');
const Newsletter = require('./models/Newsletter');

async function test() {
  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENAI_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "Newsletter App"
      }
    });

    console.log("Testing OpenRouter AI...");
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: "Say hello!" }],
    });
    console.log("AI Response:", response.choices[0].message.content);
  } catch (err) {
    console.error("AI Error:", err.response ? err.response.data : err.message);
  }

  try {
    console.log("Testing Newsletter creation...");
    await sequelize.sync();
    const nl = await Newsletter.create({
      title: "Test",
      semester: "Testing",
      department: "Test Dep",
      mission: [""],
      events: [{ title: 'Test Event' }]
    });
    console.log("Created newsletter:", nl.id);
  } catch (err) {
    console.error("DB Error:", err.message);
  }
}
test();
