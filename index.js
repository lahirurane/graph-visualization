const csv = require('csvtojson');
const fs = require('fs');
// expected output

// {
//     "nodes":[
//           {"name":"node1","group":1},
//           {"name":"node2","group":2},
//           {"name":"node3","group":2},
//           {"name":"node4","group":3}
//       ],
//       "links":[
//           {"source":2,"target":1,"weight":1},
//           {"source":0,"target":2,"weight":3}
//       ]
//   }

// ID: '1',
// 'Email5 per month': '5',
// Weight: '1',

let links = [];
let nodes = [];

let result = {};

//CommunicationDetail
async function ConvertLinkDATA() {
  console.log('------------- ConvertDATA Started ------------- ');
  let fileInput = './CSV_DATA/CommunicationDetail.csv';

  await csv()
    .fromFile(fileInput)
    .then(async data => {
      data.map(item => {
        links.push({
          source: Number(item.ID),
          target: Number(item.USER_ID),
          weight: Number(item.Weight)
        });
      });
      // console.log('result link', links);
    });

  return;
}

async function ConvertNodeDATA() {
  console.log('------------- ConvertDATA Started ------------- ');
  let fileInput = './CSV_DATA/StaffDetails.csv';

  await csv()
    .fromFile(fileInput)
    .then(async data => {
      //console.log('data', data);
      data.map(item => {
        let group = getGroup(Number(item.ID));
        nodes.push({ name: item.Name, group: group, position: item.Position });
      });
      // console.log('result nodes', nodes);
    });

  return;
}

//Get group ID for node ID
function getGroup(id) {
  switch (id) {
    case 0:
    case 1:
    case 2:
      return 1;
    case 3:
    case 4:
    case 5:
      return 2;
    case 6:
    case 7:
    case 8:
      return 3;
    case 9:
    case 10:
    case 11:
      return 4;
    case 12:
    case 13:
    case 14:
      return 5;
    case 15:
    case 16:
    case 17:
      return 6;
    default:
      return 0;
  }
}

async function init() {
  await ConvertNodeDATA();
  await ConvertLinkDATA();

  result = {
    nodes: nodes,
    links: links
  };

  fs.writeFile('./email_dataset.json', JSON.stringify(result), err => {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  });

  //   console.log('result', result);
}

init();
