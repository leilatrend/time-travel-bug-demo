function handleSave(data) {
  console.log(data.field.length); // 🐛 potential null pointer
}

module.exports = { handleSave };
