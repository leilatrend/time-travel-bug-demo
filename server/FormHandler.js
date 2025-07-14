function handleSave(data) {
  // Modern ES2020+ approach with optional chaining and nullish coalescing
  const fieldLength = data?.field?.length ?? 0;
  console.log(fieldLength);
}

module.exports = { handleSave };
