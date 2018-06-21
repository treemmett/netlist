import toast from '../components/Toast';

export default function(err){
  if(err.response.data.error){
    err.response.data.error.forEach(toast);
  }
}