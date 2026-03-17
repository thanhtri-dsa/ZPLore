const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Thiếu GEMINI_API_KEY trong biến môi trường");
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const modelList = await genAI.listModels();
    console.log("CÁC MODEL HIỆN CÓ CHO KEY NÀY:");
    modelList.models.forEach(m => console.log(`- ${m.name}`));
  } catch (error) {
    console.error("LỖI KHI LIẾT KÊ MODEL:", error.message);
  }
}

listModels();
