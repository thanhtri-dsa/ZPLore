const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  const apiKey = "AIzaSyDy46gwSna55rbx70XCQ1-dIqqFP13LLwU";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Thử các tên model với tiền tố 'models/'
  const modelsToTry = [
    "models/gemini-1.5-flash",
    "models/gemini-1.5-pro",
    "models/gemini-pro"
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Đang thử với model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Chào bạn!");
      const response = await result.response;
      console.log(`Model ${modelName} HOẠT ĐỘNG! Phản hồi: ${response.text()}`);
      return;
    } catch (e) {
      console.log(`Model ${modelName} thất bại: ${e.message}`);
    }
  }
}

testGemini();
