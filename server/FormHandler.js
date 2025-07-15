function handleSave(data) {
  // Add null checks to prevent null pointer exception
  if (data && data.field && typeof data.field === 'string') {
    console.log(data.field.length);
  } else {
    console.log('Invalid data provided to handleSave');
  }
}

module.exports = { handleSave };
