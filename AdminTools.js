const fs = require("fs");

//EXAMPLE:
//  adm.RemoveAllExcept(Food, {author: ['test','NIEZALOG'],name: 'jajko'} );
// all exclusion parameters are OR
function RemoveAllExcept(Model,except) {
  var exceptQuery = {};
  for (let key in except){
    let negator = Array.isArray(except[key]) ? '$nin' : '$ne';
    exceptQuery[ `${key}`] = { [negator]: except[key] };
    }; 
  console.log(exceptQuery);
 
  Model.deleteMany(exceptQuery ,(err,data)=>{
    err?
      console.log(err):
      console.log(data);  
    });
}

// Function to test query without final deletion
function PrintAllExcept(Model,except) {
  var exceptQuery = {};
  for (let key in except){
    let negator = Array.isArray(except[key]) ? '$nin' : '$ne';
    exceptQuery[ `${key}`] = { [negator]: except[key] };
    }; 
  console.log(exceptQuery);
 
  Model.find(exceptQuery ,(err,data)=>{
    err?
      console.log(err):
      console.log(data);  
    });
}

// Function to import data
// Data format:
// name;kj;fat;carb;protein;fiber#
// file must be in utc-8

function importFoodFromFile(FoodModel,File,author,brand) {  
  try {
    const data = fs.readFileSync(File, 'utf-8');
    let arr =[];
    const rows = data.split("#");
    rows.forEach((x)=>{
      let a = x.split(";");
      arr.push(a);
      });
     
  if (arr) {
    jsonArr = [];
    arr.forEach((x)=>{
      let kjFromKcal = Math.round(x[2]*4.184);
      let a = {
        name: x[1],
        kcal: x[2],
        kj: kjFromKcal,
        fat: x[4],
        carb: x[5],
        protein: x[3],
        fiber: x[6],
        category: x[0],
        author: author,
        brand: brand       
      }
      jsonArr.push(a);
    });
    
    FoodModel.insertMany(jsonArr,(err,data)=>{
      err?
        console.log("Error: ",jsonArr,err)
        :console.log("Database added: ",data);
      });
  }
  
  } catch (err) {
    console.error(err);
  }
}

function AddLackingKeysToModel(Model,key,defaultValue=null){
  let filter = {[key]: {$exists: false}}
  console.log('adding lacking keys...',filter);
  
  Model.updateMany(filter,{[key]: defaultValue},(err,data)=>{
    err?
        console.log("Error: ",err)
        :console.log("Database added: ",data);  
  }); 
}

function FindAndReplaceAllDocs(Model,Filter,Key,ToFind,ReplaceWith) {
  console.log(`Changing all instances of ${Key}: "${ToFind}" with "${ReplaceWith}" in records fitting to query ${Filter}`);
  let query = __parseQueryArray(Filter);
  query[Key] =  ToFind;

  console.log(query);    
  Model.updateMany(query,{[Key]: ReplaceWith},(err,data)=>{
    err?
        console.log("Error: ",err)
        :console.log("Database added: ",data);  
  }); 
}

function __parseQueryArray(Query,doExclude = false) {
  var resultQuery= {};
  if (doExclude) {
    for (let key in Query){
      let negator = Array.isArray(Query[key]) ? '$nin' : '$ne';
      resultQuery[key] = { [negator]: Query[key] };
    }; 
  } else {
      for (let key in Query){
        if ( Array.isArray(Query[key]) ) {
            resultQuery[key] = { '$in': Query[key] };
        } else {
          resultQuery[key] = Query[key];  
        }    
      };   
  }
  return resultQuery;
}

module.exports = {
  RemoveAllExcept,
  PrintAllExcept,
  importFoodFromFile,
  AddLackingKeysToModel,
  FindAndReplaceAllDocs
}