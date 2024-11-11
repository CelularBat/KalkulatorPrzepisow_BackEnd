const btn_add = document.getElementById("btn_add");
const btn_update = document.getElementById("btn_update");
const btn_cleanForm = document.getElementById("btn_cleanForm");
const form_productsAdd = document.getElementById("addPrForm");


var _g_editTarget = {};
var _g_submitTarget = "";

function InitFormBtns() {
  btn_update.addEventListener("click", () => {
    _g_submitTarget = "update";
    btn_update.style.display = "none";
    btn_add.style.display = "block";
  });

  btn_add.addEventListener("click", () => {
    _g_submitTarget = "add";
  });

  btn_cleanForm.addEventListener("click", () => {
    addPrForm.reset();
  });

}
InitFormBtns();


function btn_edit_Init(btn, tr, th_footer) {
  btn.addEventListener('click', () => {
    const row = tr.querySelectorAll('td');
    const row_footer = th_footer.querySelectorAll('th');
    // Iterate throught th footer for keys, then find those keys in html form and change values
    
    // if- any new column will be added at the beginning, lines below must change
    _g_editTarget = { name: row[1].textContent, brand: row[2].textContent };

    row_footer.forEach((x, idx) => {
      let form_element = document.querySelector(`input[id^=${x.textContent}]`);
      //console.log(row[idx].textContent,form_element.type, form_element);
      if(form_element && (form_element.type != "checkbox")) {
        form_element.value = row[idx].textContent;
      }
      else if(form_element.type == "checkbox") {
        if(row[idx].textContent == "Tak") {
          form_element.checked = true;
        }
        else {
          form_element.checked = false;
        }
      }
    });
    btn_add.style.display = "none";
    btn_update.style.display = "block";
  });
}

