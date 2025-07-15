function handleSave(data) {
  // Add null checks to prevent crashes
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Invalid data provided to handleSave');
  }
}

module.exports = { handleSave };
