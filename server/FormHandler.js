function handleSave(data) {
  if (data && data.field) {
    console.log(data.field.length);
  } else {
    console.log('Field data is null or undefined');
  }
}

module.exports = { handleSave };
