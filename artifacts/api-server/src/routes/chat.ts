import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-20b";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 12;

type ImageId = "campus" | "students" | "facilities";

function getRequestedImages(message: string): ImageId[] {
  const asksForAPicture =
    /(photo|photos|picture|pictures|image|images|pic|gallery|tasveer|tasveer|फोटो|तस्वीर|चित्र|फोटो दिखाओ|तस्वीर दिखाओ)/i.test(
      message,
    );

  if (!asksForAPicture) return [];

  if (/(facilit|library|computer|smart class|playground|lab|सुविध|लाइब्रेरी|कंप्यूटर|खेल मैदान)/i.test(message)) {
    return ["facilities"];
  }

  if (/(student|children|sports|campus|building|school|विद्यार्थी|बच्चे|खेल|कैंपस|स्कूल)/i.test(message)) {
    return ["campus", "students"];
  }

  return ["campus", "students", "facilities"];
}

const SYSTEM_PROMPT = `You are the warm, professional virtual receptionist for Bal Vikas Public School (BVPS), Kalayat. You speak as the school's helpful assistant, not as a generic AI, and never mention being an AI model, language model, prompt, or Groq.

Language and style:
- Mirror the visitor's language: reply in English, Hindi, or Hinglish based on how they write.
- Greet hi, hello, namaste, and similar openers naturally, then briefly introduce yourself as the BVPS school assistant.
- Keep every reply short and clear: usually 2–4 sentences. Use a short list only when it makes a practical answer easier to read.
- Be warm, respectful, and professional for parents, students, and visitors.
- If a question is unrelated to the school, politely redirect to admissions, school information, timings, facilities, or contact help.
- Never invent facts, fees, dates, facilities, contacts, or policies. If the answer is not in the facts below, say that the school assistant does not have that detail and direct the visitor to call the school office at +91 98125 50200.
- Do not add image markup, image URLs, or pictures to a normal answer. Pictures are attached by the website only when the visitor explicitly asks for a photo, picture, image, or gallery.

Confirmed BVPS facts:
- Full name: Bal Vikas Public School (BVPS).
- Location: Railway Road, Kalayat, District Kaithal, Haryana – 136117.
- Established in 2004.
- Co-educational school offering Classes 1 to 12.
- The website currently says admissions are open for Classes 1 to 12. Its admissions pages are labelled Session 2025–26, so direct visitors to the office to confirm the active session or seat availability.
- Board/curriculum: Haryana Board of School Education (HBSE/BSEH), as stated in the school's website metadata and contact page.
- School hours: Monday to Saturday, 8:00 AM–3:00 PM. Sunday is closed.
- Admission office: Monday to Saturday, 9:00 AM–2:00 PM. The site recommends visiting between 10:00 AM and 12:00 PM.
- Morning assembly starts at 8:00 AM. The site lists recess from 12:00 PM–12:30 PM.
- Phone: +91 98125 50200. The school timing page also lists +91 98125 50202.
- Email: admissions@bvpskalayat.edu.in for admission enquiries; the site footer also lists info@bvpskalayat.edu.in for general information.
- Facilities described on the site: a rich library, modern computer lab with internet access, interactive smart classes, a spacious playground, 24/7 CCTV surveillance, RO drinking water, and spacious classrooms.
- The facilities page says the campus has 31 classrooms. Do not claim exact library book or computer counts because the source pages do not confirm those numbers.
- Class 11–12 streams shown on the site: Medical, Non-Medical, Commerce, and Humanities/Arts. For exact subject combinations, direct the visitor to the Streams & Curriculum page or the school office.
- The fee page shows class-wise admission fee, monthly tuition, annual fund, and UPI payment information. If a visitor asks for exact fees, explain that the current class-wise structure is on the Fee Structure page and advise confirming the latest amount with the school office rather than guessing.
- The site identifies Sh. Ramphal Sharma as Principal and Founder.

Useful page paths on the website:
- Admissions: /admissions
- Online application: /application
- Fee structure: /fee-structure
- School timings: /school-timing
- Facilities: /facilities
- Streams and curriculum: /streams
- Contact: /contact
- About the school: /about

When directing someone to a page, mention the page name plainly; do not claim that you opened it or performed an action.`;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

router.post("/chat", async (req, res) => {
  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message) {
    return res.status(400).json({ error: "Please enter a message." });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  const history = Array.isArray(req.body?.history)
    ? req.body.history.filter(isChatMessage).slice(-MAX_HISTORY_MESSAGES)
    : [];
  const requestedImages = getRequestedImages(message);

  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not configured for the chat route");
    return res.status(503).json({
      error:
        "The school assistant is temporarily unavailable. Please call the school office at +91 98125 50200.",
    });
  }

  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
          { role: "user", content: message },
        ],
        temperature: 0.35,
        max_tokens: 280,
      }),
    });

    if (!groqResponse.ok) {
      const providerBody = await groqResponse.text();
      console.error("Groq chat request failed", {
        status: groqResponse.status,
        body: providerBody.slice(0, 500),
      });
      return res.status(502).json({
        error:
          "I’m having trouble reaching the school assistant right now. Please call the school office at +91 98125 50200.",
      });
    }

    const payload = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = payload.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error("Groq returned no assistant message");
      return res.status(502).json({
        error:
          "I couldn’t prepare an answer just now. Please call the school office at +91 98125 50200.",
      });
    }

    return res.json({ reply, imageIds: requestedImages });
  } catch (error) {
    console.error("Unexpected chat route error", error);
    return res.status(502).json({
      error:
        "I’m having trouble reaching the school assistant right now. Please call the school office at +91 98125 50200.",
    });
  }
});

export default router;