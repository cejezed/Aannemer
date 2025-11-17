/**
 * LLM-based offer parsing using OpenAI GPT-4
 */

import OpenAI from 'openai';
import type { ParsedOfferLineCandidate, OfferParseResult } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const PARSING_PROMPT = `Je bent een AI assistent die bouwoffertes analyseert. Je krijgt de ruwe tekst uit een offertebestand.

Je taak is om een JSON-lijst te maken van alle offerteregels/posten. Negeer:
- Subtotalen, eindtotalen
- Hoofdstuktitels zonder bedrag
- Algemene tekst zoals voorwaarden, disclaimers
- Adresgegevens, contactinfo

Voor elke echte post/regel maak je een object met:

{
  "description": "volledige omschrijving van de post",
  "priceIncl": 12345.67,  // bedrag inclusief BTW (alleen als vermeld, anders null)
  "priceType": "VAST" | "STELPOST" | "INDICATIE" | "NOG" | "ONBEKEND",
  "code": "optionele postcode zoals 21.10.0010",
  "quantity": 50.0,  // optionele hoeveelheid
  "unit": "m²"  // optionele eenheid
}

**PriceType bepalen:**
- "VAST" = normale post met vast bedrag
- "STELPOST" = post met woorden als "stelpost", "pm", "pro memorie", "richtprijs"
- "INDICATIE" = post met "indicatie", "circa", "ongeveer"
- "NOG" = post met "nader overeen te komen", "NOG", "in overleg"
- "ONBEKEND" = als prijs-type onduidelijk is

**Belangrijk:**
- Retourneer ALLEEN geldige JSON als array van objecten
- Geen markdown, geen uitleg, alleen JSON
- Als er geen posten gevonden kunnen worden, retourneer lege array []

Voorbeeld output:
[
  {
    "description": "Fundering storten inclusief bekisting",
    "priceIncl": 8500.50,
    "priceType": "VAST",
    "code": "21.10.0010",
    "quantity": 12.5,
    "unit": "m³"
  },
  {
    "description": "Onvoorziene werkzaamheden (stelpost)",
    "priceIncl": 5000.00,
    "priceType": "STELPOST"
  }
]`;

export async function parseOfferWithLLM(
  rawText: string,
  fileType: 'pdf' | 'docx' | 'xlsx'
): Promise<OfferParseResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set');
    return {
      lines: [],
      warnings: ['LLM parsing niet beschikbaar: OPENAI_API_KEY niet geconfigureerd'],
    };
  }

  const warnings: string[] = [];

  try {
    // Limit text length for API (roughly 100k tokens max for GPT-4)
    const maxChars = 300000;
    let textToAnalyze = rawText;
    if (rawText.length > maxChars) {
      textToAnalyze = rawText.slice(0, maxChars);
      warnings.push(`Bestand was te groot, alleen eerste ${maxChars} karakters geanalyseerd`);
    }

    console.log(`[LLM Parser] Analyzing ${fileType} with ${textToAnalyze.length} characters`);
    console.log(`[LLM Parser] First 500 chars:`, textToAnalyze.substring(0, 500));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: PARSING_PROMPT,
        },
        {
          role: 'user',
          content: `Offerte tekst (${fileType}):\n\n${textToAnalyze}`,
        },
      ],
      temperature: 0,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log(`[LLM Parser] LLM response:`, responseText.substring(0, 1000));

    // Parse JSON response
    let lines: ParsedOfferLineCandidate[] = [];

    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          lines = parsed.map((item: any) => ({
            description: item.description || 'Onbekende post',
            priceIncl: item.priceIncl || undefined,
            priceType: item.priceType || 'ONBEKEND',
            rawText: item.description,
            code: item.code || undefined,
            quantity: item.quantity || undefined,
            unit: item.unit || undefined,
          }));
        }
      } else {
        warnings.push('LLM kon geen gestructureerde data extraheren');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      warnings.push('Fout bij verwerken van LLM response');
    }

    if (lines.length === 0) {
      warnings.push('Geen offerteregels gevonden in het bestand');
      console.log(`[LLM Parser] No lines found. Warnings:`, warnings);
    } else {
      console.log(`[LLM Parser] Successfully parsed ${lines.length} lines`);
    }

    return {
      lines,
      warnings,
    };
  } catch (error) {
    console.error('LLM parsing error:', error);
    return {
      lines: [],
      warnings: [
        `LLM parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}
