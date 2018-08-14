const mongoose = require('mongoose');

const headers = {
  applicationOwner: 'Application Owner',
  applications: 'Applications',
  backupDate: 'Last Backup Date',
  cpu: 'CPU',
  disks: 'Disks',
  dnsName: 'DNS Name',
  location$value: 'Location',
  location: 'Location Code',
  maintWin: 'Maintenance Window From',
  maintWinTo: 'Maintenance Window To',
  memory: 'Memory',
  monitoring: 'Monitoring Enabled',
  notes: 'Notes',
  os: 'OS',
  patchDate: 'Last Patch Date',
  purpose$value: 'Purpose',
  purpose: 'Purpose Code',
  serverName: 'Server Name',
  serverSmes: 'SME\'s',
  serverType: 'Server Type',
  retired: 'Retired',
  updatedBy: 'Last Updated By',
  url: 'URL',
  virtualization: 'Virtualization',
  vlan: 'VLAN'
}

const serverSchema = mongoose.Schema({
  applicationOwner: {type: String, trim: true},
  applications: [{type: String}],
  backupDate: {type: String, trim: true},
  cpu: {type: String, trim: true},
  disks: {type: String, trim: true},
  dnsName: {type: String, trim: true},
  location: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 3,
    uppercase: true,
    validate: {
      validator: function(v){
        return /^[a-zA-Z]{3}$/.test(v);
      },
      message: 'Only A-Z characters are allowed for location'
    }
  },
  maintWin: {type: String, trim: true},
  maintWinTo: {type: String, trim: true},
  memory: {type: String, trim: true},
  monitoring: Boolean,
  notes: {type: String, trim: true},
  os: {type: String, trim: true},
  patchDate: {type: String, trim: true},
  purpose: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 2,
    validate: {
      validator: v => {
        return /^\d{2}$/.test(v)
      },
      message: 'Purpose is not a number'
    }
  },
  serverName: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    uppercase: true,
  },
  serverSmes: {type: [String], trim: true},
  serverType: {
    type: String,
    enum: ['appliance', 'server'],
    trim: true
  },
  retired: {type: Boolean},
  updatedBy: {type: String, trim: true},
  url: {type: String, trim: true},
  virtualization: {
    type: String,
    enum: ['physical', 'virtual', 'cloud'],
    trim: true
  },
  vlan: {type: String, trim: true}
},
{
  toObject: {
    transform: function(doc, ret){
      // Rname _id to id
      ret.id = ret._id;
      delete ret._id;
    }
  },
  toJSON: {
    transform: function(doc, ret){
      // Rname _id to id
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

serverSchema.pre('findOneAndUpdate', function(next){
  this.options.runValidators = true;
  next();
});

const Server = mongoose.model('Server', serverSchema);

module.exports = {
  keys: headers,
  schema: Server
}