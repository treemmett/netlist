module.exports = function convertToCSV(data, primaryKey, nameScheme){
  // Check if data is not array
  if(data.constructor !== Array){
    throw new Error('Cannot convert non-array');
  }

  // Sanitize input
  data = JSON.parse(
    JSON.stringify(data)
  );

  // Get headers from all items
  let headers = [];

  if(primaryKey){
    headers.push(primaryKey);
  }

  data.forEach(item => headers.push(Object.keys(item)));

  // Flatten array
  headers = headers.reduce((acc, val) => acc.concat(val), []);

  // Remove duplicates
  headers = headers.filter((item, index) => headers.indexOf(item) >= index);

  let output = '';

  // Replace keys with naming schema
  if(nameScheme){
    for(let key of headers){
      // Check if key should be replaced
      if(nameScheme[key]){
        output += nameScheme[key]+','
      }else{
        output += key+','
      }
    }

    // Remove comma from end
    output = output.replace(/,$/, '');
  }else{
    output = headers.join(',');
  }

  data.forEach(item => {
    let line = '\n';

    // Add each key to line
    headers.forEach(header => {
      line += `"${item[header] || ''}",`
    });

    // Remove comma from end of line
    line = line.replace(/,$/, '');

    output += line;
  });

  return output;
}