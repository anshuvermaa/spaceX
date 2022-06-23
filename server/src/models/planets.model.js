 const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planets =require('./planets.mongo')

// const habitablePlanets = [];

function isHabitalePlanet(planet) {
    return planet['koi_disposition'] ==='CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] <1.6;
}

function loadPlanetsData(){

   return new Promise((resolve, reject) => {
       fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
    .pipe(parse({
        comment: '#',
        columns: true
    }))
    .on('data',(data) =>{
        if(isHabitalePlanet(data)){
            // console.log("he");
        //    habitablePlanets.push(data); since we are not storing data in memory rather in mongo database
        //    await planets.updateOne({
        //        keplerName: data.kepler_name,   // here first argument cheching if that planet name exits if not then 2nd argument pushes to database
        //   },{
        //       keplerName: data.kepler_name,
        //     },{
        //         upsert: true,
        //     });
        savePlanet(data);
        }
    })
    .on('error',(err) =>{
        console.error(err);
        reject(err);
    })
    .on('end',async () =>{
        const countPlanetsFound=(await getAllPlanets()).length;
      //  console.log(`${countPlanetsFound} habitable planets found! `)
    //  console.log(`${habitablePlanets.length} habitable planets found!`);      //    since we are not using isHabitalePlanet array
        resolve();
    });
    
  });
}


async function getAllPlanets(){
  //  return  habitablePlanets; since now data on magon not in memory as array
  return await planets.find({},{       // first argument for {} for all value 2nd for inculding or excluding values
      '__id':0, '__v':0,    
  });         
}

async function savePlanet(planet){
    try{

        await planets.updateOne({
            
            keplerName: planet.kepler_name,   // here first argument cheching if that planet name exits if not then 2nd argument pushes to database
       },{
        keplerName: planet.kepler_name,
         },{
             upsert: true,
         });

    } catch(err){
        console.log(`Could not save planet ${err}`);
    }
}
    
module.exports={
    loadPlanetsData,
    getAllPlanets,
};