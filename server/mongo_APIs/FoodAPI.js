const log = require('../../Logger');
const {c_UnregisteredAccountName} = require('../config');
const { Recipe } = require("../mongo_schemas/recipeSchema");


/* Responce to client:
{
  msg: "info message" // ( with error or with normal msg)
  status: <0=error  1=sucess>
}

done callback:
done(<msg>,<status>)

*/

function FoodAPI_Setup(app,Food) {
 
  function AddProduct(product,done) {
    let f = new Food(product);
    f.save((err,data)=>{
        if (err) {
          log.error(err);
          done(err.message,0);
        } else {
          log.info('Added Product:',data.name);
          done(`${data.name} added`,1);
        }    
      });
  };
  
  function UpdateProduct(targetId,newData,user,done) {
    log.debug("updating",targetId,user);
    Food.findOneAndUpdate( { _id: targetId, author: user } ,newData, (err,data)=>{
        if (err) {
          log.error(err);
          done(err.message,0);
        } else {
          (data)?
            done(`${data.name} was updated`,1)
            :done(`ProductID: ${targetId} (${newData.name}) of user ${user} not found`,0);
        }   
    })

  };
  
  function RemoveProduct(target,user,done) {
    log.debug("removing",target,user);

    Recipe.findOne({"productsList.product":target._id},(err, result)=>{
      if (err) {
        log.error(err);
        done(err.message, 0);
        return;
      }

      if (result){ // Product exists in recipe - soft deleting
        Food.findOneAndUpdate({ _id: target._id, author: user } ,{ _isDeleted: true }, (err,data)=>{
          if (err) {
            log.error(err);
            done(err.message,0);
          } else {
            (data)?
              done(`${data.name} was updated`,1)
              :done(`ProductID: ${target._id} (${newData.name}) of user ${user} not found`,0);
          }   
        })

      }
      else { // Hard remove
        Food.findOneAndRemove({ _id: target._id, author: user }, (err,data)=>{
          if (err) {
            log.error(err);
            done(err.message,0);
          } else {
            (data)?
              done(`${data.name} was removed`,1)
              :done(`${target.name} ${target.brand}of user ${user} not found`,0);
          }   
        });
      }

    })
  }
  
  app.post("/api/addp",(req,res)=>{
      let p =req.body;
      let u = req.session.userId;
      if (u) {
        p.author = u; 
      } else {  //we are doubling author.default key here, but anyway
        p.author = c_UnregisteredAccountName;
      }
      
      AddProduct(p,(msg,status)=>{
        res.json({msg: msg, status:status});
      });
    });
  
  app.post("/api/updatep",(req,res)=>{
      let p =req.body;
      let u = req.session.userId;
      if (!u) {
        u = c_UnregisteredAccountName;
      }

      let targetId = p._id;
      delete p._id;
      delete p.__v; 
      UpdateProduct(targetId,p,u,(msg,status)=>{
          res.json({msg: msg, status:status}); 
        })
    });
  
  app.post("/api/removep",(req,res)=>{
      let target =req.body;
      let u = req.session.userId;
      if (!u) {
        u = c_UnregisteredAccountName;
      }   

      RemoveProduct(target,u,(msg,status)=>{
          res.json({msg: msg, status:status}); 
        })
    });
  
  app.get("/api/getuserp",(req,res)=>{
      let u = req.session.userId;
      if (!u) {
        u = c_UnregisteredAccountName;
      }
      log.debug(`user ${u} requested products`);
      Food.find({author:u},(err,user_products)=>{
        if (err) {
          log.error(err);
          res.json({msg: "Error", status:0}); 
        } else {
          res.json({msg:user_products ,status:1});    
        }    
      });  
    });
  
  app.get("/api/getpubp",(req,res)=>{
      let u = req.session.userId;
      if (!u) {
        u = c_UnregisteredAccountName;
      } 
      log.debug(`user ${u} requested public products`);
      Food.find({author:{$ne: u},public:{$ne: false} },(err,pub_products)=>{
        if (err) {
          log.error(err);
          res.json({msg: "Error", status:0}); 
        } else {
          res.json({msg:pub_products ,status:1});    
        }    
      });  
    });

}

module.exports = { FoodAPI_Setup };