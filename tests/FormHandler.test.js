const { handleSave } = require('../server/FormHandler');

// Mock console.log to capture output
let consoleOutput = [];
console.log = jest.fn((...args) => {
  consoleOutput.push(args.join(' '));
});

describe('FormHandler', () => {
  beforeEach(() => {
    consoleOutput = [];
    console.log.mockClear();
  });

  test('should handle valid data with field length', () => {
    const validData = {
      field: [1, 2, 3, 4, 5]
    };
    
    handleSave(validData);
    
    expect(console.log).toHaveBeenCalledWith(5);
    expect(consoleOutput).toContain('5');
  });

  test('should handle null data gracefully', () => {
    handleSave(null);
    
    expect(console.log).toHaveBeenCalledWith('Field data is not available or invalid');
    expect(consoleOutput).toContain('Field data is not available or invalid');
  });

  test('should handle undefined data gracefully', () => {
    handleSave(undefined);
    
    expect(console.log).toHaveBeenCalledWith('Field data is not available or invalid');
    expect(consoleOutput).toContain('Field data is not available or invalid');
  });

  test('should handle data without field property', () => {
    const dataWithoutField = {
      name: 'test',
      value: 'some value'
    };
    
    handleSave(dataWithoutField);
    
    expect(console.log).toHaveBeenCalledWith('Field data is not available or invalid');
    expect(consoleOutput).toContain('Field data is not available or invalid');
  });

  test('should handle data with null field', () => {
    const dataWithNullField = {
      field: null
    };
    
    handleSave(dataWithNullField);
    
    expect(console.log).toHaveBeenCalledWith('Field data is not available or invalid');
    expect(consoleOutput).toContain('Field data is not available or invalid');
  });

  test('should handle empty field array', () => {
    const dataWithEmptyField = {
      field: []
    };
    
    handleSave(dataWithEmptyField);
    
    expect(console.log).toHaveBeenCalledWith(0);
    expect(consoleOutput).toContain('0');
  });

  test('should handle field with string', () => {
    const dataWithStringField = {
      field: 'hello'
    };
    
    handleSave(dataWithStringField);
    
    expect(console.log).toHaveBeenCalledWith(5);
    expect(consoleOutput).toContain('5');
  });
});
