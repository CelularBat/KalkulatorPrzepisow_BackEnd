const log = require('../Logger');
function HelperAPI_Setup(app) {

    async function verifyIfImg(url) {
        return fetch(url, {method: 'GET'})
        .then( (res) => {
        if (!res.ok) {
            throw new Error("Network did not respond!");
        }
            const contentType = response.headers.get('Content-Type');
            return contentType && contentType.startsWith('image');
        })
        .catch( err=> {
            log.warn(err);
            return false;
        });  
    }

    app.post("/api/verifyimg",(req,res)=>{
        let img =req.body.img;

        verifyIfImg(img)
        .then( result =>
            res.json({result: result , status:1})
        )
        .catch( err =>{
            log.warn(err);
            res.json({result: "Error veryfying image" , status:0})
             }
            
        );
    })   
   
  }
  
  module.exports = { HelperAPI_Setup };