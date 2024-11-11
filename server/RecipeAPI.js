const log = require('../Logger');
const {c_UnregisteredAccountName} = require('./config');


function RecipeAPI_Setup(app,Recipe){

    
  
  function AddRecipe(recipe,done) {
    let r = new Recipe(recipe);
    r.save((err,data)=>{
      if (err) {
          log.error(err);
          done(err.message,0);
        } else {
          log.info('Added recipe:',data.name);
          done(`Recipe ${data.name} added`,1);
        }   
    });
  }
  
  
  app.post("/api/addrecipe",(req,res)=>{
      let rec = req.body;
      let u = req.session.userId;
      if (u) {
        rec.author = u; 
      } else {  //we are doubling author.default key here, but anyway
        rec.author = c_UnregisteredAccountName;
      }      
 
      AddRecipe(rec,(msg,status)=>{
        res.json({msg: msg, status:status});
        });
    });
  
    function UpdateRecipe(targetId,newData,user,done) {
    
    Food.findOneAndUpdate({ _id: targetId, author: user },newData, (err,data)=>{
        if (err) {
          log.error( err.message);
          done(err.message,0);
        } else {
          (data)?
            done(`Recipe ${newData['name']} was updated`,1)
            :done(`RecipeID: ${targetId} (${newData.name}) of user ${user} not found`,0);
        }   
    })
  };

  
    app.post("/api/updaterecipe",(req,res)=>{
      let p =req.body;
      let u = req.session.userId;
      if (!u) {
        u = c_UnregisteredAccountName;
      }
      let targetId = p._id;
      delete p._id;
      delete p.__v; 
      UpdateRecipe(targetId,p,u,(msg,status)=>{
          res.json({msg: msg, status:status}); 
        })
    });
  
  //
  function RemoveRecipe(target,user,done) {
    
    Food.findOneAndRemove({ _id: target._id, author: user }, (err,data)=>{
        if (err) {
          log.error(err.message);
          done(err.message,0);
        } else {
          (data)?
            done(`Recipe ${data['name']} was removed`,1)
            :done(`Recipe ${target['name']} of user ${user} not found`,0);
        }   
    });
  }
  
  app.post("/api/removerecipe",(req,res)=>{
      let target =req.body;
      let u = req.session.userId;
      if (!u) {
        u = c_UnregisteredAccountName;
      }   
      RemoveRecipe(target,u,(msg,status)=>{
          res.json({msg: msg, status:status}); 
        })
    });

    app.get("/api/getuserr",(req,res)=>{
        let u = req.session.userId;
        if (!u) {
          u = c_UnregisteredAccountName;
        }
        log.debug(`user ${u} requested user recipes`);
        Recipe.find({author:u},(err,user_recipes)=>{
          if (err) {
            log.error(err);
          } else {
            res.json(user_recipes);    
          }    
        });  
      });
    
    app.get("/api/getpubr",(req,res)=>{
        let u = req.session.userId;
        if (!u) {
          u = c_UnregisteredAccountName;
        } 
        Recipe.find({author:{$ne: u},public:{$ne: false} },(err,products)=>{
          if (err) {
            log.error(err);
          } else {
            res.json(products);    
          }    
        });  
      });


}



module.exports = { RecipeAPI_Setup };