import { nameTokens, sameProduct, unaccent } from '@/domain/names';

describe('unaccent', () => {
  it('lowercases and removes Vietnamese accents', () => {
    expect(unaccent('Sữa Đặc')).toBe('sua dac');
    expect(unaccent('ĐƯỜNG')).toBe('duong');
    expect(unaccent('Crème')).toBe('creme');
  });
});

describe('nameTokens', () => {
  it('keeps meaningful words only', () => {
    expect([...nameTokens('Sữa tươi tiệt trùng 1L')].sort()).toEqual(['sua', 'tiet', 'trung', 'tuoi']);
  });
  it('drops sizes, one-letter words and stop words', () => {
    expect([...nameTokens('COMBO Bỉm quần XL12 a 500ml')]).toEqual(['bim', 'quan']);
  });
  it('splits on punctuation', () => {
    expect([...nameTokens('Phô-mai/Cheddar')].sort()).toEqual(['cheddar', 'mai', 'pho']);
  });
});

describe('sameProduct', () => {
  it('is true when one name contains all the words of the other', () => {
    expect(sameProduct('Sữa tươi 1L', 'Sữa tươi tiệt trùng Vinamilk')).toBe(true);
  });
  it('ignores accents and case', () => {
    expect(sameProduct('SUA TUOI', 'sữa tươi')).toBe(true);
  });
  it('is false for different products that share one word', () => {
    expect(sameProduct('Sữa tươi', 'Sữa chua')).toBe(false);
    expect(sameProduct('Sữa', 'Sữa tươi')).toBe(false);
  });
  it('is true for the same single word', () => {
    expect(sameProduct('Sữa', 'sữa 1L')).toBe(true);
  });
  it('uses similarity when neither name contains the other', () => {
    expect(sameProduct('Nước rửa chén Sunlight chanh', 'Nước rửa chén Sunlight trà')).toBe(true);
    expect(sameProduct('Nước rửa tay Lifebuoy', 'Nước rửa chén Sunlight chanh')).toBe(false);
  });
  it('falls back to comparing the text when there are no meaningful words', () => {
    expect(sameProduct('1L', '1l')).toBe(true);
    expect(sameProduct('1L', '2L')).toBe(false);
  });
});
