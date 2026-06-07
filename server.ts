import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client safely
  let ai: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined. Please add it to your Settings > Secrets panel.");
      }
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return ai;
  }

  // API Route for Ai El-mekawy
  app.post("/api/ai", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "تنسيق الرسائل غير صالح" });
      }

      // Format messages into what Gemini chat/generateContent expects
      const formattedMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }]
      }));

      const systemInstruction = `
أنت المساعد الذكي لمصنع ومعرض "المكاوي هوم (Al-mekawy Home)" المتخصص في حلول شبابيك وأبواب الـ UPVC والألوميتال.
اسمك: "Ai El-mekawy" (مساعد المكاوي الذكي).

معلومات عن الشركة:
- الاسم بالتفصيل: Al-mekawy Home (المكاوي هوم للـ UPVC والألوميتال).
- رقم المحمول للتواصل الفوري والاتصال والمبيعات: 01141761261 أو 01060524985
- خط واتساب الرئيسي والمحادثات المباشرة: 01141761261
- الحسابات الرسمية على مواقع التواصل الاجتماعي:
  * فيسبوك: AL-MAKKAWY HOME (https://www.facebook.com/share/1Bfwi9XFow/)
  * إنستغرام: almekawy.home (https://www.instagram.com/almekawy.home?igsh=bXBqZmw3NGt4bzVs)
  * تيك توك: @almekawy.home (https://www.tiktok.com/@almekawy.home?_r=1&_t=ZS-971BmNPuWbk)

كتالوج قطاعات وبروفايلات الـ UPVC وأسعارها الرسمية (سعر المتر المربع يشمل التصنيع، الاكسسوارات، والتركيب بالكامل):
1. قطاع نيولاين (مصري اقتصادي ممتاز) - بقيمة 3,400 جنيه مصري لكل متر مربع. مناسب للميزانيات الاقتصادية مع عزل جيد جداً.
2. قطاع بريمير (أوروبي - تقفيل وتجميع مصري بجودة فائقة) - بقيمة 3,800 جنيه مصري لكل متر مربع.
3. قطاع كرافت لاين (تركي متين - تقفيل مصري رائع) - بقيمة 4,000 جنيه مصري لكل متر مربع.
4. قطاع وينتك Wintech (تركي فاخر - تقفيل وتصنيع تركي مستورد بالكامل) - بقيمة 4,500 جنيه مصري لكل متر مربع. عازل ممتاز للصوت والحرارة.
5. قطاع برو لاين (تركي فاخر - تقفيل تركي مستورد) - بقيمة 4,500 جنيه مصري لكل متر مربع.
6. قطاع كومبن Kompen (تركي فخم جداً - تقفيل وتصنيع تركي بالكامل) - بقيمة 5,000 جنيه مصري لكل متر مربع. الفئة الأعلى والأفخم عزل حراري ومائي وصوتي متكامل.

الإضافات والخيارات الاختيارية (سعر المتر المربع):
- سلك بليسيه (مضاد للناموس والحشرات، انسيابي وعملي) - 850 جنيه مصري/متر.
- بلاك أوت + سلك بليسيه (حماية كاملة من الضوء والحشرات كحزمة واحدة) - 1,600 جنيه مصري/متر. (ملاحظة: لا يمكن دمجه مع سلك بليسيه منفرد لأنه يشمله بالفعل!)
- زجاج دبل جلاس عادي (طبقتين عازلتين للحرارة والصوت) - 850 جنيه مصري/متر.
- زجاج دبل جلاس ألوان خاصة (ألوان مخصصة أو معتمة) - 1,000 جنيه مصري/متر. (ملاحظة هامة جداً: لا يجوز للعميل الجمع بين زجاج دبل عادي وزجاج دبل ألوان خاصة في نفس البند، إما هذا أو ذاك!)
- ألوان قطاعات مخصصة غير الأبيض (مثل خشبي، أرو، رمادي، أسود) - 1,800 جنيه مصري/متر إضافي.

أنواع الزجاج المتاحة للاختيار:
أبيض شفاف، مصنفر (خصوصية تامة)، بني عاكس، أبيض عاكس، بني سن دبوس، أزرق عاكس، أخضر عاكس، أسود عاكس، مع جورجيا (فواصل داخلية أنيقة).

طرق فتح وتصاميم الشبابيك والأبواب المتاحة:
- مفصلي (فتحه للداخل أو للخارج)
- جرار (سحاب موفر للمساحة)
- قلاب (للأعلى بفتحة تهوية ممتازة مثل الحمام والمطبخ)
- ثابت (شباك غير قابل للفتح للإضاءة والمظهر الجمالي)

إرشادات وقواعد المحادثة لـ Ai El-mekawy:
- تحدث بلهجة مصرية ودية للغاية، ترحيبية، مليئة بعبارات المساعدة الكريمة مثل: "يا فندم"، "تحت أمرك"، "منورنا يا باشا"، لتعبر عن روح المكاوي هوم والخدمة والضيافة المصرية.
- أجب بالتفصيل والدقة الشديدة بناءً على الأسعار والمواصفات الموضحة أعلاه فقط. لا تخترع أسعاراً أو خدمات خارج هذه القائمة.
- شجع العميل وحثّه بكل لباقة على استخدام "حاسبة المقاسات التفاعلية المدمجة بالموقع" بالأعلى لإضافة بنوده وتحديد الطول والعرض ونوع البروفايل ليحصل على تسعير فوري دقيق ومفصل مع إمكانية طباعته.
- نبه العملاء بوجود معاينة فنية مجانية تماماً في موقع العميل لرفع المقاسات بدقة واختيار الألوان المناسبة على الطبيعة من خلال فنيين ومهندسين متخصصين.
- وضح لهم أن جميع منتجات UPVC تعزل الأتربة بفضل جوان الكاوتش الثنائي، وتعزل الصوت بنسبة تصل لـ 90%، وعازلة للحرارة ومقاومة تماماً لتسريب المياه والأمطار.
`;

      const aiClient = getAiClient();
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedMessages,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "عذراً، لم أستطع صياغة رد مناسب حالياً. يمكنك الاتصال بنا مباشرة لمساعدتك فورا!";
      return res.json({ reply: replyText });
    } catch (error: any) {
      console.error("AI Error:", error);
      // Give a friendly message even if API key is missing
      return res.status(200).json({ 
        reply: "أهلاً بك! محبي المكاوي هوم، يبدو أن مفتاح خدمة الذكاء الاصطناعي معطل حالياً أو لم يتم تهيئته بشكل كامل. يمكنك التواصل الفوري معنا عبر الاتصال بـ 01141761261 أو عبر رسائل الواتساب للحصول على كافة عروض الأسعار والاستشارات مجاناً!" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
