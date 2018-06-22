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

  if(options.type === 'text'){
    value = value.replace(/[^a-zA-Z]/gi, '');
  }else if(options.type === 'number'){
    value = value.replace(/\D/gi, '');
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