const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const apiKey = "AIzaSyDy46gwSna55rbx70XCQ1-dIqqFP13LLwU";
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
