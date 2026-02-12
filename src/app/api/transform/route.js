// Using the CORRECT model names that actually exist!
export async function POST(req) {
  try {
    const { text, persona, timeOfDay, dayOfWeek, revisionFeedback, previousOutput } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined");
    }

    // Context-aware greeting mapping
    const greetingMap = {
      pagi: "Selamat pagi",
      siang: "Selamat siang", 
      sore: "Selamat sore",
      malam: "Selamat malam"
    };

    const greeting = greetingMap[timeOfDay] || "Selamat siang";
    const isWeekend = dayOfWeek === "Sabtu" || dayOfWeek === "Minggu";
    
    // Persona guides with smart context
    const personaGuides = {
      dosen: `Ubah ke Bahasa Indonesia yang sangat sopan untuk Dosen. Gunakan salam "${greeting}". JANGAN gunakan "Dengan Hormat". Gunakan struktur: (1) Salam, (2) Kalimat "Mohon maaf mengganggu waktunya...", (3) Identitas, (4) Keperluan, (5) Terimakasih. PENTING: Gunakan dua kali baris baru (baris kosong) di antara setiap bagian tersebut agar chat mudah dibaca (tidak menumpuk dalam satu paragraf).`,
      atasan: `Ubah ke Bahasa Indonesia profesional untuk Atasan. Gunakan salam "${greeting}". JANGAN gunakan "Dengan Hormat". Gunakan struktur: (1) Salam, (2) Kalimat "Mohon maaf mengganggu waktunya...", (3) Keperluan singkat & solutif, (4) Terimakasih. PENTING: Gunakan dua kali baris baru (baris kosong) di antara setiap bagian tersebut agar chat mudah dibaca (tidak menumpuk dalam satu paragraf).`,
    };

    const guidance = personaGuides[persona] || `Ubah menjadi sangat sopan dan formal. Gunakan salam "${greeting}".`;
    
    // Build prompt based on whether this is a revision or new transformation
    let prompt;
    
    if (revisionFeedback && previousOutput) {
      // REVISION MODE
      prompt = `Kamu adalah pakar etika komunikasi Indonesia. ${guidance}

REVISI DIPERLUKAN!
Output sebelumnya: "${previousOutput}"
Feedback user: "${revisionFeedback}"

INSTRUKSI: Perbaiki output sebelumnya sesuai feedback user. Tetap gunakan salam "${greeting}" dan sesuaikan dengan persona ${persona}. Pastikan hasil revisi tetap sopan dan sesuai konteks.

PENTING: Berikan output dalam format JSON:
{
  "output": "hasil revisi",
  "tone": <skor 1-5, dimana 1=sangat kasar, 5=sangat sopan>
}

Pesan asli: ${text}`;
    } else {
      // NORMAL MODE
      prompt = `Kamu adalah pakar etika komunikasi Indonesia. ${guidance}

PENTING: Berikan output dalam format JSON:
{
  "output": "hasil transformasi",
  "tone": <skor 1-5, dimana 1=sangat kasar, 5=sangat sopan>
}

Pesan: ${text}`;
    }

    // Use gemma-3-27b-it (Maximum Quality - 14,400 RPD)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      throw new Error(data.error.message || 'API request failed');
    }

    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respon';
    
    // Try to parse JSON response
    let output, tone;
    try {
      const parsed = JSON.parse(rawOutput.replace(/```json\n?|\n?```/g, '').trim());
      output = parsed.output;
      tone = parsed.tone || 4;
    } catch {
      // Fallback if not JSON
      output = rawOutput;
      tone = 4;
    }

    return new Response(JSON.stringify({ output, tone }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
}
