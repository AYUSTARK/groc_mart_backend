const http = require("http")
const app = require("./app")
//Incoming Request Port

const port = process.env.PORT || 3000;

const index = http.createServer(app);

//Server Listener
index.listen(port);

