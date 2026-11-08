import type { CategoryId } from './types';

/**
 * Guess a category from a product name. The app is used in Vietnamese and English,
 * so the keyword lists mix both. Accented words are why "\b" word boundaries do not work here:
 * in JavaScript regexes \b only knows ASCII letters.
 */

/** Order matters: "bim bim" (snack) must be tested before "bim" (diaper), "áo len" (clothes) before "len" (yarn)... */
export const GUESS_ORDER: readonly CategoryId[] = [
  'snack', 'baby', 'clothes', 'care', 'cleaning', 'meds', 'electronics', 'tools', 'stationery', 'yarn',
  'drinks', 'dairy', 'produce', 'pantry',
];

export const KEYWORDS: Partial<Record<CategoryId, readonly string[]>> = {
  snack: ['bim bim', 'bimbim', 'snack', 'kẹo', 'socola', 'sô cô la', 'bánh quy', 'bánh gạo', 'bánh kẹo', 'bánh ngọt', 'bánh bông lan', 'hạt điều', 'hạt hướng dương', 'hạt dẻ', 'mứt', 'khô bò', 'khô gà', 'khoai tây chiên', 'trái cây sấy', 'cookie', 'cookies', 'biscuit', 'biscuits', 'chocolate', 'candy', 'chips', 'chip', 'nuts', 'cracker', 'wafer', 'gummy', 'popcorn'],
  baby: ['bỉm', 'bim', 'tã', 'diaper', 'sữa bột', 'em bé', 'baby', 'trẻ em', 'khăn ướt'],
  clothes: ['áo', 'quần', 'váy', 'đầm', 'giày', 'dép', 'tất', 'vớ', 'nón', 'mũ', 'găng tay', 'khẩu trang', 'shirt', 't-shirt', 'dress', 'jeans', 'shoes', 'shoe', 'sneakers', 'sneaker', 'jacket', 'hoodie', 'sock', 'socks', 'pants'],
  care: ['shampoo', 'soap', 'lotion', 'hand cream', 'toothpaste', 'deodorant', 'conditioner', 'sunscreen', 'lipstick', 'makeup', 'perfume', 'foundation', 'mascara', 'serum', 'eyeliner', 'son', 'phấn', 'nước hoa', 'toner', 'tẩy trang', 'mặt nạ', 'cushion', 'má hồng', 'kẻ mày', 'dưỡng da', 'kem nền', 'kem lót', 'chống nắng', 'mỹ phẩm', 'sữa tắm', 'dầu gội', 'dầu xả', 'kem đánh răng', 'xà phòng', 'sữa rửa mặt', 'kem dưỡng'],
  cleaning: ['detergent', 'cleaner', 'spray', 'bleach', 'sponge', 'dish', 'laundry', 'nước rửa', 'nước lau', 'nước giặt', 'tẩy', 'xịt', 'giấy vệ sinh', 'giấy ăn', 'khăn giấy'],
  meds: ['vitamin', 'ibuprofen', 'paracetamol', 'tablet', 'medicine', 'syrup', 'pill', 'supplement', 'thuốc', 'viên', 'siro'],
  electronics: ['cable', 'battery', 'batteries', 'earbuds', 'earbud', 'charger', 'mouse', 'usb', 'phone', 'lamp', 'speaker', 'cáp', 'sạc', 'pin', 'chuột', 'tai nghe', 'loa'],
  tools: ['búa', 'kìm', 'tua vít', 'tô vít', 'cờ lê', 'mỏ lết', 'khoan', 'cưa', 'thước dây', 'đinh', 'ốc vít', 'băng keo', 'keo dán', 'dụng cụ', 'đồ nghề', 'hammer', 'wrench', 'screwdriver', 'drill', 'pliers', 'tape measure', 'toolbox'],
  stationery: ['bút', 'vở', 'sổ', 'giấy', 'kẹp giấy', 'ghim', 'bìa', 'thước kẻ', 'thước', 'bút chì', 'bút bi', 'bút lông', 'băng dính', 'bấm kim', 'văn phòng phẩm', 'notebook', 'pencil', 'pen', 'pens', 'stapler', 'highlighter', 'marker', 'sticky note'],
  yarn: ['len', 'sợi len', 'kim đan', 'móc len', 'kim móc', 'đan len', 'cuộn len', 'sợi bông', 'sợi cotton', 'yarn', 'knitting', 'crochet'],
  drinks: ['juice', 'water', 'soda', 'cola', 'beer', 'wine', 'tea', 'coffee', 'drink', 'nước ngọt', 'nước suối', 'nước cam', 'nước dừa', 'bia', 'trà', 'phê', 'nước ép', 'sinh tố', 'matcha'],
  dairy: ['milk', 'cheese', 'yogurt', 'yoghurt', 'butter', 'egg', 'eggs', 'cream', 'sữa', 'trứng', 'phô mai', 'bơ', 'sữa chua'],
  produce: ['banana', 'apple', 'spinach', 'lettuce', 'tomato', 'fruit', 'veg', 'vegetables', 'berry', 'berries', 'carrot', 'onion', 'potato', 'salad', 'orange', 'rau', 'trái cây', 'táo', 'chuối', 'cà chua', 'cam', 'dâu'],
  pantry: ['pasta', 'rice', 'bread', 'flour', 'sugar', 'oil', 'sauce', 'cereal', 'noodle', 'noodles', 'canned', 'beans', 'gạo', 'mì', 'dầu ăn', 'bánh', 'bánh mì', 'nước mắm', 'đường', 'bột'],
};

/**
 * Build a case-insensitive regex that matches any of `words` as WHOLE words, accents included.
 * 'bơ' must match in 'Bơ lạt' and 'bơ' but NOT inside 'bơm'. Regex special characters in a word
 * (like the '-' in 't-shirt' or a '.') must be escaped. Use the `u` flag and \p{L} / \p{N}.
 */
export function makeWordRegex(words: readonly string[]): RegExp {
  // TODO: Escape each word (replace /[.*+?^${}()|[\]\\]/g with '\\$&'), join with '|', and wrap:
  //       (^|[^\p{L}\p{N}])(...)([^\p{L}\p{N}]|$) with flags 'iu'.
  throw new Error('Not implemented yet');
}

/** Walk GUESS_ORDER; the first category whose keywords match the name wins. Nothing matches: 'other'. */
export function guessCategory(name: string): CategoryId {
  // TODO: For each id in GUESS_ORDER look up KEYWORDS[id], build the regex (build it once per
  //       category and cache it in a Map, regex construction is not free), and test the name.
  throw new Error('Not implemented yet');
}

const regexCache = new Map<CategoryId, RegExp>();
