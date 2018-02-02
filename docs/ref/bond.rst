.. class:: bond
    :heading:

.. |br| raw:: html

   <br />

====
bond
====

Methods
-------

.. class:: bond
    :noindex:
    :hidden:

    .. function:: resolve(path, options)

        :param path: The resource "path". By default, this is assumed to be a module and will be resolved relative to the module passed to :class:`~bond._o`. Environment variables should start with the scheme ``env`` (e.g., ``env:VAR``), HTTP resources should use the ``http`` or ``https`` scheme (e.g., ``http://foo.com/bar``).
        :type path: string
        :param options: undefined
        :type options: Object
        :returns: The resource
        :rtype: \*

        Options to pass to the underlying resolver. This is currently only supported by the HTTP resolver (``CarbonClient``)
