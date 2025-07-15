function handleSave(data) {
  if (data && data.field && typeof data.field.length === 'number') {
    console.log(data.field.length);
  } else {
    console.log('Invalid input: field is missing or not countable');
  }
}

module.exports = { handleSave };
