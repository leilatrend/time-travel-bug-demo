function handleSave(data) {
  if (data && data.field != null) {
    console.log(data.field.length);
  } else {
    console.log('field is missing');
  }
}

module.exports = { handleSave };
