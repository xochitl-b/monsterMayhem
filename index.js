const express=require("express")
const app=express()

//set up paths and require dependencies
const path=require("path")
const http=require("http")
const {Server}=require("socket.io")

const server=http.createServer(app)

const io=new Server(server)
app.use(express.static(path.resolve("")))

app.get("/",(req,res)=>{
    return res.sendFile("index.html")
})

//connect to port and get connection check in console
server.listen(3000, ()=>{
    console.log("port connected to 3000")
})