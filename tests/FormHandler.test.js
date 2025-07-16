const { handleSave } = require('../server/FormHandler');

describe('FormHandler', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should handle valid data with field', () => {
    const data = { field: 'test string' };
    handleSave(data);
    expect(consoleSpy).toHaveBeenCalledWith(11);
  });

  test('should handle null data', () => {
    handleSave(null);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is missing or null');
  });

  test('should handle undefined data', () => {
    handleSave(undefined);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is missing or null');
  });

  test('should handle data without field property', () => {
    const data = { otherField: 'value' };
    handleSave(data);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is missing or null');
  });

  test('should handle data with null field', () => {
    const data = { field: null };
    handleSave(data);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is missing or null');
  });
});
