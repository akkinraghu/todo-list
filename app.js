
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const today = require(__dirname + '/currentDate/generateDate.js');
app.use(bodyParser.urlencoded({extended: true}));

const mongoose = require('mongoose');
const { json } = require('body-parser');

app.use(express.static("public"));

app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model('Item', itemsSchema);


const item1 = new Item({ name: 'Welcome to the To Do List' });
const item2 = new Item({ name: 'Hit the + button to add a new item' });
const item3 = new Item({ name: '<--- Hit this to cancel the item' });

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  list: [itemsSchema]
});

const List = new mongoose.model('List', listSchema);

app.get('/', (req, res) => {


  Item.find({}, (err, listItems) => {
    if(listItems.length === 0) {
      Item.insertMany(defaultItems, (err, response) => {
        if(err) {
          console.log(err);
        } else {
          console.log('Successfully Inserted defaults into DB');
          console.log(response);
        }
      });
      res.redirect('/');
    } else {
      res.render('list', {
        listName: today,
        listItems: listItems,
      });
    }
  });
});

app.post('/', (req, res) => {
  if(req.body.newItem.trim()){
    if(req.body.page === today) {
      Item.insertMany([{name: req.body.newItem}])
      res.redirect('/');
    } else {
      
      List.findOneAndUpdate(
        {
          name: req.body.page
        },
        {
          $push: {
            list: {name: req.body.newItem}
          }
        },
        {
          new: true,
          upsert: true
        }, (err, response) => {
          if(err){
            console.log(err);
          }
        });

      res.redirect('/' + req.body.page);
    }
      
  }
});

app.post('/delete', (req, res) => {
  const itemId = req.body.checkbox;
  if(req.body.pageName === today) {
    Item.findByIdAndDelete(itemId, (err, item) => {
      if(!err){
        res.redirect('/');
      } 
    });
  } else {
    List.findOneAndUpdate(
      {
        'name': req.body.pageName
      },
      {
        $pull: { list: { _id: req.body.checkbox} }
      },
      (err) => {
        if(err){ console.log(err);}
    });
    res.redirect('/' + req.body.pageName);
  }

});

app.get('/:newRoute', (req,res) => {
  const routeName = req.params.newRoute;

  List.find({name: routeName}, (err, items) => {
    if(!err){
      res.render('list', {
        listName: routeName,
        listItems: items[0] ? items[0].list : []
      });
    }
  });
});



app.listen('3000', () => {
  console.log('Listening on port 3000');
});
