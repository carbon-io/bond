====
Bond
====

Bond is the name resolver component for Carbon.io. Bond exposes one operator,
``_o``, that allows for objects to be resolved from names in a variety of
namespaces.

A namespace is simply a prefix to some string (like the ``scheme`` component of
a URI) that tells ``bond`` which kind of resource you are looking up.

The Module Namespace
--------------------

``_o`` can be used to resolve a module at runtime using the "module" namespace.
The namespace in this case is simply the empty string, making this the default
namespace in ``bond``.  Modules will be resolved relative to the module that
``_o`` is required in.

.. code-block:: js

    var _o = require('carbon-io').bond._o(module)
    var o = require('carbon-io').atom.o(module)
    
    ...

    o({
      _type: _o('SomeType'),
      ...
    })

The HTTP(S) Namespace
---------------------

Simple HTTP(S) resources can be retrieved using ``bond`` by simply passing a URL
to ``_o``. In this case, ``http:`` and ``https:`` are used to determine the
namespace, thereby directing ``bond`` to perform the desired action.

.. code-block:: js

    var _o = require('carbon-io').bond._o(module)
   
    ... 
    var user = _o('https://someapi.com/v1/user/1')
    ...

The Environment Namespace
-------------------------

Finally, environment variables can be retrieved using the ``env`` namespace.


.. code-block:: js

    var _o = require('carbon-io').bond._o(module)
   
    ...
    var shell = _o('env:SHELL')
    ...
