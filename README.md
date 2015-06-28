_o()
==========

***

Bond
----------

Bond is the name resolver component for Carbon.io. Bond exposes one operator, ```_o```, that allows for objects to be resolved from names in a variety of namespaces.  

```
_o('./foo/bar/MyModule')
```

```
_o('env:USER')
```

```
_o('mongodb://localhost:27017/mydb')
```

```
_o('http://localhost:8080/api/v1/foo')
```

