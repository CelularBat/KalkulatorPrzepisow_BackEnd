const fs = require("fs");

/**
 * Remove all documents from a model except those matching the specified criteria.
 * @param {mongoose.Model} Model - The Mongoose model to operate on.
 * @param {Object} except - Fields and values to exclude from deletion.
 */
function RemoveAllExcept(Model, except) {
  const query = __parseQueryArray(except, true); 
  console.log(`[RemoveAllExcept] Model: ${Model.modelName}, excluding documents matching:`, query);
  Model.deleteMany(query, (err, data) => {
    if (err) console.error(`[RemoveAllExcept] Error removing documents:`, err);
    else console.log(`[RemoveAllExcept] Removed documents count:`, data.deletedCount);
  });
}

/**
 * Print all documents from a model except those matching the specified criteria.
 * @param {mongoose.Model} Model - The Mongoose model to query.
 * @param {Object} except - Fields and values to exclude from the result.
 */
function PrintAllExcept(Model, except) {
  const query = __parseQueryArray(except, true);
  console.log(`[PrintAllExcept] Model: ${Model.modelName}, documents excluding:`, query);
  Model.find(query, (err, data) => {
    if (err) console.error(`[PrintAllExcept] Error fetching documents:`, err);
    else console.log(`[PrintAllExcept] Documents:`, data);
  });
}

/**
 * Remove all documents matching the specified filter.
 * @param {mongoose.Model} Model - The Mongoose model to operate on.
 * @param {Object} filter - Fields and values to match for deletion.
 */
function RemoveAllMatching(Model, filter) {
  const query = __parseQueryArray(filter, false); 
  console.log(`[RemoveAllMatching] Model: ${Model.modelName}, removing documents matching:`, query);
  Model.deleteMany(query, (err, data) => {
    if (err) console.error(`[RemoveAllMatching] Error removing documents:`, err);
    else console.log(`[RemoveAllMatching] Removed documents count:`, data.deletedCount);
  });
}

/**
 * Print all documents matching the specified filter.
 * @param {mongoose.Model} Model - The Mongoose model to query.
 * @param {Object} filter - Fields and values to match.
 */
function PrintAllMatching(Model, filter) {
  const query = __parseQueryArray(filter, false);
  console.log(`[PrintAllMatching] Model: ${Model.modelName}, documents matching:`, query);
  Model.find(query, (err, data) => {
    if (err) console.error(`[PrintAllMatching] Error fetching documents:`, err);
    else console.log(`[PrintAllMatching] Documents:`, data);
  });
}

/**
 * Add a missing key with a default value to all documents in a model.
 * @param {mongoose.Model} Model - The Mongoose model to update.
 * @param {string} key - The field name to add if missing.
 * @param {*} [defaultValue=null] - The default value to set for missing keys.
 */
function AddLackingKeysToModel(Model, key, defaultValue = null) {
  const filter = { [key]: { $exists: false } };
  console.log(`[AddLackingKeysToModel] Model: ${Model.modelName}, adding missing key "${key}" with default:`, defaultValue);
  Model.updateMany(filter, { [key]: defaultValue }, (err, data) => {
    if (err) console.error(`[AddLackingKeysToModel] Error updating documents:`, err);
    else console.log(`[AddLackingKeysToModel] Updated documents count:`, data.modifiedCount);
  });
}

/**
 * Replace a field value in all documents matching a filter.
 * @param {mongoose.Model} Model - The Mongoose model to update.
 * @param {Object} Filter - Filter to select documents.
 * @param {string} Key - The field name to replace.
 * @param {*} ToFind - The current value to find.
 * @param {*} ReplaceWith - The value to replace with.
 */
function ReplaceKeyInAllDocs(Model, Filter, Key, ToFind, ReplaceWith) {
  const query = __parseQueryArray(Filter, false);
  query[Key] = ToFind;
  console.log(`[ReplaceKeyInAllDocs] Model: ${Model.modelName}, replacing ${Key}="${ToFind}" with "${ReplaceWith}" in documents matching:`, query);
  Model.updateMany(query, { [Key]: ReplaceWith }, (err, data) => {
    if (err) console.error(`[ReplaceKeyInAllDocs] Error updating documents:`, err);
    else console.log(`[ReplaceKeyInAllDocs] Updated documents count:`, data.modifiedCount);
  });
}

/**
 * Import food data from a file into a model.
 * File format: "category;name;kcal;protein;fat;carb;fiber#" (UTF-8)
 * @param {mongoose.Model} FoodModel - The Mongoose model to insert data into.
 * @param {string} File - Path to the file to import.
 * @param {string} author - Author to assign to all inserted documents.
 * @param {string} brand - Brand to assign to all inserted documents.
 */
function importFoodFromFile(FoodModel, File, author, brand) {  
  try {
    const data = fs.readFileSync(File, 'utf-8');
    const rows = data.split("#").map(row => row.split(";"));
    
    const jsonArr = rows.map(x => ({
      category: x[0],
      name: x[1],
      kcal: parseFloat(x[2]),
      kj: Math.round(parseFloat(x[2]) * 4.184),
      protein: parseFloat(x[3]),
      fat: parseFloat(x[4]),
      carb: parseFloat(x[5]),
      fiber: parseFloat(x[6]),
      author,
      brand
    }));
    
    console.log(`[importFoodFromFile] Model: ${FoodModel.modelName}, importing ${jsonArr.length} documents from file: ${File}`);
    FoodModel.insertMany(jsonArr, (err, data) => {
      if (err) console.error(`[importFoodFromFile] Error inserting documents:`, err);
      else console.log(`[importFoodFromFile] Successfully added documents:`, data.length);
    });

  } catch (err) {
    console.error(`[importFoodFromFile] Error reading or processing file:`, err);
  }
}

/**
 * Helper to parse a query object for inclusion/exclusion filters.
 * @param {Object} Query - Object where keys are field names and values are desired values/arrays.
 * @param {boolean} [doExclude=false] - Whether to invert the match (exclude values).
 * @returns {Object} - MongoDB query object suitable for find/update/delete.
 */
function __parseQueryArray(Query, doExclude = false) {
  const resultQuery = {};
  if (doExclude) {
    for (let key in Query) {
      const negator = Array.isArray(Query[key]) ? '$nin' : '$ne';
      resultQuery[key] = { [negator]: Query[key] };
    }
  } else {
    for (let key in Query) {
      resultQuery[key] = Array.isArray(Query[key]) ? { '$in': Query[key] } : Query[key];
    }
  }
  return resultQuery;
}

module.exports = {
  RemoveAllExcept,
  PrintAllExcept,
  RemoveAllMatching,
  PrintAllMatching,
  AddLackingKeysToModel,
  ReplaceKeyInAllDocs,
  importFoodFromFile
};
