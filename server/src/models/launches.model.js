const axios = require('axios');


// model only works with data
const launchesDatabase=require('./launches.mongo');
const planets= require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER=100; 


const SPACEX_API_URL='https://api.spacexdata.com/v4/launches/query';
async function populateLaunches(){

    console.log('Loading launch data');
    const response= await axios.post(SPACEX_API_URL,{
         
             query: {},
           options: {
             pagination: false,
             populate: [
               { 
                 path: 'rocket',
                 select: {
                   name: 1,
                 }
               },
               {
                 path: 'payloads',
                 select:{
                     'customers':1
                 }
               }
             ]
           }
         
      
     });
     if(response.status!=200){
        console.log("problem downloading the launch data")
        throw new Error("problem downloading the launch data")
     }

 
     const launchDocs= response.data.docs;
     for (const launchDoc of launchDocs) {
         const payloads=launchDoc['payloads'];
         const customers=payloads.flatMap((payload) => {
            return payload['customers'];
         })
         const launch={
             flightNumber:launchDoc['flight_number'],
             mission:launchDoc['name'],
             rocket:launchDoc['rocket']['name'],
             launchDate:launchDoc['date_local'],
             upcoming:launchDoc['upcoming'],
             success:launchDoc['success'],
             customers,
 
         };
         console.log(`${launch.flightNumber} ${launch.mission}`)
         await saveLaunch(launch);
    
     }
 
}


async function loadLaunchData() {
    const firstLaunch=await findLaunch({
        flightNumber:1,
        rocket:'Falcon 1',
        mission: 'FalconSat',
    });
    if(firstLaunch){
         console.log('Launch data already loaded');
       
        }else{
          await populateLaunches();
        }
 
}


async function findLaunch(filter){
    return await launchesDatabase.findOne( filter)
}


// launches.set(launch.flightNumber,  launch);    // lauches.get(100)===launch

async function existsLaunchWithId(launchId){
    return await findLaunch({
    flightNumber:launchId, 
    })
}


async function getLatestFlightNumber(){
        const latestLaunch=await launchesDatabase
        .findOne()
        .sort('-flightNumber');
      
        if(!latestLaunch){
             return DEFAULT_FLIGHT_NUMBER
        }
        return latestLaunch.flightNumber;


}
 

async function getAllLaunches(skip,limit) {
try {
    const obj = await launchesDatabase.find({},{'_id': 0,'__v':0})
    .sort( {flightNumber: 1})
    .skip(skip)
    .limit(limit)
    return obj
} catch (error) {
    console.log(error);
}
// return {yes:'no'}
};


async function saveLaunch(launch){
    try{
       
        await launchesDatabase.findOneAndUpdate({
            flightNumber: launch.flightNumber,        
        }, launch,{
            upsert: true,
        })
    }catch(err){
        console.log(err, '--------------') 
    }
}


async function scheduleNewLaunch(launch){

    const planet= await planets.findOne({
        keplerName:launch.target,
    });
    console.log(planet);
    if(!planet){
         throw new Error('No maching planet found in mongo');
    }
    const newFlightNumber= await getLatestFlightNumber()+1;


 const newLaunch=Object.assign(launch,{
    success: true,
    upcoming:true,
    customers:['ZTM','NASA'],
    flightNumber:newFlightNumber,
});
await saveLaunch(newLaunch);
}
 

// function addNewLaunch(launch){    // this is launch is is passed by user
//     latestFlightNumber++;
//     launches.set(
//         latestFlightNumber,
//         Object.assign(launch, {
//             success:true,
//             upcoming:true,
//             customer:['ZTM','NASA'],
//             flightNumber:latestFlightNumber,
//         })
//         )
// }



async function abortLaunchById(launchId){
  return await launchesDatabase.updateOne({
      flightNumber:launchId,
  },{
      upcoming:false,
      success:false,
  });
//  const aborted= launches.get(launchId);
//  aborted.upcoming=false;
//  aborted.success=false;
//  return aborted;
}

module.exports = {
    loadLaunchData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById,
}