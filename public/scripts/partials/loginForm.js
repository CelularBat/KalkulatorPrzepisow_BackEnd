const user_l = document.getElementById("login_log");
const user_r = document.getElementById("login_reg");
const pass_l = document.getElementById("password_log");
const pass_r = document.getElementById("password_reg");
const btn_log = document.getElementById("login_submit");
const btn_reg = document.getElementById("register_submit");
const cont = document.getElementById("container");
const pages = document.getElementById("pages");
const tabs = document.getElementById("tabs");
const st_log =document.getElementById("status_log");
const st_reg =document.getElementById("status_reg");

btn_log.addEventListener("click", () => {
  fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({
      user: user_l.value,
      password: pass_l.value
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then((response) => response.json()).then((response)=>{
      st_log.innerText = response['error'];
      if (response['status'] == 1) { location.reload() };
    });
});

btn_reg.addEventListener("click", () => {
  fetch("/api/register", {
    method: "POST",
    body: JSON.stringify({
      user: user_r.value,
      password: pass_r.value
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then((response) => response.json()).then((response)=>{
      st_reg.innerText = response['error'];
      if (response['status'] == 1) { location.reload() };
        
      
    });
                                              
});

// hide login form

document.addEventListener('click', (event) => {
        // Check if the clicked element is outside the target element
        if (!cont.contains(event.target)) {
            cont.style.maxHeight = "49px";
            cont.style.minHeight = "40px"
        } else {
            cont.style.maxHeight = "400px";
            cont.style.minHeight = "300px"
        };
});
