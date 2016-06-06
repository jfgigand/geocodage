# Sysconf layer for Geonef-owned machines (container and physical)

* Repository URL: git@git.geonef.info:sysconf.nef.machine
* Normally used as a subtree inside a complete Sysconf repository
  (along with sysconf.base and others)

This is :
* PRIVATE to Geonef
* common to all Geonef-managed machines

Provides:
* /root/.ssh/authorized_keys generation
* collectd configuration (no local RRD, only UDP client)

