const { handleSave } = require('./FormHandler');

// Mock console methods to capture outputs
let consoleLogSpy, consoleErrorSpy;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
});

afterEach(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});

describe('FormHandler', () => {
  describe('handleSave', () => {
    test('should log field length when data is valid', () => {
      const validData = { field: [1, 2, 3] };
      handleSave(validData);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(3);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should handle null data gracefully', () => {
      handleSave(null);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: data is null or undefined');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should handle undefined data gracefully', () => {
      handleSave(undefined);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: data is null or undefined');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should handle data with null field gracefully', () => {
      const dataWithNullField = { field: null };
      handleSave(dataWithNullField);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: data.field is null or undefined');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should handle data with undefined field gracefully', () => {
      const dataWithUndefinedField = { };
      handleSave(dataWithUndefinedField);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: data.field is null or undefined');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should handle data with field that has no length property', () => {
      const dataWithInvalidField = { field: {} };
      handleSave(dataWithInvalidField);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error: data.field does not have a length property');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    test('should handle string field with length', () => {
      const dataWithStringField = { field: 'hello' };
      handleSave(dataWithStringField);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(5);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('should handle empty array field', () => {
      const dataWithEmptyArray = { field: [] };
      handleSave(dataWithEmptyArray);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(0);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
