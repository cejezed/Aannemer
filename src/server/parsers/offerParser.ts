/**
 * Offer file parsers for PDF, DOCX, and XLSX
 */

import type { OfferParseResult } from './types';
import { parseOfferWithLLM } from './llmParser';

/**
 * Parse PDF offer file
 * Uses pdfjs-dist to extract text, then LLM for structuring
 */
export async function parsePdfOffer(fileBuffer: Buffer): Promise<OfferParseResult> {
  try {
    console.log(`[PDF Parser] Parsing PDF, buffer size: ${fileBuffer.length} bytes`);

    // Import pdfjs-dist (version 5.x uses different exports)
    const pdfjsLib = await import('pdfjs-dist');

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileBuffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    console.log(`[PDF Parser] PDF has ${numPages} pages`);

    // Extract text from all pages
    let rawText = '';
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      rawText += pageText + '\n\n';
    }

    console.log(`[PDF Parser] Extracted ${rawText.length} characters from ${numPages} pages`);

    if (!rawText || rawText.trim().length === 0) {
      console.log('[PDF Parser] No text extracted from PDF');
      return {
        lines: [],
        warnings: ['PDF bevat geen leesbare tekst'],
      };
    }

    return await parseOfferWithLLM(rawText, 'pdf');
  } catch (error) {
    console.error('PDF parse error:', error);
    return {
      lines: [],
      warnings: [
        `Fout bij lezen PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

/**
 * Parse DOCX offer file
 * Uses mammoth to extract text, then LLM for structuring
 */
export async function parseDocxOffer(fileBuffer: Buffer): Promise<OfferParseResult> {
  try {
    console.log(`[DOCX Parser] Parsing DOCX, buffer size: ${fileBuffer.length} bytes`);
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer: fileBuffer });

    const rawText = result.value;
    console.log(`[DOCX Parser] Extracted ${rawText.length} characters`);

    if (!rawText || rawText.trim().length === 0) {
      console.log('[DOCX Parser] No text extracted from DOCX');
      return {
        lines: [],
        warnings: ['DOCX bevat geen leesbare tekst'],
      };
    }

    const warnings: string[] = [];
    if (result.messages.length > 0) {
      warnings.push(...result.messages.map(m => m.message));
    }

    const parseResult = await parseOfferWithLLM(rawText, 'docx');

    return {
      lines: parseResult.lines,
      warnings: [...warnings, ...parseResult.warnings],
    };
  } catch (error) {
    console.error('DOCX parse error:', error);
    return {
      lines: [],
      warnings: [
        `Fout bij lezen DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}

/**
 * Parse XLSX offer file
 * Uses xlsx to extract cells, then LLM for structuring
 */
export async function parseXlsxOffer(fileBuffer: Buffer): Promise<OfferParseResult> {
  try {
    console.log(`[XLSX Parser] Parsing XLSX, buffer size: ${fileBuffer.length} bytes`);
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      console.log('[XLSX Parser] No sheets found in Excel file');
      return {
        lines: [],
        warnings: ['Excel bestand bevat geen sheets'],
      };
    }

    console.log(`[XLSX Parser] Reading sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];

    // Convert to CSV for easier text processing
    const csvText = XLSX.utils.sheet_to_csv(sheet);

    if (!csvText || csvText.trim().length === 0) {
      console.log('[XLSX Parser] Sheet contains no data');
      return {
        lines: [],
        warnings: ['Excel sheet bevat geen data'],
      };
    }

    // Also try to convert to JSON for structured data
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`[XLSX Parser] Extracted ${jsonData.length} rows, CSV length: ${csvText.length} chars`);

    // Build a text representation including both CSV and some structure hints
    let rawText = `Excel sheet: ${sheetName}\n\n`;
    rawText += `CSV data:\n${csvText}\n\n`;

    if (jsonData.length > 0) {
      rawText += `Eerste 10 rijen:\n${JSON.stringify(jsonData.slice(0, 10), null, 2)}`;
    }

    return await parseOfferWithLLM(rawText, 'xlsx');
  } catch (error) {
    console.error('XLSX parse error:', error);
    return {
      lines: [],
      warnings: [
        `Fout bij lezen Excel: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }
}
