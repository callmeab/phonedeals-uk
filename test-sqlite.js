const { Database } = require('sqlite3').verbose();
const db = new Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT)");
  db.run("INSERT INTO products (name) VALUES ('Test Product')");
  
  db.get("SELECT * FROM products", (err, row) => {
    console.log("Before delete:", row);
    
    // Bind string to ID
    db.run("DELETE FROM products WHERE id = ?", ['1'], function(err) {
      console.log("Deleted rows:", this.changes);
      
      db.get("SELECT * FROM products", (err, row) => {
        console.log("After delete:", row);
      });
    });
  });
});
