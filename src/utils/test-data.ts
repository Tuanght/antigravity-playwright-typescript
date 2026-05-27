export class TestDataGenerator {
  /**
   * Tạo email ngẫu nhiên có chứa timestamp và tiền tố dễ nhận biết
   */
  static getRandomEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}@orangehrm-tests.com`;
  }

  /**
   * Tạo chuỗi chữ ngẫu nhiên có độ dài cụ thể
   */
  static getRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  /**
   * Tạo số điện thoại ngẫu nhiên
   */
  static getRandomPhoneNumber(): string {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    return `09${randomDigits}`;
  }
}
