import { GoogleGenAI, Type } from "@google/genai";
import { NetworkNode, AuditReport, NodeStatus } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AUDIT_MODEL = "gemini-2.5-flash";

export const generateSecurityAudit = async (
  nodes: NetworkNode[],
  totalHashPower: number
): Promise<AuditReport> => {
  
  // Default fallback report to prevent UI crashes if AI fails
  const fallbackReport: AuditReport = {
    securityScore: 50,
    analysis: "Analisis otomatis terbatas karena gangguan koneksi atau format data AI. Jaringan tetap beroperasi dengan parameter standar.",
    recommendations: [
      "Pastikan koneksi internet stabil",
      "Tambah node untuk verifikasi manual",
      "Periksa log sistem untuk detail error"
    ]
  };

  try {
    // Safety check for input to prevent "map of undefined" errors
    if (!nodes || !Array.isArray(nodes)) {
        console.warn("Invalid nodes data passed to audit service");
        return fallbackReport;
    }

    const activeNodes = nodes.filter(n => n.status === NodeStatus.ACTIVE).length;
    const compromisedNodes = nodes.filter(n => n.status === NodeStatus.COMPROMISED).length;
    const recoveringNodes = nodes.filter(n => n.status === NodeStatus.RECOVERING).length;

    const prompt = `
      Anda adalah auditor keamanan blockchain AI. 
      Analisis status jaringan desentralisasi saat ini:
      - Total Node Aktif: ${activeNodes}
      - Total Node Terinfeksi (Malware/Compromised): ${compromisedNodes}
      - Total Node Sedang Pemulihan: ${recoveringNodes}
      - Total Hash Power: ${totalHashPower.toFixed(2)} TH/s
      - Tipe Node: ${nodes.map(n => n.type).join(', ')}

      Jika ada node terinfeksi (${compromisedNodes} > 0), skor keamanan HARUS DI BAWAH 50 dan berikan peringatan keras.
      Jika semua aman, skor bergantung pada jumlah node dan hash power.

      Berikan laporan keamanan JSON dengan struktur:
      - securityScore (0-100 integer)
      - analysis (Penjelasan singkat 1 paragraf tentang status keamanan. Tekankan pada dampak node terinfeksi jika ada.)
      - recommendations (Array string, 3 saran teknis. Jika terinfeksi, saran harus tentang isolasi dan patching.)
      
      PENTING: Hanya kembalikan JSON yang valid tanpa format Markdown (backticks). Pastikan JSON lengkap dan tertutup.
    `;

    const response = await ai.models.generateContent({
      model: AUDIT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            securityScore: { type: Type.INTEGER },
            analysis: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
        maxOutputTokens: 2000, 
        temperature: 0.2
      }
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    // Robust JSON extraction
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else {
      jsonText = jsonText.replace(/```json|```/g, '').trim();
    }
    
    let report: AuditReport;
    try {
      report = JSON.parse(jsonText) as AuditReport;
    } catch (parseError) {
      console.error("JSON Parsing failed:", parseError, "Text received:", jsonText);
      return fallbackReport;
    }

    // Runtime validation of fields
    if (!Array.isArray(report.recommendations)) {
      report.recommendations = ["Tingkatkan jumlah node untuk redundansi lebih baik."];
    }
    if (typeof report.securityScore !== 'number') report.securityScore = 50;
    if (!report.analysis) report.analysis = "Analisis data tidak tersedia.";

    return report;

  } catch (error) {
    console.error("Audit Generation Error:", error);
    return fallbackReport;
  }
};

export const simulateEncryptionProcess = async (text: string, strength: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Jelaskan secara teknis namun fiksional bagaimana pesan "${text}" dienkripsi menggunakan protokol DesentralShield dengan tingkat kekuatan "${strength}". Gunakan istilah kriptografi (AES-256, Sharding, Zero-Knowledge Proof). Maksimal 50 kata.`,
    });
    return response.text || "Enkripsi berhasil.";
  } catch (e) {
    return "Enkripsi lokal berhasil (AI Offline).";
  }
}