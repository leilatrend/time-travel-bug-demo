const { handleSave } = require('./FormHandler');

describe('FormHandler', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should handle valid data with field having length property', () => {
    const validData = {
      field: 'test string'
    };
    
    handleSave(validData);
    expect(consoleSpy).toHaveBeenCalledWith(11);
  });

  test('should handle valid data with field as array', () => {
    const validData = {
      field: [1, 2, 3, 4, 5]
    };
    
    handleSave(validData);
    expect(consoleSpy).toHaveBeenCalledWith(5);
  });

  test('should handle null data gracefully', () => {
    handleSave(null);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is not available or invalid');
  });

  test('should handle undefined data gracefully', () => {
    handleSave(undefined);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is not available or invalid');
  });

  test('should handle data without field property', () => {
    const dataWithoutField = {
      otherProperty: 'test'
    };
    
    handleSave(dataWithoutField);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is not available or invalid');
  });

  test('should handle data with null field', () => {
    const dataWithNullField = {
      field: null
    };
    
    handleSave(dataWithNullField);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is not available or invalid');
  });

  test('should handle data with field having no length property', () => {
    const dataWithInvalidField = {
      field: { someProperty: 'value' }
    };
    
    handleSave(dataWithInvalidField);
    expect(consoleSpy).toHaveBeenCalledWith('Field data is not available or invalid');
  });
});
