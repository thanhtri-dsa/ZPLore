import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

    const _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history, userLocation, currentTour } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("AI ERROR: GEMINI_API_KEY is missing from environment variables!");
      return NextResponse.json(
        { error: "API Key chưa được cấu hình. Vui lòng kiểm tra tệp .env" },
        { status: 500 }
      );
    }

    console.log("AI REQUEST: Sending request to Gemini with key starting with:", apiKey.substring(0, 10));

    // Try multiple model names and versions to ensure compatibility
    const endpointsToTry = [
      { version: "v1beta", model: "gemini-2.0-flash" },
      { version: "v1beta", model: "gemini-1.5-flash" },
      { version: "v1beta", model: "gemini-pro" },
      { version: "v1beta", model: "gemini-flash-latest" }
    ];

    let text = "";
    let success = false;
        const errorHistory: string[] = [];

    // Official Google API format
    for (const { version, model } of endpointsToTry) {
      try {
        console.log(`AI DEBUG: Trying model ${model} via ${version}...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `Bạn là ZPLore AI Assistant, một trợ lý du lịch sinh thái cao cấp TOÀN CẦU. 
                    
                    PHẠM VI HOẠT ĐỘNG:
                    - Bạn có khả năng lên kế hoạch hành trình du lịch sinh thái và vẽ lộ trình trên TOÀN THẾ GIỚI.
                    - Mặc dù chuyên môn chính là Việt Nam, bạn hãy sẵn sàng hỗ trợ khách hàng đi bất cứ đâu (Châu Á, Châu Âu, Châu Mỹ, v.v.).
                    - Ưu tiên các hành trình bền vững, sử dụng phương tiện xanh và gợi ý các điểm đến thân thiện với môi trường trên phạm vi toàn cầu.

                    KHẢ NĂNG ĐẶC BIỆT: 
                    1. Vẽ lộ trình trên bản đồ toàn cầu (Không giới hạn biên giới).
                    2. Gợi ý Ẩm thực Xanh địa phương (Eco-Restaurants) tại bất kỳ quốc gia nào.
                    3. Tính toán lượng khí thải CO2 dựa trên quãng đường và phương tiện.
                    4. Cung cấp "Góc nhìn chuyên gia" (Expert Insights) về văn hóa và bền vững quốc tế.

                    KHI NGƯỜI DÙNG HỎI ĐƯỜNG HOẶC LỘ TRÌNH:
                    1. Hãy đưa ra lời khuyên du lịch hữu ích, tinh tế và tính toán CO2.
                    2. Tập trung vào việc giới thiệu các trải nghiệm xanh đặc sắc tại quốc gia mà khách hàng muốn đến.
                    3. CUỐI CÙNG của câu trả lời, hãy đính kèm một khối JSON đặc biệt NẰM TRONG CẶP THẺ ---MAP_COMMAND--- và ---END_MAP_COMMAND---. 
                    
                    ĐỊNH DẠNG BẮT BUỘC (JSON THUẦN):
                       ---MAP_COMMAND---
                       {
                         "action": "draw_route",
                         "points": [
                           {"lat": 48.8566, "lng": 2.3522, "label": "Paris"},
                           {"lat": 41.9028, "lng": 12.4964, "label": "Rome"}
                         ],
                         "eco_points": [
                           {"lat": 48.8600, "lng": 2.3400, "label": "Eco-Cafe Paris", "type": "restaurant"}
                         ],
                         "emissions_info": {
                           "distance_km": 1100,
                           "co2_kg": 55,
                           "transport": "Tàu cao tốc"
                         },
                         "expert_insights": [...]
                       }
                       ---END_MAP_COMMAND---
                    
                    Lưu ý: 
                    - "points" phải là danh sách các tọa độ thực tế trên thế giới.
                    - Luôn ưu tiên các phương tiện xanh.
                    - Tour hiện tại: ${currentTour?.name || "Chưa chọn"}.
                    - Vị trí người dùng: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : "Chưa rõ"}.
                    - Nếu người dùng hỏi đường đi quốc tế, hãy trả lời: "Hệ thống ZPLore hỗ trợ các hành trình xanh trên toàn cầu để bảo tồn di sản thiên nhiên."` }]
                },
                {
                  role: "model",
                  parts: [{ text: "Tôi đã hiểu. Tôi sẵn sàng hỗ trợ." }]
                },
                                ...(history || []).map((h: { role: string; parts: any; }) => ({
                  role: h.role === "model" ? "model" : "user",
                  parts: h.parts
                })),
                {
                  role: "user",
                  parts: [{ text: message }]
                }
              ]
            })
          }
        );

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          text = data.candidates[0].content.parts[0].text;
          success = true;
          console.log(`AI SUCCESS: Model ${model} via ${version} responded.`);
          break;
        } else if (data.error) {
          const errDetail = `${model} (${version}): ${data.error.code} ${data.error.status} - ${data.error.message}`;
          errorHistory.push(errDetail);
          console.error(`AI DEBUG Error for ${model} (${version}):`, data.error);
          
          // If error is 403 (Permission/Region), it's likely a global issue for this key/region
          if (data.error.code === 403) {
            console.log("AI DEBUG: Detected 403 Forbidden. Stopping model iteration.");
            break; 
          }
        }
            } catch (e: any) {
        errorHistory.push(`${model} (${version}): Fetch failed - ${e.message}`);
        console.error(`AI DEBUG Fetch Error for ${model} (${version}):`, e.message);
      }
    }

    if (!success) {
      return NextResponse.json(
        { 
          error: "Không thể kết nối AI. Chi tiết lỗi:",
          details: errorHistory,
          advice: "Nếu gặp lỗi 403 (Forbidden), hãy thử sử dụng VPN sang Singapore hoặc Mỹ."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI ROUTE FINAL ERROR:", error.message);
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi khi kết nối với AI" },
      { status: 500 }
    );
  }
}
