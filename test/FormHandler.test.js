const { handleSave } = require('../server/FormHandler');

describe('FormHandler', () => {
  // Mock console.log to capture output
  let consoleLogSpy;
  
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test('should handle valid data with field', () => {
    const validData = { field: 'test data' };
    handleSave(validData);
    expect(consoleLogSpy).toHaveBeenCalledWith(9); // 'test data'.length = 9
  });

  test('should handle null data safely', () => {
    handleSave(null);
    expect(consoleLogSpy).toHaveBeenCalledWith('Field data is missing or null');
  });

  test('should handle undefined data safely', () => {
    handleSave(undefined);
    expect(consoleLogSpy).toHaveBeenCalledWith('Field data is missing or null');
  });

  test('should handle data without field property', () => {
    const dataWithoutField = { otherProperty: 'value' };
    handleSave(dataWithoutField);
    expect(consoleLogSpy).toHaveBeenCalledWith('Field data is missing or null');
  });

  test('should handle data with null field', () => {
    const dataWithNullField = { field: null };
    handleSave(dataWithNullField);
    expect(consoleLogSpy).toHaveBeenCalledWith('Field data is missing or null');
  });

  test('should handle empty string field', () => {
    const dataWithEmptyField = { field: '' };
    handleSave(dataWithEmptyField);
    expect(consoleLogSpy).toHaveBeenCalledWith(0); // empty string length = 0
  });
});
