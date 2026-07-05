import app from "./app"

async function main(){
    const port=5000
    try{
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
    }
    catch(error){
console.log(error)
process.exit(1)
    }
}
main()