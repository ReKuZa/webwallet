// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const walletapi = require('turtlecoin-rpc').WalletAPI;
const wallet = new walletapi({
  host : "185.8.177.12",
  port : 9999,
  password : "viztercoin"
});
const multer = require("multer");
const upload = multer();

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.set('view engine', 'pug');
app.use(express.static("public"));
app.use(express.json());
app.use(upload.array());
app.use(express.urlencoded({ extended: false }));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.render(__dirname + "/pug/index.pug");
});

app.get("/login", (request, response) => {
  response.render(__dirname + "/pug/loginwallet.pug");
});

app.get("/newwallet", (request, response) => {
  response.render(__dirname + "/pug/newwallet.pug");
});

app.get("/wallet", (request, response) => {
  wallet.primaryAddress().then((address) => {
    wallet.balance().then((balance) => {
      response.render(__dirname + "/pug/wallet.pug",{
        balance : balance.unlocked,
        address : address
      });
    }).catch((error) => console.log(error));
  }).catch((error) => console.log(error));
});

app.get("/newtransaction", (request, response) => {
  response.render(__dirname + "/pug/newtransaction.pug");
});

app.get("/transactions", (request, response) => {
  wallet.transactions().then((txs) => {
    response.render(__dirname + "/pug/transactions.pug",{
      txs : txs
    });
  }).catch((error) => {
    response.redirect("/wallet");
  });
});

app.post("/create",(request, response) => {
	var name = request.body.name;
	var password = request.body.password;
  wallet.create(name, password,"185.8.177.12",3997).then((resolve) => {
		response.redirect("/wallet")
	}).catch((error) => {
		response.redirect('/wallet');
	});
});
app.post("/open",(request, response) => {
	var name = request.body.name;
	var password = request.body.password;
	wallet.open(name,password,"185.8.177.12",3997).then((resolve) => {
		response.redirect('/wallet');
	}).catch((error) => {
		response.redirect('/wallet');
	});
});
app.get("/logout",(request, response) => {
	wallet.close().then((resolve) => {
		response.redirect("/");
	}).catch((error) => {
		response.redirect("/wallet");
	});
});
app.post("/sendtx",(request, response) => {
	var address = request.body.address;
	var amount = request.body.amount;
	wallet.sendBasic(address, amount).then((resolve) => {
		response.redirect("/wallet");
	}).catch((error) => {
		response.redirect("/");
	});
});

  // listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});