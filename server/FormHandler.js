function handleSave(data) {
  // Add null checks to prevent crashes
  if (!data || !data.field) {
    console.log('Invalid data provided');
    return;
  }
  
  console.log(data.field.length);
}

module.exports = { handleSave };
