export default function parse(e, options){
  let input;

  if(typeof options !== 'object'){
    options = {};
  }

  // Get reference to input;
  if(e instanceof HTMLElement){
    input = e;
  }else if(e.target instanceof HTMLElement){
    input = e.target;
  }else{
    throw new Error('@param 1 must be input or event');
  }

  // Store value for later manipulation
  let value = input.value.toString();

  // Error message to be set
  let error = '';

  switch(options.type){
    case 'number': {
      value = value.replace(/\D/gi, '');
      break;
    }

    case 'text': {
      value = value.replace(/[^a-zA-Z]/gi, '');
      break;
    }

    case 'time': {
      value = value.replace(/[^\d]/gi, '');

      let h1 = value.slice(0, 1);
      let h2 = value.slice(1, 2);
      let m1 = value.slice(2, 3);
      let m2 = value.slice(3, 4);
      let c = '';

      // Remove colons in wrong positions
      if(h1 === ':') h1 = '';
      if(h2 === ':') h2 = '';
      if(m1 === ':') m1 = '';
      if(m2 === ':') m2 = '';

      if(h1 > 2){
        h1 = '';
      }

      if(h1 == 2 && h2 > 3){ //eslint-disable-line eqeqeq
        h2 = '';
      }

      if(m1 > 5){
        m1 = '';
      }

      if(m1){
        c = ':';
      }

      value = h1+h2+c+m1+m2;

      break;
    }

    default:break;
  }

  if(options.uppercase && !options.lowercase){
    value = value.toUpperCase();
  }

  if(options.lowercase && !options.uppercase){
    value = value.toLowerCase();
  }

  if(options.trim){
    value = value.trim();
  }

  if(options.length && typeof options.length === 'number'){
    options.minLength = options.length;
    options.maxLength = options.length;
  }

  if(options.minLength && typeof options.minLength === 'number' && value.length < options.minLength){
    error = `Input requires a minimum length of ${options.minLength} characters`;
  }

  if(options.maxLength && typeof options.minLength === 'number' && value.length > options.maxLength){
    value = value.substring(0, options.maxLength);
  }

  // Send data to input
  input.setCustomValidity(error);
  input.value = value;
}