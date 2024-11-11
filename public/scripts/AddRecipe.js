var _g_tableUser, _g_tablePublic, _g_tableRecipe ,_g_tableCalc; // handles to tables


// internal memory Recipe Container
class RecipeContainer {
    constructor() {      
        this.length = 0; 
        this.recipeFullJSONArray = [];
        this.calcResultIntArray = [];
        this.calcResultJSON = {kj: 0, kcal: 0, fat:0, carb: 0, sugar:0, protein:0, fiber:0, salt:0};
    }
    _calcResult_reset(){
       this.calcResultJSON = {kj: 0, kcal: 0, fat:0, carb: 0, sugar:0, protein:0, fiber:0, salt:0};
    }
    _getPortion(row_idx){
        let cell = _g_tableRecipe.cell({row: row_idx, column: 2}).node();
        let p = cell.querySelector('input').value;
        return p;
    }
  
    _recalculate(){
      this._calcResult_reset();
      for (let i = 0 ; i < this.recipeFullJSONArray.length; i++) {
        let r = this.recipeFullJSONArray[i];
        var portion = 0;
        try { //here is a bug, sometimes when clicking buttons fast then array isn't deleted from internal array
              //causing later out of index error (table index is smaller then) - need investigation
          portion = this._getPortion(i);
        } catch(e) {
          console.error(e);
          console.log(this.length,i,this.recipeFullJSONArray[i]);
        }
        
        for (let row_key in r) {
          for (let key in this.calcResultJSON){
            if (row_key == key) {
              let toAdd = Number( (portion/100 * r[row_key]).toFixed(3) );
              this.calcResultJSON[key] = Number((this.calcResultJSON[key] + toAdd).toFixed(3));
              
            }
          }
        }      
      }
      console.log(this.calcResultJSON);
      _g_tableCalc.row(0).data(this.calcResultJSON).draw();
    }
    
    push(rowJSON,row_idx){ 
      this.length++;
      this.recipeFullJSONArray.push(rowJSON);
      this._recalculate();
    }

    remove(row_idx){
      this.length--;
      this.recipeFullJSONArray.splice(row_idx,1);
      this._recalculate();
    }
}

var _g_recipeContainer = new RecipeContainer();

function dt_getID(dataTable) {
  return dataTable.api().table().node().id;
}

function dt_createColumnSearch(colums_idxArr , dataTable) { //colums_idxArr,
  // ID of passed table
   const dtID=dt_getID(dataTable);
      
   dataTable.api().columns().every(function(idx){
      let column = this;
      let title = column.header().textContent;
      
      if (colums_idxArr.includes(idx)) {
        // Create input element
        let input = document.createElement('input');
        input.placeholder = title;
        input.className = "searchColumnInput";
        column.header().replaceChildren(input);
  
        // Event listener for user input
        input.addEventListener('keyup', () => {
           column.search(input.value,true).draw();      
        });
      } 
    });
     
}

function btn_add_Init(btn,data) {
  btn.addEventListener("click", (event) => {
    let dataForRecipe = { name: data.name, brand: data.brand, portion:input_Porcja_str, portion_list: ''};    
    let newRow = _g_tableRecipe.row.add(dataForRecipe).draw().node();
    let newRow_idx = _g_tableRecipe.row(newRow).index();
    
    
    let b_d = Object.assign(document.createElement('button'), {
        className: 'btn_del',
        type: 'button',
        textContent: 'X'
     });
    
      b_d.addEventListener('click', function(){
        _g_tableRecipe.row($(newRow)).remove().draw();
        _g_recipeContainer.remove(newRow_idx);
        
     });
  
    $(newRow).find('td:last').append(b_d);
    _g_recipeContainer.push(data, newRow_idx);
    
    
  });
}

function dt_insertAddButton(row,data,dataTable){
  let b_a = Object.assign(document.createElement('button'), {
    className: 'btn_add',
    type: 'button',
    textContent: '＋'
  });

  btn_add_Init(b_a,data);
  let td = row.cells[0];
  td.appendChild(b_a);
}

