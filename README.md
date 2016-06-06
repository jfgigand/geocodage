
## Git subtrees

To update the different Sysconf layers from their GitHub upstream:
```
git subtree pull -P sysconf.base git@github.com:sysconf/sysconf.base.git master
git subtree pull -P sysconf.gitted git@github.com:sysconf/sysconf.gitted.git master
git subtree pull -P sysconf.textree git@github.com:geonef/sysconf.textree.git master
git subtree pull -P sysconf.nef.common git@github.com:geonef/sysconf.nef.common.git master
git subtree pull -P sysconf.nef.machine ggit:sysconf.nef.machine master
```

To push updates of the different Sysconf layers to their GitHub upstream:
```
git subtree push -P sysconf.base git@github.com:sysconf/sysconf.base.git master
git subtree push -P sysconf.gitted git@github.com:sysconf/sysconf.gitted.git master
git subtree push -P sysconf.textree git@github.com:geonef/sysconf.textree.git master
git subtree push -P sysconf.nef.common git@github.com:geonef/sysconf.nef.common.git master
git subtree push -P sysconf.nef.machine ggit:sysconf.nef.machine master
```

## Authors & history

* By JF Gigand <jf@geonef.fr>. Deployed on 20150314 to http://gitted.io/

