This is a [jQuery](http://jquery.com) plugin that generates a table with filters from JSON data.

To use:

 1. Include jquery library of your choice (I use 1.7.2), then include jquery.filter-table.js
 2. Obtain JSON data
 3. call $('#divToInsertIn').FilterTable(initObject)

Init object reference:

types:

 - An object that is used to define data types.  Each object inside of it should have the name of the datatype that it represents as the field name.
 - Requires two methods:

   1. constructor
      * Returns an instance of a custom filter object
        * Custom filter objects need 2 methods:
           1. parseFilter(value)
               * Takes in a string from an input text
               * Set up the filter to handle any data that is examined using that input
           2. passesFilter(value)
               * Takes in an instance of whatever datatype this filter is for
               * Returns true or false based on whether or not the data should be filtered out.
   2. print(data)
       * A function that takes in an instance of whatever datatype the filter is for and returns a string representation of it.

columns:

  * An object that is used to define what the data to be displayed is.
  * Each column that you want in your table should be a field name, and each value should be the type (lowercase)
    
rows:

  * An array of objects that contain data using the field names given in the columns object
  * Objects that do not contain the appropriate field will not cause errors

id:

  * Optional- allows user to give a value for the id attribute of the table generated.
  * If not given, random id will be generated.
    
For an example, refer to example.html and js/main.js