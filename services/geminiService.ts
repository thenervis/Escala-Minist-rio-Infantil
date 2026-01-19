
import { GoogleGenAI, Type } from "@google/genai";
import { Volunteer, Room, Assignment } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartSuggestions(
  volunteers: Volunteer[],
  rooms: Room[],
  assignments: Assignment[],
  targetDate: string
) {
  const volunteerStats = volunteers.map(v => ({
    id: v.id,
    name: v.name,
    count: assignments.filter(a => a.volunteerId === v.id).length
  }));

  const roomsConfig = rooms.map(r => `${r.name} (Vagas: ${r.capacity})`).join(', ');

  const prompt = `Como um coordenador de ministério infantil, sugira a escala para o dia ${targetDate}.
  Temos as seguintes funções e suas vagas: ${roomsConfig}.
  Temos os seguintes voluntários e suas participações totais até agora:
  ${volunteerStats.map(v => `${v.name} (ID: ${v.id}, Participações: ${v.count})`).join('\n')}
  
  Regras:
  1. Priorize voluntários com menor número de participações (quem trabalhou menos vezes).
  2. Distribua os voluntários respeitando o limite de vagas (campo "capacity") de cada sala.
  3. No total precisamos preencher 13 vagas.
  4. Retorne um JSON com a lista de sugestões contendo roomId e volunteerId.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              roomId: { type: Type.STRING },
              volunteerId: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["roomId", "volunteerId"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return null;
  }
}
