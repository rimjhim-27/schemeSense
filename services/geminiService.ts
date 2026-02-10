
import { GoogleGenAI, Chat } from "@google/genai";
import { UserProfile, Scheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are "SchemeSense AI", a specialized assistant for government welfare schemes in Bihar, India. 
Your goal is to help citizens understand eligibility, application processes, and benefits. 
You have access to 38 districts and 534 blocks. 
Always be polite, professional, and clear. 
If a user provides their profile (age, income, sector), use it to give personalized advice. 
Keep responses concise and easy to understand for someone in a rural or semi-urban area.`;

export async function getEligibilityAdvice(user: UserProfile, scheme: Scheme): Promise<string> {
  try {
    const details = JSON.stringify(user.sectorDetails);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze eligibility for this citizen:
        
        USER PROFILE:
        - District: ${user.district}, Block: ${user.block}
        - Sector: ${user.sector}
        - Sector Details: ${details}
        - Annual Income: ₹${user.income}
        - Education: ${user.education}
        
        SCHEME TO EVALUATE:
        - Title: ${scheme.title}
        - Rule: ${scheme.eligibility}
        
        Provide a 2-sentence verdict on if they are likely eligible and one key document they will need.
      `,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });
    return response.text || "Please visit your local Block office for verification.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Verification service is currently busy. Please try again later.";
  }
}

export function createChatSession(user?: UserProfile): Chat {
  const context = user 
    ? `The user is ${user.fullName}, a ${user.sector} from ${user.block}, ${user.district}. 
       Income: ₹${user.income}, Category: ${user.caste}.`
    : "The user has not logged in yet.";

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nUser Context: ${context}`,
    },
  });
}
