const servers = require('express').Router();

servers.get('/', (req, res, next) => {
  const exampleData = [
    {
      applications: ['Avaya', 'DHCP'],
      backupDate: '2018-06-14',
      cpu: '2',
      disks: '4',
      dnsName: 'dca21001.domain.net',
      maintWin: '2300 - 0500',
      memory: '32GB',
      monitoring: true,
      os: 'Windows Server 2012',
      owner: 'Network Team',
      patchDate: '2018-06-02',
      serverName: 'DCA21001',
      server_type: 'server',
      updatedBy: 'John Doe',
      virtualization: 'virtual',
      vlan: '221'
    },
    {
      applications: ['LDAP'],
      backupDate: '2018-06-10',
      cpu: '2',
      disks: '4',
      dnsName: 'dca21002.domain.net',
      maintWin: '0000 - 0700',
      memory: '32GB',
      monitoring: true,
      os: 'Windows Server 2012',
      owner: 'Systems',
      patchDate: '2018-06-04',
      serverName: 'DCA21002',
      server_type: 'server',
      updatedBy: 'John Doe',
      virtualization: 'physical',
      vlan: '221'
    },
  ];
  
  res.send(exampleData);
});
servers.all('/', (req, res, next) => res.set('Allow', 'GET').status(405).end());

module.exports = servers;