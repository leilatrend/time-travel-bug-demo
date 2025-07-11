function handleSave(data) {
  // Add null check to prevent null pointer exception on line 102
  if (data && data.field != null && data.field !== undefined) {
    console.log(data.field.length);
  } else {
    console.log(0); // Return 0 instead of null/undefined when field is not provided
  }
}

module.exports = { handleSave };
