const bcrypt = require('bcrypt') ;
const session = require('express-session');
const log = require('../Logger');

/* Response to client:
{
  msg: "info message" 
  status: <0=error  1=sucess>
}

done callback:
done(<msg>,<status>)

*/

const AccountManagerSetup = (app, User) => {

  
    // function which check if user is logged in (with every call to server)
    app.use((req, res, next) => {
      res.locals.LOGGED_IN = req.session.userId ? true : false;
      res.locals.USER = req.session.userId;
      next();
    });

  // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 /* DEPRECIATED, using bcrypt instead
 const cyrb53 = (str, seed = 34) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }; */
  

  function usernameValidation(username) {
    const regex = /^[a-zA-Z0-9]{1,20}$/;
    return regex.test(username);
  }
 

  async function addUser(user, pass, done) {

    if (!usernameValidation(user)) {
      done("Wrong username. Max lenght is 20 characters and only letters and digits are allowed", 0);
      return;
    }
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    let newUser = new User({
      username: user,
      password: hashedPassword,

    });

    User.exists({
      username: user
    }, (err, result) => {

      if (err) {
        log.error(err);
        done("Error adding new user",0);
        return;
      }

      if (result) {
        done("User already exist",0);
        return;

      } 
      else {
        newUser.save((err, data) => {

          if (err) {
            log.error(err);
            done("Unknown registration error",0);
            return;
          }

          log.info(`user ${data.username} succesfully created`);
          done(`User ${data.username} succesfully created`,1);
        });
      }
    });

  }

  //////////

    function loginUser(login, pass, done) {
      if (!usernameValidation(login)) {
        done("Wrong username. Max lenght is 20 characters and only letters and digits are allowed",0);
        return;
      }

      if (pass == "") {
        done("Error. Password is empty.",0);
        return;
      }
      
      User.findOne({
        username: login
      })
      .then((data) => {
        bcrypt.compare(pass, data.password)
        .then(isMatching=>{
          if (isMatching) {
            done("Login successful!",1);
          } 
          else {
            done("Incorrect password",0);
          }
        })
        .catch(err=>{
          log.error(err);
          done("An error occurred during password comparison", 0);
        })
        
      })
      .catch(err=>{
        log.error(err);
        done("Username not found", 0);
      })
    }
  
    ////////////////////////////
    // API setup
    ////////////////////////////

    app.post('/api/login', (req, res) => {
      let login = req.body.user;
      let pass = req.body.password;

      loginUser(login, pass, (msg, status) => {
        
        if (status) {
          req.session.userId = login;
          log.debug(login," logged");
        }
        res.json({
            msg: msg,
            status: status
        });
        
      });
    });
  
    app.post('/api/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          log.error('Error destroying session:', err);
          res.json({
            msg: 'error',
            status: 0
          });
        } else {
          res.json({
            msg: 'You are now logged out',
            status: 1
          });
        }
      });
    });
  
    app.post('/api/register', (req, res) => {
      let login = req.body.user;
      let pass = req.body.password;
      
      if (!usernameValidation(login)) {
        res.json({
          msg: 'Username can contain only letters and numbers and max length is 20',
          status: 0
        });
        return;
      }
      addUser(login, pass, (msg, status) => {
        if (status){
          req.session.userId = login;
          log.info(`New user registered: ${login}` )
        }
        res.json({
          msg: msg,
          status: status
        });
      });
    });

    app.get("/api/islogged",(req,res)=>{
      let u = req.session.userId;
      console.log("Cookies from client:", req.headers.cookie);
      log.debug(u);
      const isLogged = u?true:false;
      res.json({
        isLogged: isLogged,
        userName: u
      });
      
    });
};


module.exports = {session, AccountManagerSetup};