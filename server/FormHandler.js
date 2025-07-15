function handleSave(data) {
  if (data && data.field && typeof data.field.length !== 'undefined') {
    console.log(data.field.length);
  } else {
    console.log('Invalid data: field is null or undefined');
  }
}

module.exports = { handleSave };