function btn_delete_Init(btn, tr) {
  btn.addEventListener('click', () => {
    const row = tr.querySelectorAll('td');
    let rowToDelete = { name: row[1].textContent, brand: row[2].textContent };
    let confirm = window.confirm(`Do you really want to remove product: ${rowToDelete.name} ${rowToDelete.brand} ?`);
    if(!confirm) {
      return;
    }
    fetch("/api/removep", {
        method: "POST",
        body: JSON.stringify(rowToDelete),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((response) => response.json())
      .then((response) => {
        if(response['status'] == 1) {
          updateDatatable(_g_tableUser);
        } else
        {
          alert(response['msg']);
        }
      });
  });
}

document.addEventListener("submit", function(event) {
  event.preventDefault();
  let dataJSON = {};
  const data = new FormData(event.target);
  data.forEach((value, key) => {
    dataJSON[key] = value;
  });

  if(_g_submitTarget == ("add")) {
    fetch("/api/addp", {
        method: "POST",
        body: JSON.stringify(dataJSON),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((response) => response.json())
      .then((response) => {
        if(response['status'] == 1) {
          // What to do with DOM after we succeeded
          updateDatatable(_g_tableUser);
          addPrForm.reset();
        } else
        {
          alert(response['msg']);
        }
      });
  } else if(_g_submitTarget == "update") {
    dataJSON.target = _g_editTarget;
    fetch("/api/updatep", {
        method: "POST",
        body: JSON.stringify(dataJSON),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then((response) => response.json())
      .then((response) => {
        if(response['status'] == 1) {
          // What to do with DOM after we succeeded
          updateDatatable(_g_tableUser);
          addPrForm.reset();
        } else
        {
          alert(response['msg']);
        }
      });

  } else {
    throw new Error('ERROR: unknown source of POST request');
  }

  _g_submitTarget = "";
})



/////////////////////////////////////////////////////////////////////////////////////////////////////////
// DATATABLES
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var _g_tableUser, _g_tablePublic; // handles to tables

function dt_getID(dataTable) {
  return dataTable.api()
    .table()
    .node()
    .id;
}

function dt_createColumnSearch(colums_idxArr, dataTable) { //colums_idxArr,
  // ID of passed table
  const dtID = dt_getID(dataTable);
  // remove general search
  $(`#${dtID}_filter`)
    .css({ display: 'none' });
  // move <show X entries> to bottom
  //disapear <showing x entries>
  $(`#${dtID}_info`)
    .css({ display: 'none' });

  dataTable.api()
    .columns()
    .every(function(idx) {
      let column = this;
      let title = column.header()
        .textContent;

      if(colums_idxArr.includes(idx)) {
        // Create input element
        let input = document.createElement('input');
        input.placeholder = title;
        input.className = "searchColumnInput";
        column.header()
          .replaceChildren(input);

        // Event listener for user input
        input.addEventListener('keyup', () => {
          column.search(input.value, true)
            .draw();
        });
      }
    });

}

function dt_createActionKeys(row, dataTable) {
  let td = document.createElement('td');
  td.className = 'action';
  let b_e = Object.assign(document.createElement('button'), {
    className: 'btn',
    type: 'button',
    textContent: '✎',
    id: 'btn_edit'
  });
  td.appendChild(b_e);
  let b_d = Object.assign(document.createElement('button'), {
    className: 'btn',
    type: 'button',
    textContent: 'X',
    id: 'btn_delete'
  });
  td.appendChild(b_d);
  row.appendChild(td);

  let th_footer = dataTable.api()
    .table()
    .footer()
    .getElementsByTagName('tr')[0];
  btn_edit_Init(b_e, row, th_footer);
  btn_delete_Init(b_d, row);
}

function GetUserProducts() {
  fetch('/api/getuserp')
    .then(response => response.json())
    .then((response) => {

      _g_tableUser = $('#dataTable')
        .DataTable({

          data: response,
          language: { url: 'https://cdn.datatables.net/plug-ins/2.0.5/i18n/pl.json' },
          dom: 'lp',
          columns: [
            { data: 'category' },
            { data: 'name' },
            { data: 'brand' },
            { data: 'kj' },
            { data: 'kcal' },
            { data: 'fat' },
            { data: 'carb' },
            { data: 'sugar' },
            { data: 'protein' },
            { data: 'fiber' },
            { data: 'salt' },
            { data: 'public' }
          ],
          columnDefs: [{
            target: 11,
            render: function(data, type, row, meta) {
              console.log(data, row);
              if(JSON.parse(data)) {
                return '<img name="true" src="public.png" width="17" height="17" class="icon_padlock">Tak</img>';
              } else {
                return '<img name="false" src="padlock.png"  width="17" height="17" class="icon_public">Nie</img>';
              }

            }
          }],

          // Add action buttons to row
          "createdRow": function(row, data, dataIndex) {
            dt_createActionKeys(row, this);
          },
          "initComplete": function() {
            dt_createColumnSearch([0, 1, 2], this);

          }
        });

      return;
    });
}

GetUserProducts();

function GetPublicProducts() {
  var th_header = $('#dataTablePub')
  fetch('/api/getpubp')
    .then(response => response.json())
    .then((response) => {
      _g_tablePublic = $('#dataTablePub')
        .DataTable({

          data: response,
          language: { url: 'https://cdn.datatables.net/plug-ins/2.0.5/i18n/pl.json' },
          dom: 'lp',
          columns: [
            { data: 'category' },
            { data: 'name' },
            { data: 'brand' },
            { data: 'kj' },
            { data: 'kcal' },
            { data: 'fat' },
            { data: 'carb' },
            { data: 'sugar' },
            { data: 'protein' },
            { data: 'fiber' },
            { data: 'salt' },
            { data: 'author' }
          ],
          "initComplete": function() {
            dt_createColumnSearch([0, 1, 2, 11], this);
          },
          
          order: [[ 1, "desc" ]]

        });
      return;
    });
}

GetPublicProducts();

function updateDatatable(datatable) {
  fetch('/api/getuserp')
    .then(response => response.json())
    .then((response) => {
      datatable.clear();
      datatable.rows.add(response);
      datatable.draw();
    });
}