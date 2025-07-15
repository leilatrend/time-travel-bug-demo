function handleSave(data) {
  if (data && data.field && data.field.length !== undefined) {
    console.log(data.field.length);
  } else {
    console.log('Field data is null or undefined');
  }
}

module.exports = { handleSave };
