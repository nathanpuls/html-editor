"""Shared prompt/demo contract. Run from any directory; no dependencies."""
from pathlib import Path
from html.parser import HTMLParser
import re
root = Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.nodes=[]; self.stack=[]
    def handle_starttag(self, tag, attrs):
        node={'tag':tag,'attrs':dict(attrs),'parent':self.stack[-1] if self.stack else None}
        self.nodes.append(node)
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append(node)
    def handle_endtag(self,tag):
        for index in range(len(self.stack)-1,-1,-1):
            if self.stack[index]['tag']==tag:
                del self.stack[index:];break
doc=Document(); html=(root/'top-editor/demo.html').read_text();doc.feed(html)
labels=[n['attrs']['data-edit'] for n in doc.nodes if 'data-edit' in n['attrs']]
assert len(labels)>120 and len(labels)==len(set(labels)), 'Missing or duplicate selection labels'
ids=[n['attrs']['id'] for n in doc.nodes if 'id' in n['attrs']]
assert len(ids)==len(set(ids)), 'Duplicate IDs'
for n in doc.nodes:
    a=n['attrs']
    assert not any(k in a for k in ('data-label','data-section','data-edit-collection'))
    assert a.get('data-edit')!='links', 'Reserved link collection'
    if n['tag'] in ('a','input','textarea','img','svg'): assert 'data-edit' in a
    for key in ('for','aria-labelledby','aria-describedby'):
        for ref in a.get(key,'').split(): assert ref in ids, (key,ref)
    if 'data-lucide' in a:
        assert re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',a['data-lucide'])
        assert a.get('stroke')=='currentColor' and a.get('viewbox')
groups={}
for n in doc.nodes:
    if 'data-edit-group' in n['attrs']: groups.setdefault(n['attrs']['data-edit-group'],[]).append(n)
assert len(groups['service-cards'])==3
assert len(groups['service-headings'])==3
assert len(groups['resource-links'])==2
assert all(n['parent'] is groups['service-cards'][0]['parent'] for n in groups['service-cards'])
assert 'color-mix(in srgb,var(--accent)' in html
assert all(kind in html for kind in ('type="search"','type="email"','<textarea','<table','<details','<blockquote'))
prompt=(root/'new-page/prompt.txt').read_text()
assert prompt.count('{{WEBSITE_BRIEF}}')==1
assert '<script src="https://edit.built.at" defer></script>' in prompt
assert 'data-edit-group' in prompt and 'color-mix()' in prompt
print(f'PASS shared contract: {len(labels)} unique editable elements, {len(groups)} explicit groups, valid references and required fixtures')
