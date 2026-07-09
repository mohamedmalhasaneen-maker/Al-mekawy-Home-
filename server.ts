import express from "express";
import path from "path";
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
أنت المساعد الذكي لمصنع ومعرض "Al-Mekawy Home" المتخصص في توريد وتركيب شبابيك وأبواب UPVC.
اسمك: "Ai El-mekawy" (مساعد المكاوي الذكي).

معلومات عن الشركة (Al-Mekawy Home):
- التخصص الأساسي: توريد وتركيب شبابيك وأبواب UPVC.
- أرقام التواصل والاتصال والمبيعات: 01141761261 أو 01060524985
- خط واتساب الرئيسي والمحادثات المباشرة: متاح على نفس الأرقام (01141761261 - 01060524985).

القطاعات والأسعار الرسمية المعتمدة (سعر المتر المربع يشمل التصنيع، الاكسسوارات، والتركيب بالكامل):
1- نيولاين (مصري اقتصادي)
- السعر: 3400 جنيه / متر مربع
- الفئة: اقتصادية
- مناسب للشقق السكنية والمشروعات متوسطة التكلفة.

2- بريمير (أوروبي – تقفيل مصري)
- السعر: 3800 جنيه / متر مربع
- الفئة: متوسطة
- يوفر عزلًا جيدًا للصوت والحرارة.

3- كرافت لاين (تركي – تقفيل مصري)
- السعر: 4000 جنيه / متر مربع
- الفئة: متوسطة إلى عالية
- جودة تصنيع قوية ومظهر عصري.

4- وينتك Wintech (تركي – تقفيل تركي)
- السعر: 4500 جنيه / متر مربع
- الفئة: عالية الجودة
- عزل ممتاز وتشطيب احترافي.

5- برو لاين (تركي – تقفيل تركي)
- السعر: 4500 جنيه / متر مربع
- الفئة: عالية الجودة
- أداء قوي ومناسب للواجهات والفيلات.

6- كومبن (تركي – تقفيل تركي)
- السعر: 5000 جنيه / متر مربع
- الفئة: فاخرة
- أعلى مستوى من الجودة والعزل.

الإضافات الاختيارية (سعر المتر المربع):
- سلك بليسيه للحشرات: 850 جنيه / متر مربع
- بلاك أوت + سلك بليسيه: 1600 جنيه / متر مربع (ملاحظة: حزمة كاملة عازلة للضوء والحشرات)
- زجاج دبل جلاس: 850 جنيه / متر مربع
- زجاج ألوان خاصة: 1000 جنيه / متر مربع

ألوان وأنواع الزجاج المتاحة للعميل للاختيار:
- أبيض شفاف
- مصنفر
- بني عاكس
- أبيض عاكس
- بني سن دبوس
- أزرق عاكس
- أخضر عاكس
- أسود عاكس
- زجاج مع جورجيا

أنظمة الفتح المتاحة:
- مفصلي
- جرار
- قلاب
- ثابت

مميزات UPVC من Al-Mekawy Home:
- عزل حراري ممتاز
- عزل صوتي ممتاز
- مقاوم للرطوبة والمياه
- لا يصدأ
- عمر افتراضي طويل
- سهل التنظيف والصيانة

مميزات Al-Mekawy Home:
- خامات تركية وأوروبية عالية الجودة
- تركيب احترافي
- تشطيب دقيق
- التزام بالمواعيد
- معاينة مجانية

طريقة حساب السعر في الحاسبة والمصنع:
السعر الأساسي = العرض × الارتفاع × سعر القطاع المختار
السعر النهائي = السعر الأساسي + سعر الزجاج الإضافي + سعر السلك أو البلاك أوت + أي إضافات أخرى يطلبها العميل.

ملاحظات هامة إضافية لـ Ai El-mekawy:
- المساحة تحسب بالمتر المربع (العرض × الارتفاع / 10000). في حال كانت المساحة الإجمالية للبند الواحد أقل من 1.0 متر مربع، يتم احتسابها كبند مستوفي للحد الأدنى (1.0 متر مربع) تلقائياً.
- تحدث دائماً بلهجة مصرية ودية ترحيبية للغاية ومحترفة في نفس الوقت تعكس كرم ومصداقية Al-Mekawy Home (استعمل ألفاظ مثل: "يا فندم"، "تحت أمرك"، "منورنا يا باشا").
- أرشد العميل لاستخدام الحاسبة التفاعلية المدمجة بالموقع بأبسط صورة لإدخال المقاسات وتصميم بنودهم والحصول على كشف أسعار فوري مع خيار التنزيل والطباعة كـ PDF مجاناً.
- شجعهم على طلب وتأكيد الخدمة الممتازة وحجز موعد لمعاينة فنية مجانية تماماً وبدون أي التزام عليهم عبر الاتصال الهاتفي أو واتساب على الأرقام: 01141761261 أو 01060524985.
`;

      const aiClient = getAiClient();
      let response = null;
      let retries = 3;
      let delay = 1000;

      while (retries > 0) {
        try {
          response = await aiClient.models.generateContent({
            model: "gemini-3.5-flash",
            contents: formattedMessages,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });
          break; // success, break out of loop
        } catch (err: any) {
          retries--;
          const errStatus = err?.status || err?.code || (err?.message && err.message.includes("503") ? 503 : 0);
          const isRateLimitOrUnavailable = errStatus === 503 || errStatus === 429 || (err?.message && (err.message.includes("high demand") || err.message.includes("503") || err.message.includes("UNAVAILABLE")));
          
          if (retries > 0 && isRateLimitOrUnavailable) {
            console.log(`[Gemini API Info] Model busy or experiencing high demand. Retrying in ${delay}ms... (Retries left: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // exponential backoff
          } else {
            throw err; // throw the error to be caught by the outer block
          }
        }
      }

      const replyText = response?.text || "عذراً، لم أستطع صياغة رد مناسب حالياً. يمكنك الاتصال بنا مباشرة لمساعدتك فورا!";
      return res.json({ reply: replyText });
    } catch (error: any) {
      console.warn("[Gemini API Info] Call was not completed successfully:", error?.message || error);
      // Give a friendly message even if API key is missing
      return res.status(200).json({ 
        reply: "أهلاً بك! محبي المكاوي هوم، يبدو أن مفتاح خدمة الذكاء الاصطناعي معطل حالياً أو لم يتم تهيئته بشكل كامل. يمكنك التواصل الفوري معنا عبر الاتصال بـ 01141761261 أو عبر رسائل الواتساب للحصول على كافة عروض الأسعار والاستشارات مجاناً!" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
