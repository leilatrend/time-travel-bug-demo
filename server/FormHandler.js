function handleSave(data) {
  const fieldLen = (data && data.field) ? data.field.length : 0;
  console.log(fieldLen); // 🐋 safe now!
}
module.exports = { handleSave };
