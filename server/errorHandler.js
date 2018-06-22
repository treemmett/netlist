const errorCodes = {
  ValidationError: 422
}

module.exports = function(err, req, res, next){
  if(res.headersSent){
    return next(err)
  }

  switch(err.name){
    case 'CastError':
      res.status(422).send({error: err});
      break;

    case 'ValidationError':
      const output = [];
      for(let i in err.errors){
        output.push(err.errors[i].message);
      }
      res.status(422).send({error: output});
      break;

    case 'MongoError':
      if(err.code === 11000){
        res.status(409).send({error: ['An item with that name already exists']});
      }else{
        res.status(500).send({error: [err.message]});
      }
      break;

    default:
      res.status(500).send({error: ['Something went wrong. Please try again later.']});
      break;
  }
}