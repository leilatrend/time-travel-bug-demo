function handleSave(data) {
  if (data.field) {
    console.log(data.field.length);
  } else {
    console.log('No field value provided');
  }
}

module.exports = { handleSave };
