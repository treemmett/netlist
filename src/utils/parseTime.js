export default function(epoch){
  // @param {Number} Time to parse in seconds from epoch

  if(typeof epoch === 'undefined'){
    return;
  }

  // Convert time to number
  epoch = Number(epoch, 10);

  if(isNaN(epoch)){
    throw new Error('epoch must be a number');
  }

  const date = new Date(epoch * 1000);
  const now = new Date(Date.now());

  if(date.getFullYear() <= 1970){
    return 'Never';
  }

  // Return time if date is from today
  if(date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()){
    var hours = date.getHours();
    const minutes = ('0' + date.getMinutes()).slice(-2); // Add padding zero, removing it if minutes is > 10
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour 0 should be 12
    return hours + ':' + minutes+' '+ampm
  }else{
    const month = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_')[date.getMonth()];
    const day = date.getMonth();
    let output = month+' '+day;
    
    // Add year if different
    if(date.getFullYear() !== now.getFullYear()){
      output += ', '+date.getFullYear();
    }

    return output;
  }
}