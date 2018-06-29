import toast from '../components/Toast';

export default function(err){
  if(!err.response){
    return;
  }

  if(!err.response.data.error || !err.response.data.error.length){
    toast('Something went wrong. Please try again later.');
  }

  if(err.response.data.error){
    err.response.data.error.forEach(toast);
  }
}