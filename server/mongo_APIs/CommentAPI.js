const log = require('../../Logger');
const {c_UnregisteredAccountName} = require('../config');

/* Responce to client:
{
  msg: "info message" // ( with error or with normal msg)
  status: <0=error  1=sucess>
}

done callback:
done(<msg>,<status>)
*/

function CommentAPI_Setup(app,Comment){

    function AddComment(comment,done){
        let c = new Comment(comment);
        c.save( (err,data)=>{
            if (err) {
                log.error(err);
                done(err.message,0);
            } 
            else {
                log.info('Added Comment');
                done(`Comment added`,1);
            }  
        })
    }

    function UpdateComment(targetId,newData,user,done) {
        log.debug("updating comment ",targetId,user);
        Comment.findOneAndUpdate( { _id: targetId, author: user } ,newData, (err,data)=>{
            if (err) {
              log.error(err);
              done(err.message,0);
            } 
            else {
              (data)?
                done(`Comment was updated`,1)
                :done(`Comment Id: ${targetId} of user ${user} not found`,0);
            }   
        })
    
    };

    function RemoveComment(targetId, user, done) {
      log.debug("removing comment", targetId, user);
  
      Comment.findOne({ _id: targetId, author: user }, async (err, result) => {
          if (err) {
              log.error(err);
              done(err.message, 0);
              return;
          }
  
          if (!result) {
              done(`Comment Id: ${targetId} of user ${user} not found`, 0);
              return;
          }
  
          try {
              const hasReplies = await Comment.exists({ responseTo: targetId, _isDeleted: false });
  
              if (hasReplies) {
                  // Soft delete
                  Comment.findOneAndUpdate(
                      { _id: targetId, author: user },
                      { _isDeleted: true, text: "Comment deleted" },
                      (err, data) => {
                          if (err) {
                              log.error(err);
                              done(err.message, 0);
                          } else {
                              data
                                  ? done(`Comment was soft removed (has replies)`, 1)
                                  : done(`Comment Id: ${targetId} of user ${user} not found`, 0);
                          }
                      }
                  );
              } else {
                  // Hard delete
                  Comment.findOneAndRemove({ _id: targetId, author: user }, (err, data) => {
                      if (err) {
                          log.error(err);
                          done(err.message, 0);
                      } else {
                          data
                              ? done(`Comment was removed`, 1)
                              : done(`Comment Id: ${targetId} of user ${user} not found`, 0);
                      }
                  });
              }
          } catch (checkErr) {
              log.error(checkErr);
              done(checkErr.message, 0);
          }
      });
  }
  

    app.post("/api/addcomment", (req, res) => {
    const c = req.body;
    const u = req.session.userId || c_UnregisteredAccountName;
    c.author = u;

    AddComment(c, (msg, status) => {
      res.json({ msg, status });
    });
  });

  app.post("/api/updatecomment", (req, res) => {
    const c = req.body;
    const u = req.session.userId || c_UnregisteredAccountName;
    const targetId = c._id;
    delete c._id;
    delete c.__v;

    UpdateComment(targetId, c, u, (msg, status) => {
      res.json({ msg, status });
    });
  });

  app.post("/api/removecomment", (req, res) => {
    const targetId = req.body._id;
    const u = req.session.userId || c_UnregisteredAccountName;

    RemoveComment(targetId, u, (msg, status) => {
      res.json({ msg, status });
    });
  });

  app.post("/api/getrecipecomments", (req, res) => {
    const { recipeId } = req.body;
    if (!recipeId) {
      res.json({ msg: "Missing recipeId", status: 0 });
      return;
    }
  
    log.debug(`requesting comments for recipe ${recipeId}`);
  
    Comment.find({ recipeId: recipeId })
      .sort({ createdAt: 1 })
      .exec((err, comments) => {
        if (err) {
          log.error(err);
          res.json({ msg: "Error", status: 0 });
        } else {
          res.json({ msg: comments, status: 1 });
        }
      });
  });

  app.post("/api/getrecipecommentscount", (req, res) => {
    const { recipeId } = req.body;
    if (!recipeId) {
        res.json({ msg: "Missing recipeId", status: 0 });
        return;
    }

    log.debug(`requesting comment count for recipe ${recipeId}`);

    Comment.countDocuments({ recipeId: recipeId }, (err, count) => {
        if (err) {
            log.error(err);
            res.json({ msg: "Error", status: 0 });
        } else {
            res.json({ msg: count, status: 1 });
        }
    });
});









}

module.exports = {CommentAPI_Setup};