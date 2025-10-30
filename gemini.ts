import { GoogleGenAI, Type, GenerateContentResponse, Chat, Modality } from "@google/genai";
// FIX: Imported the `CorrectionResult` type to resolve a type error.
import { Difficulty, ExamType, ExplanationStyle, Exam, UserAnswers, CorrectionResult } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const examSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['multiple-choice', 'fill-in-the-blank', 'true-false', 'short-answer'] },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
        },
        required: ['question', 'type', 'answer']
      }
    }
  },
  required: ['title', 'questions']
};

export const generateExam = async (difficulty: Difficulty, examType: ExamType, source: string | { inlineData: { data: string; mimeType: string } }): Promise<Exam> => {
  const ai = getAI();
  const model = 'gemini-2.5-pro';
  
  const prompt = `بناءً على المحتوى التالي، قم بإنشاء امتحان بمستوى صعوبة "${difficulty}" من نوع "${examType}".
  يجب أن يكون الامتحان بصيغة JSON مطابقة للمخطط (schema) المقدم.
  لأسئلة "املأ الفراغ"، استخدم "_____" لتمثيل الفراغ.
  لأسئلة "صح / خطأ"، يجب أن تكون الإجابة "True" أو "False".
  بالنسبة للامتحانات "الشاملة"، قم بتضمين مزيج من جميع أنواع الأسئلة: خيارات متعددة، املأ الفراغ، صح/خطأ، وإجابة قصيرة.
  
  المحتوى: ${typeof source === 'string' ? source : '[محتوى من الملف المرفوع]'}`;

  const contents = typeof source === 'string' ? [{ text: prompt }] : [source, { text: prompt }];

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      responseMimeType: 'application/json',
      responseSchema: examSchema,
    }
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Exam;
  } catch (e) {
    console.error("Failed to parse exam JSON:", e);
    throw new Error("فشل الذكاء الاصطناعي في إنشاء تنسيق امتحان صالح. يرجى المحاولة مرة أخرى.");
  }
};

export const correctExam = async (exam: Exam, userAnswers: UserAnswers): Promise<CorrectionResult> => {
    const ai = getAI();
    const model = 'gemini-2.5-flash';

    const prompt = `
    أنت مصحح امتحانات ذكاء اصطناعي. بالنظر إلى أسئلة الامتحان والإجابات الصحيحة وإجابات المستخدم، قم بتقديم تقييم.
    - احسب النتيجة.
    - لكل سؤال، حدد ما إذا كانت إجابة المستخدم صحيحة.
    - قدم شرحًا موجزًا لسبب صحة أو خطأ الإجابة.
    - يجب أن يكون الناتج كائن JSON بالهيكل التالي: { score: number, total: number, feedback: [{ questionIndex: number, isCorrect: boolean, correctAnswer: string | boolean, explanation: string }] }.

    الامتحان: ${JSON.stringify(exam)}
    إجابات المستخدم: ${JSON.stringify(userAnswers)}
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });
    
    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse correction JSON:", e);
        throw new Error("فشل الذكاء الاصطناعي في تقديم تقييم صالح. يرجى المحاولة مرة أخرى.");
    }
};


export const explainTopic = async (style: ExplanationStyle, source: string | { inlineData: { data: string; mimeType: string } }): Promise<string> => {
    const ai = getAI();
    const model = 'gemini-2.5-flash';
    const prompt = `يرجى تلخيص وشرح المحتوى التالي بأسلوب ${style.toLowerCase()}
    قم بتنسيق المخرجات بشكل جيد باستخدام markdown.
    
    المحتوى: ${typeof source === 'string' ? source : '[محتوى من الملف المرفوع]'}`;
    
    const contents = typeof source === 'string' ? [{ text: prompt }] : [source, { text: prompt }];

    const response = await ai.models.generateContent({
        model,
        contents: { parts: contents },
    });
    return response.text;
};


export const createProject = async (topic: string, details: string): Promise<string> => {
    const ai = getAI();
    const model = 'gemini-2.5-pro';
    const prompt = `أنشئ مشروعًا شاملاً حول الموضوع: "${topic}".
    تفاصيل إضافية: "${details}".
    يجب أن يكون المشروع منظمًا جيدًا مع عناوين رئيسية وفرعية ومحتوى مفصل.
    استخدم markdown للتنسيق.`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

export const generateProjectImage = async (projectTopic: string): Promise<string> => {
    const ai = getAI();
    const model = 'gemini-2.5-flash-image';
    
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ text: `أنشئ صورة مناسبة وعالية الجودة واحترافية لمشروع حول: ${projectTopic}` }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("فشل إنشاء الصورة.");
};


let chatInstance: Chat | null = null;
export const getChatInstance = (): Chat => {
    if (!chatInstance) {
        const ai = getAI();
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: 'أنت مساعد ذكي وودود. تحدث باللغة العربية.'
            }
        });
    }
    return chatInstance;
}

export const streamChatResponse = async (prompt: string, onChunk: (text: string) => void) => {
    const chat = getChatInstance();
    const stream = await chat.sendMessageStream({ message: prompt });
    for await (const chunk of stream) {
        onChunk(chunk.text);
    }
};
