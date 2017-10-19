#! /usr/bin/env node
let fs = require('fs');
let os = require('os');
let axios = require('axios');
var program = require('commander');
var colors = require('colors');


if (!fs.existsSync(`${os.homedir()}/recording/`)) {
   fs.mkdirSync(`${os.homedir()}/recording/`);
}

 program
  .option('-S, --start-date <startDate>', 'The date to start getting recordings from eg 2017-05-21')
  .option('-E, --end-date <endDate>', 'The end date to stop getting recordings eg 2017-05-21')
  .option('-s, --start-time <startTime>', 'The time of the day eg 00, 12, 23, to start getting recordings from', parseInt)
  .option('-e, --end-time <endTime>', 'The time of the day eg 00, 12, 23, to stop getting recordings', parseInt)
  .option('-T, --extension <extension>', 'The extension for the recordings', parseInt)
  .parse(process.argv);

  if(!program.startDate){
    throw new Error("please enter the start date".underline.red);
  }else if(!program.startDate.match(/^[0-9]{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])/)){
    throw new Error("please enter the start date in the format yyyy-mm-dd".underline.red);
  }
  
  if(!program.endDate){
    throw new Error("please enter the end date".underline.red);
  } else if(!program.endDate.match(/^[0-9]{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])/)){
    throw new Error("please enter the end date in the format yyyy-mm-dd".underline.red);
  }

  if(!program.startTime){
    program.startTime = 00;    
  }
  if(!program.endTime){
    program.endTime = 23;      
  }
  if(!program.extension){
      program.extension = 00;
  }

  const url = `https://api.fluentcloud.com/v1/reporting/GeneralRentalCenter/calldetailreports?orderby=%21calldate&startdate=${program.startDate}&enddate=${program.endDate}&starttime=${program.startTime}%3A00&endtime=${program.endTime}%3A00&extension=${program.extension? program.extension: null}`
  
  const token = 'SejR44jk-eotF-vSFP-AqfgGGVVHC9e';
  console.log('downloading recordings ...........................'.rainbow);
  axios.get(url, {
      headers: {
        'Authorization': 'SejR44jk-eotF-vSFP-AqfgGGVVHC9e',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Connection': 'keep-alive'
      }
  }).then((response)=>{
      const list = response.data.data;
      const links = [];
      list.map((data)=>{
        if(data.recording){
          links.push(data.recording);
        }
      })
      new Promise((resolve, reject) => {
        const buffs = [];
        for (let i = 0; i < links.length; i++) {
        const url2 = `https://api.fluentcloud.com${links[i].slice(4)}`;
          axios.get(url2, {
            responseType: 'arraybuffer',
            headers: {
              'Authorization': 'SejR44jk-eotF-vSFP-AqfgGGVVHC9e',
              'Accept': 'application/json, text/javascript, */*; q=0.01',
              'Connection': 'keep-alive'
            }
          }).then((response) => {
            const location = program.extension ? `${os.homedir()}/recording/${program.extension}/${links[i].slice(52)}` : 
            `${os.homedir()}/recording/${links[i].slice(52)}`;
              fs.writeFile(location, response.data, function(err) {
                if (err) {
                  return err;
                }
                buffs.push(response.data);
                if (i === links.length -1) {
                  resolve(buffs);
                }
                console.log('download completed please check the recordings folder in your root directory'.green);
              })
            });
          } 
      });
  });


