import functools

import six
import perf
import time
import datetime

from chameleon import PageTemplate


BIGTABLE_ZPT = """\
<table xmlns="http://www.w3.org/1999/xhtml"
xmlns:tal="http://xml.zope.org/namespaces/tal">
<tr tal:repeat="row python: options['table']">
<td tal:repeat="c python: row.values()">
<span tal:define="d python: c + 1"
tal:attributes="class python: 'column-' + %s(d)"
tal:content="python: d" />
</td>
</tr>
</table>""" % six.text_type.__name__


def main():
    runner = perf.Runner()
    runner.metadata['description'] = "Chameleon template"

    tmpl = PageTemplate(BIGTABLE_ZPT)
    table = [dict(a=1, b=2, c=3, d=4, e=5, f=6, g=7, h=8, i=9, j=10)
             for x in range(500)]
    options = {'table': table}

    func = functools.partial(tmpl, options=options)

    for i in range(1, 200):
        func()

if __name__ == '__main__':
    ts0 = time.time()
    print(datetime.datetime.fromtimestamp(ts0).strftime('%Y-%m-%d %H:%M:%S'))
    tc0 = perf.perf_counter()
    main()
    ts1 = time.time()
    print(ts1 - ts0)
    print(perf.perf_counter() - tc0)
    print(datetime.datetime.fromtimestamp(ts1).strftime('%Y-%m-%d %H:%M:%S'))
