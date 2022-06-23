const http=require('http');
require('dotenv').config();
const mongoose=require('mongoose');

const app =require('./app');

const { loadPlanetsData}=require('./models/planets.model');
const { loadLaunchData }=require('./models/launches.model');


const PORT=process.env.PORT || 8000;


const MONGO_URL=process.env.MONGO_URL;
const server=http.createServer(app);

mongoose.connection.on('open',()=>{    // we can use on be open evet trigged only once so we use one event
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error',(err)=>{   //since erroes can be occer more than once so we  use on(for error handling)
    console.error(err);
})

async function startServer(){
     await mongoose.connect(MONGO_URL,{
        useNewUrlParser: true,

        useUnifiedTopology: true 
        
     });
    await loadPlanetsData();
    await loadLaunchData();
    app.listen(PORT,()=>{
        console.log(`listening on port ${PORT}.....`);
    });
}


startServer();