function GetUserProducts() {
  
  fetch('/api/getuserp').then(response=>response.json()).then( (response)=>{
    
     _g_tableUser = $('#dataTable').DataTable({
            
           language: { url: 'https://cdn.datatables.net/plug-ins/2.0.5/i18n/pl.json'},
           dom: 'lp',
           data: response,
           "autoWidth": false,
           columns: [
               { "data": null, "defaultContent": "", "orderable": false}, //empty col
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
           ],

           // Add action buttons to row
          "createdRow": function( row, data, dataIndex ) {
             dt_insertAddButton(row,data,this);    
          },
          
          "initComplete": function () {
            dt_createColumnSearch([1,2,3],this);
           
          },
          order: [[ 1, "desc" ]]
          
       });
   
    return;
    });
}

GetUserProducts();

function GetPublicProducts() {
  var th_header = $('#dataTablePub')
  fetch('/api/getpubp').then(response=>response.json()).then( (response)=>{
      _g_tablePublic=$('#dataTablePub').DataTable({
        
          language: { url: 'https://cdn.datatables.net/plug-ins/2.0.5/i18n/pl.json'},
          dom: 'lp',
           data: response,
           "autoWidth": false,
           columns: [
               { "data": null, "defaultContent": "", "orderable": false}, //empty col
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
           // Add action buttons to row
           "createdRow": function( row, data, dataIndex ) {
              dt_insertAddButton(row,data, this);
           },
           
           "initComplete": function () {
            dt_createColumnSearch([1,2,3,12],this);
            
          }
          
       });
    return;
    });
}

GetPublicProducts();

function updateDatatable(datatable) {
    fetch('/api/getuserp').then(response=>response.json()).then((response)=>{
    datatable.clear();
    datatable.rows.add(response);
    datatable.draw();
  });    
}

/* RecipeList */


function input_maxLengthControl(object) {
  let maxLength = 4;
  if (object.value.length > maxLength) {
    object.value = object.value.slice(0, maxLength);
  } else {
    _g_recipeContainer._recalculate();
  }
  
}
const input_Porcja_str = '<input name="portion" class="input_portion" step="1" value="100" style="max-width: 60px;" type="number" oninput="input_maxLengthControl(this)">';





function CreateRecipeTable() {
  
  _g_tableRecipe = $("#dataTable_recipe").DataTable({
      language: { url: 'https://cdn.datatables.net/plug-ins/2.0.5/i18n/pl.json'},
      dom: '',
      pageLength: 100,
      autoWidth: false,
      data: [],
      columns: [
         { "data": 'name', "defaultContent": ""},
         { "data": 'brand', "defaultContent": ""},
         { "data": 'portion', "defaultContent": ""},
         { "data": 'portion_list', "defaultContent": ""},
        { "data": null, "defaultContent": "", "orderable": false}
                
      ]

  });

}

CreateRecipeTable() ;

function CreateCalcTable(){
  _g_tableCalc = $("#dataTableCalc").DataTable({
      dom: '',
      pageLength: 10,
      autoWidth: false,
      data: [{kj: 0, kcal: 0, fat:0, carb: 0, sugar:0, protein:0, fiber:0, salt:0}],
      columns: [
               { data: 'kj' , "defaultContent": "", "orderable": false},
               { data: 'kcal' , "defaultContent": "", "orderable": false},
               { data: 'fat', "defaultContent": "" , "orderable": false},
               { data: 'carb' , "defaultContent": "", "orderable": false},
               { data: 'sugar' , "defaultContent": "", "orderable": false},
               { data: 'protein' , "defaultContent": "", "orderable": false},
               { data: 'fiber' , "defaultContent": "", "orderable": false},
               { data: 'salt', "defaultContent": "", "orderable": false }          
      ]

     
  });
}

CreateCalcTable();