const config = require("./config.js");
const express = require("express");
const app = express();
const walletapi = require('turtlecoin-rpc').WalletAPI;
const wallet = new walletapi({
  host : config.host,
  port : config.port,
  password : config.password
});
const coin = config.coin;
const daemonHost = config.daemonHost;
const daemonPort = config.daemonPort;
const multer = require("multer");
const upload = multer();
app.set('view engine', 'pug');
app.use(express.static("public"));
app.use(express.json());
app.use(upload.array());
app.use(express.urlencoded({ extended: false }));

app.get("/", (request, response) => {
  response.render(__dirname + "/pug/index.pug",{
    coin : coin
   });
});

app.get("/login", (request, response) => {
  response.render(__dirname + "/pug/loginwallet.pug",{
    coin : coin
  });
});

app.get("/newwallet", (request, response) => {
  response.render(__dirname + "/pug/newwallet.pug",{
    coin : coin
  });
});

app.get("/wallet", (request, response) => {
  wallet.primaryAddress().then((address) => {
    wallet.balance().then((balance) => {
      response.render(__dirname + "/pug/wallet.pug",{
        balance : balance.unlocked,
        address : address
        coin : coin
      });
    }).catch((error) => console.log(error));
  }).catch((error) => console.log(error));
});

app.get("/newtransaction", (request, response) => {
  response.render(__dirname + "/pug/newtransaction.pug",{
    coin : coin
  });
});

app.get("/transactions", (request, response) => {
  wallet.transactions().then((txs) => {
    response.render(__dirname + "/pug/transactions.pug",{
      txs : txs
      coin : coin
    });
  }).catch((error) => {
    response.redirect("/wallet");
  });
});

app.post("/create",(request, response) => {
	var name = request.body.name;
	var password = request.body.password;
  wallet.create(name, password,daemonHost,daemonPort).then((resolve) => {
		response.redirect("/wallet")
	}).catch((error) => {
		response.redirect('/wallet');
	});
});
app.post("/open",(request, response) => {
	var name = request.body.name;
	var password = request.body.password;
	wallet.open(name,password,daemonHost,daemonPort).then((resolve) => {
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
