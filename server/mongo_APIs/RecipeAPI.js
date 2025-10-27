const log = require('../../Logger');
const {c_UnregisteredAccountName} = require('../config');


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

  function RemoveRecipe(target,user,done) {
    Recipe.findOneAndRemove({ _id: target._id, author: user }, (err,data)=>{
        if (err) {
          log.error(err.message);
          done(err.message,0);
        } 
        else if (data) {
            
            done(`Recipe ${data['name']} was removed`,1)
        }   
        else {
          done(`Recipe ${target['name']} of user ${user} not found`,0);
        }
    });
  }

  function UpdateRecipe(targetId,newData,user,done) {
    Recipe.findOneAndUpdate({ _id: targetId, author: user },newData, (err,data)=>{
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
  
  
  app.post("/api/addrecipe",(req,res)=>{
      let rec = req.body;
      let u = req.session.userId || c_UnregisteredAccountName;
      rec.author = u;     
 
      AddRecipe(rec,(msg,status)=>{
        res.json({msg: msg, status:status});
        });
    });
  
    app.post("/api/updaterecipe",(req,res)=>{
      let rec =req.body;
      let u = req.session.userId || c_UnregisteredAccountName;

      let targetId = rec._id;
      delete rec._id;
      delete rec.__v; 
      UpdateRecipe(targetId,rec,u,(msg,status)=>{
          res.json({msg: msg, status:status}); 
        })
    });
  
  //

  
    app.post("/api/removerecipe",(req,res)=>{
      let target =req.body;
      let u = req.session.userId || c_UnregisteredAccountName;

      RemoveRecipe(target,u,(msg,status)=>{
          res.json({msg: msg, status:status}); 
        })
    });

    app.get("/api/getuserr",(req,res)=>{
        let u = req.session.userId || c_UnregisteredAccountName;

        log.debug(`user ${u} requested user recipes`);
        Recipe.find({author:u},(err,user_recipes)=>{
          if (err) {
            log.error(err);
            res.json({msg: "Error", status:0}); 
          } else {
            res.json({msg:user_recipes ,status: 1});    
          }    
        });  
      });
    
    app.get("/api/getpubr",(req,res)=>{
        let u = req.session.userId || c_UnregisteredAccountName;
        
        Recipe.find({author:{$ne: u},public:{$ne: false} },(err,pub_recipes)=>{
          if (err) {
            log.error(err);
            res.json({msg: "Error", status:0}); 
          } else {
            res.json({msg:pub_recipes ,status: 1});    
          }    
        });  
      });


}



module.exports = { RecipeAPI_Setup };