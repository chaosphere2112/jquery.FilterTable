(function( $ ) {
	$.fn.FilterTable = function( initialization ) {
		var Filter={
			value:/.*/i,
			parseFilter: function (value){
				//Convert value into a regular expression– it should be a string
				var stringsToMatch=[];
				stringsToMatch=value.split(" ");
				
				//Join search terms together with any number of other characters between them
				//Play with this, see what feels natural.
				var filterExpressionString=stringsToMatch.join(".*");
				
				filterExpressionString+=".*"; //picks up the last string
				
				//Case insensitive regular expression
				this.value=new RegExp(filterExpressionString, "i");
			},
			passesFilter: function (value) {
				if (value.toString().match(this.value)){
					return true;
				} else {
					return false;
				}
			}
		};
		var NumberFilter={
			operator:"",
			value:0,
			passesFilter: function(value){
				switch (this.operator) {
					case ">":
						return (value>this.value);
					case "<":
						return (value<this.value);
					case ">=":
						return (value>=this.value);
					case "<=":
						return (value<=this.value);
					case "=":
						return (value==this.value);
					case "":
						return true;
					default:
						return false;
				}
			},
			parseFilter: function(value) {
				value.replace(/\s/g, "");//remove whitespace
				var numberRegex=/(>=?|<=?|=?)[0-9\.]+/;
				if (value.search(numberRegex)==-1){
					this.operator="";
					this.value=0;
				} else {
					//Valid filter
					//Determine which operator is used
					var operator=value.substring(0,2);
					
					//All casts to number for value are safe– the regex guarantees that these are, indeed, numbers
					if (operator.search(/[0-9]+/)==-1) {
						//two character operator
						this.operator=operator;
						this.value=new Number(value.substring(2));
					} else {
						//single character operator
						operator=operator.substring(0,1);
						if (operator.search(/[0-9]+/)==-1) {
							this.operator=operator;
							this.value=new Number(value.substring(1));
						} else { //no operator specified, assume =
							this.operator="=";
							this.value=new Number(value);
						}
					}
				}
			}
		};
		var DateFilter={
			value: "",
			operator: "",
			parseFilter: function (value){
				//Match month/day/year
				var val=value.replace(/\s/g, "");//remove whitespace
			
				var dateRegex=/(>=?|<=?|=?)[0-1]?[0-9]\/[0-3]?[0-9]\/([0-9]{2}|[0-9]{4})\b/;
				if (value.search(dateRegex)==-1){
					this.operator="";
					this.value="";
				} else {
					//Valid filter
					//Determine which operator is used
					var operator=val.substring(0,2);
					//All casts to date for value are safe– the regex guarantees that these are, indeed, dates
					if (operator.search(/[0-9]+/)==-1) {
						//two character operator
						this.operator=operator;
						val=val.substring(2);
					} else {
						operator=val.substring(0,1);
						if (operator.search(/[0-9]+/)==-1) {
							this.operator=operator;
							val=val.substring(1);
						} else { //no operator specified, assume =
							this.operator="=";
						}
					}
					var numbers=val.split("/");
					var month=numbers[0];
					month=Number(month);
					month=month-1; //months appear to be zero indexed
					var date=numbers[1];
					date= Number(date);
					var year=numbers[2];
					year=Number(year);
					if (year<100){
						year+=2000;
					}
					this.value=new Date(year, month, date,0,0,0,0);
				}
			},
			passesFilter: function (value) {
				switch (this.operator) {
					case ">": return value.getTime() > this.value.getTime();
					case "<": return value.getTime() < this.value.getTime();
					case ">=": return value.getTime() >= this.value.getTime();
					case "<=": return value.getTime() <= this.value.getTime();
					case "=": return value.getTime() == this.value.getTime();
					case "": return true;
					default:
						return false;
				}
			}
		};
		var filterTable = {
			rows:[],
			table:null,
			id:"",
			columns: {},
			filterConstructors:{
				string: function() {
					return Object.create(Filter);
				},
				number: function() {
					return Object.create(NumberFilter);
				},
				date: function() {
					return Object.create(DateFilter);
				}
			},
			dataPrint : {
				string: function(val) {return val;},
				number: function(val) {return val;},
				date: function(val){return val.toDateString();}
			},
			filters:[],
			setColumns: function (object){
				this.columns=object;
				for (var a in object) {		
					this.filters.push(this.filterConstructors[object[a]]());
				}
			},
			addToDOM: function (domElement){
				//Create table element
				if (this.table==null) {
					this.table=$(document.createElement('table')).addClass("filter-table").attr("id",this.id);	
				} else {
					this.table.empty();
				}
				
				//add table to DOM
				$(domElement).append(this.table);
			
				var header=$(document.createElement('thead'));
				//table-filter-* is a styling class	
				var filterRow=$(document.createElement('tr')).addClass("table-filter-row");
				
				//table-header-* is a styling class
				var headerRow=$(document.createElement('tr')).addClass("table-header-row");
			
				for (var column in this.columns) {
					var filterCell=$(document.createElement('th')).addClass("table-filter-cell");
					//Create text input element
					var filterField=$(document.createElement('input')).attr("type","text");
					//Set id and classes
					filterField.attr("id",this.id+"-"+column+"-filter").addClass(this.id+"-filter").addClass("table-filter-field");
					//Append to DOM
					filterCell.append(filterField);
					filterRow.append(filterCell);
					
					var headerCell=$(document.createElement('th')).addClass("table-header-cell");
					headerCell.text(column);
					headerRow.append(headerCell);
				}
				header.append(filterRow);
				header.append(headerRow);
				this.table.append(header);
				
				var body=$(document.createElement('tbody'));
				//table-data-* is a styling class
				for (var rowIndex=0; rowIndex<this.rows.length; rowIndex++) {
			
					var row=$(document.createElement('tr')).attr("id",this.id+"-row-"+rowIndex).addClass("table-data-row");
			
					for (var column in this.columns) {
						var rowCol=$(document.createElement('td')).addClass("table-data-cell");
						
						
						//Handles custom printing
						var value=this.dataPrint[this.columns[column]](this.rows[rowIndex][column]);
						rowCol.html(value);
						
						row.append(rowCol);
					}
					this.rows[rowIndex].row = row;
					body.append(row);
				}
				this.table.append(body);
				
				var table=this;
				//To prevent collisions with other filter tables on the page, uses table.id as logic class name
				$("."+this.id+"-filter").each(
					function(){
						$(this).change(
							function(){
								var id = $(this).attr('id');
								for (var a=0; a<Object.keys(table.columns).length; a++){
									if (table.id+"-"+Object.keys(table.columns)[a]+"-filter"==id){
										table.filterColumn(a,$(this).val());
									}
								}
							}
						);
						$(this).keyup(function(){$(this).change();});
					}
				);
			},
			init: function (object){
				//types: object
				if (object.hasOwnProperty("types")){
					for (var type in object.types) {
						//Field names in types should be a name for a custom type
						//Values should be an object
							//constructor: returns an instance of a custom filter
								//Custom filters should have three methods:
									//constructor
									//passesFilter (takes in a value, returns boolean as to whether or not the value passes the filter)
									//parseFilter (takes in a string, configures filter)
							//print (optional): function that takes in the data object and returns a string representation of it
						this.filterConstructors[type]=object.types[type].constructor;
						this.dataPrint[type]=object.types[type].print;
					}
				}
				
				if (object.hasOwnProperty("columns")){
					//DRY: Pass to appropriate internal function, do the work there.
					this.setColumns(object.columns);
				}
				
				if (object.hasOwnProperty("rows")){
					//Accepts array of objects
					//If an object does not have all of the columns, creates them and sets them to ""
					for (var row in object.rows) {
						this.validateRow(row);
					}
					this.rows=object.rows;
				}
				
				if (object.hasOwnProperty("id")){
					this.id=object.id;
				} else {
					this.id="table-";
					//Generate random string to avoid id collisions
					for (var charInd=0; charInd<15; charInd++) {
						this.id+=String.fromCharCode(Math.random()*256);
					}
				}
				//add other features desired here
				return;
			},
			applyFilters: function() {
				//apply all filters to the table's data
				var lastAttached=this.table;
				for (var rowIndex=0; rowIndex<this.rows.length; rowIndex++){
					
					//Check each filtered column to verify its validity
					var valid=true;
					for (var colIndex=0; colIndex<this.filters.length; colIndex++) {
						var currentRowValue=this.rows[rowIndex][Object.keys(this.columns)[colIndex]];
						if (this.filters[colIndex].passesFilter(currentRowValue)==false) {
							valid=false;
						}
					}
					
					//Remove/show row based on validity
					if (valid) {
						//If the row is currently invisible, it should be shown
						if (this.rows[rowIndex].row.is(":hidden")){
							this.rows[rowIndex].row.addClass("filter-table-toBeShown");
						}
					} else {
						//If the row is currently visible, it should be hidden.
						if (this.rows[rowIndex].row.is(":hidden")==false){
							this.rows[rowIndex].row.addClass("filter-table-toBeHidden");
						}
					}
				}
				//Batch hide/show is more efficient
				$('.filter-table-toBeShown').fadeIn(100).removeClass("filter-table-toBeShown");
				$('.filter-table-toBeHidden').fadeOut(100).removeClass('filter-table-toBeHidden');
			},
			filterColumn: function(column, value){
				this.filters[column].parseFilter(value); //Update the filter for the column
				this.applyFilters();
			},
			validateRow: function(row){
				for (var column in this.columns) {
					if (row.hasOwnProperty(column)==false){
						row[column]="";
					}
				}
			}
		};
		filterTable.init(initialization);
		filterTable.addToDOM(this)
	};
})( jQuery );