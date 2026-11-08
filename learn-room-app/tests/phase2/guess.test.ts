import { guessCategory, makeWordRegex } from '@/domain/guess';

describe('makeWordRegex', () => {
  const re = { test: (text: string) => makeWordRegex(['bơ', 'sữa chua', 't-shirt']).test(text), get flags() { return makeWordRegex(['x']).flags; } };
  it('matches whole words, accents included', () => {
    expect(re.test('Bơ lạt')).toBe(true);
    expect(re.test('mua bơ')).toBe(true);
    expect(re.test('Sữa chua Vinamilk')).toBe(true);
  });
  it('does not match inside a longer word', () => {
    expect(re.test('bơm xe')).toBe(false);
    expect(re.test('abơ')).toBe(false);
  });
  it('escapes special characters', () => {
    expect(re.test('white T-Shirt')).toBe(true);
    expect(makeWordRegex(['a.b']).test('axb')).toBe(false);
  });
  it('is case-insensitive and unicode aware', () => {
    expect(re.flags).toContain('i');
    expect(re.flags).toContain('u');
    expect(re.test('BƠ')).toBe(true);
  });
});

describe('guessCategory', () => {
  it.each([
    ['Sữa tươi Vinamilk', 'dairy'],
    ['Whole milk 1L', 'dairy'],
    ['Bỉm Huggies', 'baby'],
    ['Bim bim Oishi', 'snack'], // snack is checked before baby
    ['Áo len cổ lọ', 'clothes'], // clothes is checked before yarn
    ['Cuộn len xanh', 'yarn'],
    ['Dầu gội Clear', 'care'],
    ['Nước rửa chén', 'cleaning'],
    ['Vitamin C', 'meds'],
    ['Cáp sạc nhanh', 'electronics'],
    ['Bút bi Thiên Long', 'stationery'],
    ['Cà phê sữa đá', 'drinks'],
    ['Chuối 1kg', 'produce'],
    ['Gạo ST25', 'pantry'],
  ])('%s -> %s', (name, cat) => {
    expect(guessCategory(name)).toBe(cat);
  });
  it('falls back to other', () => {
    expect(guessCategory('Xyzzy')).toBe('other');
    expect(guessCategory('')).toBe('other');
  });
  it('does not match a keyword inside another word', () => {
    expect(guessCategory('Bơm xe đạp')).toBe('other');
  });
});
