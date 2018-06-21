export function parseCapitol(e){
  const value = e.target.value.toUpperCase();
  e.target.value = value;
  return value;
}

export function parseText(e){
  const reg = /[^a-zA-Z]/gi;
  const value = e.target.value.replace(reg, '');
  e.target.value = value;
  return value;
}

export function parseTextCapitol(e){
  const reg = /[^a-zA-Z]/gi;
  const value = e.target.value.replace(reg, '').toUpperCase();
  e.target.value = value;
  return value;
}

export function parseNumber(e){
  const reg = /\D/gi;
  const value = e.target.value.replace(reg, '');
  e.target.value = value;
  return value;
}