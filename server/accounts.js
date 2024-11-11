var session = require('express-session');

const AccountManagerSetup = (app, User) => {

  // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
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
  };
  ///////////

  function usernameValidation(username) {
    const regex = /^[a-zA-Z0-9]{1,20}$/;
    return regex.test(username);
  }
  //////////

  function addUser(user, pass, done) {
    let hashPas = cyrb53(pass);
    let u = new User({
      username: user,
      password: hashPas
    });

    User.exists({
      username: user
    }, (err, result) => {
      if (result) {
        done("User already exist", {
          status: 0
        });
        return;
      } else {
        u.save((err, data) => {
          if (err) {
            console.log(err);
            done("Unknown registration error", {
              status: 0
            });
            return;
          }
          console.log(`user $ {
            data['username']
          }
          succesfully created`);
          done(null, {
            status: 1
          });
        });
      }
    });

  }

  //////////

    function loginUser(login, pass, done) {
      if (!usernameValidation(login)) {
        done("wrong user", {
          status: 0
        });
        return;
      }
      if (pass == "") {
        done("empty password", {
          status: 0
        });
        return;
      }
  
      let hashPas = cyrb53(pass);
      User.exists({
        username: login,
        password: hashPas
      }).then((result) => {
        if (result) {
          done("Login success!", {
            status: 1
          });
          return;
        } else {
          done("wrong username or password", {
            status: 0
          });
          return;
        }
      });
    }
    //////////
    // Sessios setup  
    app.use(session({
      name: 'session-cookie',
      secret: 'my-secret-key',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false
      }
    }));
  
    app.set('trust proxy', 1);
  
    // function which check if (user is logged in with every call) 
    app.use((req, res, next) => {
      res.locals.LOGGED_IN = req.session.userId ? true : false;
      res.locals.USER = req.session.userId;
      next();
    });
  
    // api setup
    app.post('/api/login', (req, res) => {
      let login = req.body.user;
      let pass = req.body.password;
      loginUser(login, pass, (err, st) => {
        let x = st['status'];
        if (x) {
          req.session.userId = login;
          res.json({
            error: 'You are now logged in!',
            status: x
          });
        } else {
          res.json({
            error: err,
            status: x
          });
        }
      });
    });
  
    app.post('/api/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          console.error('Error destroying session:', err);
        } else {
          res.json({msg: 'You are not logged out'});
        }
        
      });
    });
  
    app.post('/api/register', (req, res) => {
      let login = req.body.user;
      let pass = req.body.password;
      if (!usernameValidation(login)) {
        res.json({
          error: 'Username can contain only letters and numbers and max length is 20',
          status: 0
        });
        return;
      }
      addUser(login, pass, (err, st) => {
        let x = st['status'];
        if (x == 0) {
          console.log(err);
          res.json({
            error: err,
            status: x
          });
        }
        if (x == 1) {
          req.session.userId = login;
          res.json({
            error: 'You are now logged in!',
            status: x
          });
        }
      })
    });
};


module.exports = {session, AccountManagerSetup};