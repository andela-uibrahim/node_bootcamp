const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => { 
  const content = fs.readFileSync(path.resolve(__dirname, 'proposalv1.docx'), 'binary');
  const zip = new JSZip(content);
  const doc = new Docxtemplater();
    
  doc.loadZip(zip);

  //set the templateconstiables
  doc.setData({
    totalCost: req.body.totalCost,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    selectedItems: req.body.selectedItems,
  });

  try {
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    doc.render()
  }
  catch (error) {
    const e = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      properties: error.properties,
    }
    console.log(JSON.stringify({error: e}));
    // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    throw error;
    res.status(400).send({
      error,
    });
  }
  
  const buf = doc.getZip().generate({type: 'nodebuffer'});

  // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
  fs.writeFileSync(path.resolve(__dirname, 'output.docx'), buf);

  res.status(201).send({
    success: true
  });

}