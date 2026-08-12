import { describe, it, expect } from 'vitest';
import { sanitizeText, validateQuoteInput } from '@/services/quotes';

describe('Quote Input Validation & Sanitization Service', () => {
  it('should sanitize extra whitespace and trim strings', () => {
    const raw = '   Halo    dunia   kutipan   ';
    expect(sanitizeText(raw)).toBe('Halo dunia kutipan');
  });

  it('should truncate strings exceeding maxLength', () => {
    const longText = 'a'.repeat(2000);
    expect(sanitizeText(longText, 500).length).toBe(500);
  });

  it('should throw error when quote content is empty', () => {
    expect(() => validateQuoteInput({ content: '   ' })).toThrow('Isi kutipan tidak boleh kosong');
  });

  it('should throw error when quote content exceeds 1000 characters', () => {
    const longQuote = 'x'.repeat(1001);
    expect(() => validateQuoteInput({ content: longQuote })).toThrow('Kutipan terlalu panjang');
  });

  it('should throw error when song title or artist exceeds 150 characters', () => {
    const longSong = 's'.repeat(151);
    expect(() => validateQuoteInput({ content: 'Valid quote', song_title: longSong })).toThrow('Judul lagu terlalu panjang');
    expect(() => validateQuoteInput({ content: 'Valid quote', song_artist: longSong })).toThrow('Nama penyanyi terlalu panjang');
  });

  it('should pass validation for valid inputs', () => {
    expect(() =>
      validateQuoteInput({
        content: 'Hidup adalah seni menggambar tanpa penghapus.',
        song_title: 'Matahari',
        song_artist: 'Feast'
      })
    ).not.toThrow();
  });
});
